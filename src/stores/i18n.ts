import { createStore } from '@stencil/store';
import { bestLocale } from '../helpers/best-locale';

type PluralType = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
type TranslationStore = Record<string, string>;

export interface TranslatorOptions {
  availableLocales?: readonly string[];
  defaultLocale?: string;
  interpolateValues?: (str: string, interpolations: Record<string, string>) => string;
  keyWithPlural?: (key: string, pluralType: PluralType) => string;
  locale?: string;
  localeList?: readonly string[];
  missingKey?: (key: string, translations: TranslationStore) => void;
  pluralFor: (number: number) => PluralType;
  translationForMissingKey?: (key: string, translations: TranslationStore) => string;
  translations: TranslationStore;
}

const defaultOptions: Required<Omit<TranslatorOptions, 'pluralFor' | 'translations'>> = {
  availableLocales: ['en'],
  defaultLocale: 'en',
  interpolateValues: (str: string, interpolations: Record<string, string>): string =>
    str
      .replace(/\{([^}\s]+?)\}/, (match, id, offset) =>
        str.charAt(offset - 1) === '\\' ? match : interpolations[id]
      )
      .replace('\\{', '{'),
  keyWithPlural: (key: string, pluralType: PluralType) => `${key}.${pluralType}`,
  locale: 'en',
  localeList: typeof navigator === 'undefined' ? ['en'] : navigator.languages ?? ['en'],
  missingKey: () => {},
  translationForMissingKey: key => `***${key}***`,
};

const fillOptions = (options: TranslatorOptions): Required<TranslatorOptions> => {
  const fullOptions = {
    ...defaultOptions,
    ...options,
  };

  fullOptions.defaultLocale = options.defaultLocale ?? fullOptions.availableLocales[0] ?? 'en';

  fullOptions.locale =
    options.locale ??
    bestLocale(fullOptions.localeList, fullOptions.availableLocales, fullOptions.defaultLocale);

  return fullOptions;
};

export const createI18nStore = (givenOptions: TranslatorOptions) => {
  const store = createStore(fillOptions(givenOptions));

  let translations = createStore(givenOptions.translations);

  const loadTranslations = (newTranslations: Record<string, string>) => {
    translations = createStore(newTranslations);
  };

  const addTranslations = (newTranslations: Record<string, string>) => {
    loadTranslations({
      ...translations.state,
      ...newTranslations,
    });
  };

  const onLocaleChanged = cb => store.onChange('locale', cb);

  const translate = (
    key: string,
    interpolations: Record<string, string> = {},
    magicNumber?: number
  ): string => {
    const { get } = store;
    if (magicNumber !== undefined) {
      const pluralType = get('pluralFor')(magicNumber);
      key = get('keyWithPlural')(key, pluralType);
    }

    if (key in translations.state) {
      const translatedValue = translations.get(key);

      return get('interpolateValues')(translatedValue, interpolations);
    }

    get('missingKey')(key, translations.state);

    return get('translationForMissingKey')(key, translations.state);
  };

  return {
    addTranslations,
    loadTranslations,
    onLocaleChanged,
    translate,
    store,
  };
};
