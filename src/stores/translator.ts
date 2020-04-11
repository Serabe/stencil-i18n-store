// import { createStore } from "@stencil/store";
import { TranslationStore } from "./translation";

type PluralType = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

interface TranslatorOptions {
  interpolateValues?: (str: string, interpolations: Record<string, string>) => string;
  keyWithPlural?: (key: string, pluralType: PluralType) => string;
  missingKey?: (key: string, translations: TranslationStore) => void;
  pluralFor: (number: number) => PluralType;
  translationForMissingKey?: (key: string, translations: TranslationStore) => string;
  translations: TranslationStore;
}

const defaultOptions: Required<Omit<TranslatorOptions, 'pluralFor' | 'translations'>> = {
  interpolateValues: (str: string, interpolations: Record<string, string>): string => (
    str.replace(/\{([^}\s]+?)\}/, (match, id, offset) => (
      (str.charAt(offset - 1) === '\\')
        ? match
        : interpolations[id]
    )).replace('\\{', '{')
  ),
  keyWithPlural: (key: string, pluralType: PluralType) => `${key}.${pluralType}`,
  missingKey: () => { },
  translationForMissingKey: (key) => `***${key}***`,
}

export const createTranslator = (givenOptions: TranslatorOptions) => {
  const options: Required<TranslatorOptions> = {
    ...defaultOptions,
    ...givenOptions,
  };

  return {
    translate: (
      key: string,
      interpolations: Record<string, string> = {},
      magicNumber?: number
    ): string => {
      const { translations } = options;
      if (magicNumber !== undefined) {
        const pluralType = options.pluralFor(magicNumber);
        key = options.keyWithPlural(key, pluralType);
      }
      const translatedValue = translations.get(key);

      if (translatedValue === undefined) {
        options.missingKey(key, translations)

        return options.translationForMissingKey(key, translations);
      }

      return options.interpolateValues(translatedValue, interpolations);
    },
  };
};
