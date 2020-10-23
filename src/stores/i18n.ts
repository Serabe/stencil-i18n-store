import { Build, getAssetPath } from '@stencil/core';
import { bestLocale } from '../helpers/best-locale';
import { createLocale } from './locale';
import { TranslatorOptions, PluralType, TranslateFn } from './types';

const fetchLocale = Build.isTesting
  ? async () => ({})
  : async (locale: string): Promise<Record<string, string>> =>
      (await fetch(getAssetPath(`/assets/locales/${locale}.json`))).json();

const defaultOptions: Required<TranslatorOptions> = {
  availableLocales: ['en'],
  defaultLocale: 'en',
  fetchLocale,
  interpolateValues: (str: string, interpolations: Record<string, string>): string =>
    str
      .replace(/\{([^}\s]+?)\}/g, (match, id, offset) =>
        str.charAt(offset - 1) === '\\' ? match : interpolations[id]
      )
      .replace('\\{', '{'),
  keyWithPlural: (_, key: string, pluralType: PluralType) => `${key}.${pluralType}`,
  locale: 'en',
  localeList: typeof navigator === 'undefined' ? ['en'] : navigator.languages ?? ['en'],
  pluralFor: (locale: string, n: number) => new Intl.PluralRules(locale).select(n),
  translations: {},
  translationForMissingKey: (_, key) => `***${key}***`,
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

  let translations = givenOptions.translations ?? {};

  const loadTranslations = (newTranslations: Record<string, string>) => {
    translations = newTranslations;
  };

  const addTranslations = (newTranslations: Record<string, string>) => {
    loadTranslations({
      ...translations,
      ...newTranslations,
    });
  };

  const hasKey = (key: string) => key in translations;

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

  const translate: TranslateFn = (
    key: string,
    intOrNumber?: Record<string, string> | number,
    maybeMagicNumber?: number
  ): string => {
    const currentLocale = locale.get();

    const [interpolations, magicNumber] =
      typeof intOrNumber === 'number' ? [{}, intOrNumber] : [intOrNumber, maybeMagicNumber];

    if (magicNumber !== undefined) {
      const pluralType = options.pluralFor(currentLocale, magicNumber);
      key = options.keyWithPlural(currentLocale, key, pluralType);
    }

    if (key in translations) {
      const translatedValue = translations[key];

      return options.interpolateValues(translatedValue, interpolations);
    }

    return options.translationForMissingKey(currentLocale, key, translations);
  };

  return {
    /**
     * Add translations without removing the previous set (though it might override).
     */
    addTranslations,

    /**
     * Check if a key is present in the loaded translations.
     */
    hasKey,

    /**
     * Loads the new set of translations removing the previous set.
     */
    loadTranslations,

    /**
     * Current locale store.
     */
    locale,

    /**
     * Translates the given key with the given interpolations.
     *
     * It can also pluralize.
     */
    translate,

    /**
     * Promise resolved when the first set of translations are loaded.
     *
     * When top-level awaits are better supported, this will go.
     */
    waitUntilReady,
  };
};
