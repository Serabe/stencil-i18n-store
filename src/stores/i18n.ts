import { getAssetPath } from '@stencil/core';
import { createStore } from '@stencil/store';
import { bestLocale } from '../helpers/best-locale';
import { createLocale } from './locale';

type PluralType = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
type TranslationStore = Record<string, string>;

export interface TranslatorOptions {
  availableLocales?: readonly string[];
  defaultLocale?: string;
  fetchLocale?: (locale: string) => Promise<Record<string, string>>;
  interpolateValues?: (str: string, interpolations: Record<string, string>) => string;
  keyWithPlural?: (key: string, pluralType: PluralType) => string;
  locale?: string;
  localeList?: readonly string[];
  missingKey?: (key: string, translations: TranslationStore) => void;
  pluralFor: (number: number) => PluralType;
  translationForMissingKey?: (key: string, translations: TranslationStore) => string;
  translations?: TranslationStore;
}

const defaultOptions: Required<Omit<TranslatorOptions, 'pluralFor'>> = {
  availableLocales: ['en'],
  defaultLocale: 'en',
  fetchLocale: async (locale: string): Promise<Record<string, string>> => {
    const response = await fetch(getAssetPath(`/assets/locales/${locale}.json`));
    return response.json();
  },
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
  translations: {},
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
  const options = fillOptions(givenOptions);

  let translations = createStore(givenOptions.translations ?? {});

  const loadTranslations = (newTranslations: Record<string, string>) => {
    translations = createStore(newTranslations);
  };

  const addTranslations = (newTranslations: Record<string, string>) => {
    loadTranslations({
      ...translations.state,
      ...newTranslations,
    });
  };

  const hasKey = (key: string) => key in translations.state;

  const locale = createLocale(options.locale, async newLocale => {
    loadTranslations(await options.fetchLocale(newLocale));
  });

  // Fetch initial translation
  // Luckily, better support for top-level await
  // will arrive soon and we won't need this.
  const waitUntilReady: Promise<void> = (() => {
    if (Object.keys(givenOptions.translations ?? {}).length === 0) {
      return locale.set(locale.get(), true);
    }
  })();

  const translate = (
    key: string,
    interpolations: Record<string, string> = {},
    magicNumber?: number
  ): string => {
    // Subscribe to current locale value
    locale.get();

    if (magicNumber !== undefined) {
      const pluralType = options.pluralFor(magicNumber);
      key = options.keyWithPlural(key, pluralType);
    }

    if (key in translations.state) {
      const translatedValue = translations.get(key);

      return options.interpolateValues(translatedValue, interpolations);
    }

    options.missingKey(key, translations.state);

    return options.translationForMissingKey(key, translations.state);
  };

  return {
    addTranslations,
    hasKey,
    loadTranslations,
    locale,
    translate,
    waitUntilReady,
  };
};
