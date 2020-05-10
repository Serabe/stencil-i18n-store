import 'jest-fetch-mock';
import { createI18nStore } from './i18n';

const pluralFor = number => {
  switch (number) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
    default:
      return 'other';
  }
};

describe('translate', () => {
  it('returns the value in the translation store', async () => {
    const { translate } = await createI18nStore({
      pluralFor,
      translations: {
        'WADUS.MY.KEY': 'My translation',
      },
    });

    expect(translate('WADUS.MY.KEY')).toBe('My translation');
  });

  it('returns the missing key surrounded by asterisks on each side by default', async () => {
    const { translate } = await createI18nStore({
      pluralFor,
      translations: { key: 'value' },
    });

    expect(translate('DARK.SIDE')).toBe('***DARK.SIDE***');
  });

  it('calls translationForMissingKey and returns its value if key is not found', async () => {
    const key = 'THIS.KEY.DOES.NOT.EXIST';
    const translation = 'Mahna mahna';
    const translationForMissingKey = jest.fn().mockReturnValue(translation);
    const translations = { key: 'value' };
    const { translate } = await createI18nStore({
      pluralFor,
      translations,
      translationForMissingKey,
    });

    expect(translate(key)).toBe(translation);

    expect(translationForMissingKey).toHaveBeenCalledTimes(1);
    expect(translationForMissingKey).toHaveBeenCalledWith(key, translations);
  });

  it('calls missing key if the key is not found', async () => {
    const key = 'THIS.KEY.DOES.NOT.EXIST';
    const missingKey = jest.fn();
    const translations = { key: 'value' };
    const { translate } = await createI18nStore({
      pluralFor,
      missingKey,
      translations,
    });

    translate(key);

    expect(missingKey).toHaveBeenCalledTimes(1);
    expect(missingKey).toHaveBeenCalledWith(key, translations);
  });

  it('interpolates values inside curly braces by default', async () => {
    const { translate } = await createI18nStore({
      pluralFor,
      translations: {
        KEY: 'Hello, {name}',
      },
    });

    expect(translate('KEY', { name: 'Sergio' })).toBe('Hello, Sergio');
    expect(translate('KEY', { name: 'Manu' })).toBe('Hello, Manu');
  });

  it('does not interpolate if the first curly brace has a \\ before it', async () => {
    const { translate } = await createI18nStore({
      pluralFor,
      translations: {
        KEY: 'Hello, \\{name}',
      },
    });

    expect(translate('KEY', { name: 'Sergio' })).toBe('Hello, {name}');
  });

  it('does not interpolate if there is a space inside the curly braces', async () => {
    const { translate } = await createI18nStore({
      pluralFor,
      translations: {
        KEY: 'Hello, {my name}',
      },
    });

    expect(translate('KEY', { 'my name': 'Sergio' })).toBe('Hello, {my name}');
  });

  it('calls pluralFor if a magic number is passed', async () => {
    const pluralFor = jest.fn().mockReturnValue('few');

    const { translate } = await createI18nStore({
      pluralFor,
      translations: {
        KEY: 'Hello, {name}',
      },
    });

    translate('KEY', {}, 2);

    expect(pluralFor).toHaveBeenCalledTimes(1);
    expect(pluralFor).toHaveBeenCalledWith(2);
  });

  it('calls keyWithPlural with key and pluralType returned by pluralFor if a given magic number is passed', async () => {
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = await createI18nStore({
      keyWithPlural,
      pluralFor,
      translations: {
        KEY: 'Hello, {name}',
      },
    });

    translate('KEY', {}, 2);

    expect(keyWithPlural).toHaveBeenCalledTimes(1);
    expect(keyWithPlural).toHaveBeenCalledWith('KEY', 'other');
  });

  it('uses the key returned by keyWithPlural if one is found', async () => {
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = await createI18nStore({
      keyWithPlural,
      pluralFor,
      translations: {
        'KEY.zero': 'Sorry',
        'KEY.one': 'Ciao',
        'KEY.other': 'Hello',
      },
    });

    expect(translate('KEY', {}, 2)).toBe('Hello');
  });

  it('still interpolates given a magic number', async () => {
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = await createI18nStore({
      keyWithPlural,
      pluralFor,
      translations: {
        'KEY.zero': 'Sorry, {name}',
        'KEY.one': 'Ciao, {name}',
        'KEY.other': 'Hello, {name}',
      },
    });

    expect(translate('KEY', { name: 'Sergio' }, 2)).toBe('Hello, Sergio');
  });
});

describe('loadTranslations', () => {
  test('overrides old translations', async () => {
    const { loadTranslations, translate } = await createI18nStore({
      pluralFor,
      translations: {
        'WADUS.MY.KEY': 'My translation',
      },
    });

    loadTranslations({
      'WADUS.MY.KEY': 'My new translation',
    });

    expect(translate('WADUS.MY.KEY')).toBe('My new translation');
  });

  test('adds new translations', async () => {
    const { loadTranslations, translate } = await createI18nStore({
      pluralFor,
      translations: {
        'WADUS.MY.OLD.KEY': 'My translation',
      },
    });

    loadTranslations({
      'WADUS.MY.NEW.KEY': 'My new translation',
    });

    expect(translate('WADUS.MY.NEW.KEY')).toBe('My new translation');
  });

  test('removes old translations', async () => {
    const { loadTranslations, translate } = await createI18nStore({
      pluralFor,
      translationForMissingKey(key) {
        return `Missing key: ${key}`;
      },
      translations: {
        'WADUS.MY.OLD.KEY': 'My translation',
      },
    });

    loadTranslations({
      'WADUS.MY.NEW.KEY': 'My new translation',
    });

    expect(translate('WADUS.MY.OLD.KEY')).toBe('Missing key: WADUS.MY.OLD.KEY');
  });
});

describe('addTranslations', () => {
  test('overrides old translations', async () => {
    const { addTranslations, translate } = await createI18nStore({
      pluralFor,
      translations: {
        'WADUS.MY.KEY': 'My translation',
      },
    });

    addTranslations({
      'WADUS.MY.KEY': 'My new translation',
    });

    expect(translate('WADUS.MY.KEY')).toBe('My new translation');
  });

  test('adds new translations', async () => {
    const { addTranslations, translate } = await createI18nStore({
      pluralFor,
      translations: {
        'WADUS.MY.OLD.KEY': 'My translation',
      },
    });

    addTranslations({
      'WADUS.MY.NEW.KEY': 'My new translation',
    });

    expect(translate('WADUS.MY.NEW.KEY')).toBe('My new translation');
  });

  test('keeps old translations', async () => {
    const { addTranslations, translate } = await createI18nStore({
      pluralFor,
      translations: {
        'WADUS.MY.OLD.KEY': 'My translation',
      },
    });

    addTranslations({
      'WADUS.MY.NEW.KEY': 'My new translation',
    });

    expect(translate('WADUS.MY.OLD.KEY')).toBe('My translation');
  });
});

describe('locale', () => {
  beforeEach(() => {
    fetchMock.mockResponse('{}');
  });

  test('if locale is passed as option, that one is the locale', async () => {
    const { store } = await createI18nStore({
      pluralFor,
      translations: {},
      availableLocales: ['en', 'es'],
      defaultLocale: 'es',
      locale: 'pt',
      localeList: ['es', 'en'],
    });

    expect(store.state.locale).toBe('pt');
  });

  test('guess from options which is the best locale', async () => {
    const { store } = await createI18nStore({
      pluralFor,
      translations: {},
      availableLocales: ['en', 'es'],
      defaultLocale: 'pt',
      localeList: ['es', 'en'],
    });

    expect(store.state.locale).toBe('es');
  });

  test('guess from options which is the best locale', async () => {
    const { store } = await createI18nStore({
      pluralFor,
      translations: {},
      availableLocales: ['en', 'es'],
      defaultLocale: 'pt',
      localeList: ['es', 'en'],
    });

    expect(store.state.locale).toBe('es');
  });

  test('if defaultLocale is not passed, take the first from the availableLocales array', async () => {
    const { store } = await createI18nStore({
      pluralFor,
      translations: {},
      availableLocales: ['fr', 'en', 'es'],
      localeList: ['es', 'en'],
    });

    expect(store.state.defaultLocale).toBe('fr');
  });

  test('if defaultLocale is not passed and there are no availableLocales, use "en"', async () => {
    const { store } = await createI18nStore({
      pluralFor,
      translations: {},
      availableLocales: [],
      localeList: ['es', 'en'],
    });

    expect(store.state.defaultLocale).toBe('en');
  });
});

describe('fetchTranslations', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify({}));
  });

  test('it is not called if some translations are passed in', async () => {
    await createI18nStore({
      pluralFor,
      translations: {
        KEY: 'Sorry',
      },
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  test('it is called if no translations are passed in', async () => {
    fetchMock.mockResponse(JSON.stringify({ key: 'hello, {name}' }));
    const { translate, waitUntilReady } = await createI18nStore({
      pluralFor,
      translations: {},
    });
    await waitUntilReady;

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(translate('key', { name: 'Sergio' })).toBe('hello, Sergio');
  });

  test('it is called when locale changes', async () => {
    fetchMock.mockResponses(
      JSON.stringify({ key: 'hello, {name}' }),
      JSON.stringify({ key: 'hola, {name}' })
    );
    const { translate, store, waitUntilReady } = await createI18nStore({
      pluralFor,
      translations: {},
    });
    await waitUntilReady;

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(translate('key', { name: 'Sergio' })).toBe('hello, Sergio');

    store.state.locale = 'es';

    await forCondition(() => fetch['mock'].calls.length === 2);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(translate('key', { name: 'Sergio' })).toBe('hola, Sergio');
  });
});

function forCondition(predicate: () => boolean): Promise<void> {
  return new Promise(resolve => {
    const id = setInterval(() => {
      if (predicate()) {
        clearInterval(id);
        resolve();
      }
    }, 5);
  });
}
