export const bestLocale: (
  localeList: ReadonlyArray<string>,
  availableLocales?: ReadonlyArray<string>,
  defaultLocale?: string
) => string = (
  localeList: ReadonlyArray<string>,
  availableLocales: ReadonlyArray<string>,
  defaultLocale: string
): string => {
  for (const locale of localeList) {
    if (availableLocales.includes(locale)) {
      return locale;
    }

    if (locale.length === 2) {
      continue;
    }

    const regionNeutralLocale = locale.substr(0, 2);
    if (availableLocales.includes(regionNeutralLocale)) {
      return regionNeutralLocale;
    }
  }

  return defaultLocale;
};
