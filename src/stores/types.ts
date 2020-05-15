/**
 * The expected return values from plurarFor function.
 *
 * The string type in the end is only added to ease when
 * using standard APIs.
 */
export type PluralType = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' | string;
export type TranslationStore = Record<string, string>;

export interface TranslatorOptions {
  /**
   * List of available locales for the application.
   */
  availableLocales?: readonly string[];

  /**
   * Locale to use when a better one could not be
   * determined.
   */
  defaultLocale?: string;

  /**
   * Given a locale, the way to obtain translations
   * for it.
   *
   * @example
   * ```ts
   * const config = {
   *   fetchLocale: locale => fetch(getAssetPath(pathFor(locale)))
   * }
   * ```
   */
  fetchLocale?: (locale: string) => Promise<Record<string, string>>;
  /**
   * How to interpolate the values in the given string.
   *
   * @example
   * ```ts
   * const config = {
   *   interpolateValues: (str, interpolations) => {
   *     return str.replace(/@@(.*?)@@/, (, match) => interpolations[match]);
   *   }
   * }
   * ```
   */
  interpolateValues?: (str: string, interpolations: Record<string, string>) => string;

  /**
   * Given a key and a plural type, returns the key with the right
   * translation for the given plural.
   *
   * @example
   * ```ts
   * const config = {
   *  keyWithPlural: (key, pluralType) => `${key}.${pluralType}`;
   * }
   * ```
   */
  keyWithPlural?: (locale: string, key: string, pluralType: PluralType) => string;

  /**
   * Locale to use. If passed, it will be used over the best fit
   * for the available locales and locale list.
   */
  locale?: string;

  /**
   * List of possible locales to use for current user.
   * If not locale is passed, the locale will be determined by
   * availableLocales, defaultLocale, and localeList.
   */
  localeList?: readonly string[];

  /**
   * Callback called when a key is not presents in the translations.
   *
   * @example
   * ```ts
   * const config = {
   *   missingKey: (locale, key, translations) => {
   *     sendBeacon(`/translations/${locale}/error/${key}`);
   *   }
   * }
   */
  missingKey?: (locale: string, key: string, translations: TranslationStore) => void;

  /**
   * Returns the plural type for the given number.
   */
  pluralFor: (locale: string, number: number) => PluralType;

  /**
   * Return the translation to use when the key is not in
   * the loaded translations.
   */
  translationForMissingKey?: (
    locale: string,
    key: string,
    translations: TranslationStore
  ) => string;

  /**
   * An initial set of translations can be passed. If you chose to do
   * so, the initial fetch won't happen.
   */
  translations?: TranslationStore;
}
