import { createTranslator } from "./translator";
import { createTranslationStore } from "./translation";

const pluralFor = number => {
  switch (number) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
    default:
      return 'other';
  }
}

describe("translate", () => {
  it("returns the value in the translation store", () => {
    const { translate } = createTranslator({
      pluralFor,
      translations: createTranslationStore({
        'WADUS.MY.KEY': 'My translation'
      })
    });

    expect(translate('WADUS.MY.KEY')).toBe('My translation');
  });

  it('returns the missing key surrounded by asterisks on each side by default', () => {
    const { translate } = createTranslator({
      pluralFor,
      translations: createTranslationStore({})
    });

    expect(translate('DARK.SIDE')).toBe('***DARK.SIDE***');
  });

  it('calls translationForMissingKey and returns its value if key is not found', () => {
    const key = 'THIS.KEY.DOES.NOT.EXIST';
    const translation = "Mahna mahna";
    const translationForMissingKey = jest.fn().mockReturnValue(translation);
    const translations = createTranslationStore({});
    const { translate } = createTranslator({
      pluralFor,
      translations,
      translationForMissingKey,
    });

    expect(translate(key)).toBe(translation);

    expect(translationForMissingKey).toHaveBeenCalledTimes(1);
    expect(translationForMissingKey).toHaveBeenCalledWith(key, translations);
  });

  it('calls missing key if the key is not found', () => {
    const key = 'THIS.KEY.DOES.NOT.EXIST';
    const missingKey = jest.fn();
    const translations = createTranslationStore({});
    const { translate } = createTranslator({
      pluralFor,
      missingKey,
      translations,
    });

    translate(key);

    expect(missingKey).toHaveBeenCalledTimes(1);
    expect(missingKey).toHaveBeenCalledWith(key, translations);
  });

  it('interpolates values inside curly braces by default', () => {
    const { translate } = createTranslator({
      pluralFor,
      translations: createTranslationStore({
        'KEY': 'Hello, {name}'
      })
    });

    expect(translate('KEY', { name: 'Sergio' })).toBe('Hello, Sergio');
    expect(translate('KEY', { name: 'Manu' })).toBe('Hello, Manu');
  });

  it('does not interpolate if the first curly brace has a \\ before it', () => {
    const { translate } = createTranslator({
      pluralFor,
      translations: createTranslationStore({
        'KEY': 'Hello, \\{name}'
      }),
    });

    expect(translate('KEY', { name: 'Sergio' })).toBe('Hello, {name}');
  });

  it('does not interpolate if there is a space inside the curly braces', () => {
    const { translate } = createTranslator({
      pluralFor,
      translations: createTranslationStore({
        'KEY': 'Hello, {my name}'
      })
    });

    expect(translate('KEY', { 'my name': 'Sergio' })).toBe('Hello, {my name}');
  });

  it('calls pluralFor if a magic number is passed', () => {
    const pluralFor = jest.fn().mockReturnValue('few');

    const { translate } = createTranslator({
      pluralFor,
      translations: createTranslationStore({
        'KEY': 'Hello, {name}'
      }),
    });

    translate('KEY', {}, 2);

    expect(pluralFor).toHaveBeenCalledTimes(1);
    expect(pluralFor).toHaveBeenCalledWith(2);
  });

  it('calls keyWithPlural with key and pluralType returned by pluralFor if a given magic number is passed', () => {
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = createTranslator({
      keyWithPlural,
      pluralFor,
      translations: createTranslationStore({
        'KEY': 'Hello, {name}'
      }),
    });

    translate('KEY', {}, 2);

    expect(keyWithPlural).toHaveBeenCalledTimes(1);
    expect(keyWithPlural).toHaveBeenCalledWith('KEY', 'other');
  });

  it('uses the key returned by keyWithPlural if one is found', () => {
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = createTranslator({
      keyWithPlural,
      pluralFor,
      translations: createTranslationStore({
        'KEY.zero': 'Sorry',
        'KEY.one': 'Ciao',
        'KEY.other': 'Hello',
      }),
    });

    expect(translate('KEY', {}, 2)).toBe('Hello');
  });

  it('still interpolates given a magic number', () => {
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = createTranslator({
      keyWithPlural,
      pluralFor,
      translations: createTranslationStore({
        'KEY.zero': 'Sorry, {name}',
        'KEY.one': 'Ciao, {name}',
        'KEY.other': 'Hello, {name}',
      }),
    });

    expect(translate('KEY', { name: 'Sergio' }, 2)).toBe('Hello, Sergio');
  });
});
