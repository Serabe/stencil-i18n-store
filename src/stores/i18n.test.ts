import 'jest-fetch-mock';
import { createI18nStore as createI18nOriginalStore } from './i18n';

describe('translate', () => {
  it('returns the value in the translation store', async () => {
    const { translate } = await createI18nStore({
      translations: {
        'WADUS.MY.KEY': 'My translation',
      },
    });

    expect(translate('WADUS.MY.KEY')).toBe('My translation');
  });

  it('returns the missing key surrounded by asterisks on each side by default', async () => {
    const { translate } = await createI18nStore({
      translations: { key: 'value' },
    });

    expect(translate('DARK.SIDE')).toBe('***DARK.SIDE***');
  });

  it('calls translationForMissingKey and returns its value if key is not found', async () => {
    const locale = 'pt';
    const key = 'THIS.KEY.DOES.NOT.EXIST';
    const translation = 'Mahna mahna';
    const translationForMissingKey = jest.fn().mockReturnValue(translation);
    const translations = { key: 'value' };
    const { translate } = await createI18nStore({
      locale,
      translations,
      translationForMissingKey,
    });

    expect(translate(key)).toBe(translation);

    expect(translationForMissingKey).toHaveBeenCalledTimes(1);
    expect(translationForMissingKey).toHaveBeenCalledWith(locale, key, translations);
  });

  it('interpolates values inside curly braces by default', async () => {
    const { translate } = await createI18nStore({
      translations: {
        KEY: 'Hello, {name}',
      },
    });

    expect(translate('KEY', { name: 'Sergio' })).toBe('Hello, Sergio');
    expect(translate('KEY', { name: 'Manu' })).toBe('Hello, Manu');
  });

  it('does not interpolate if the first curly brace has a \\ before it', async () => {
    const { translate } = await createI18nStore({
      translations: {
        KEY: 'Hello, \\{name}',
      },
    });

    expect(translate('KEY', { name: 'Sergio' })).toBe('Hello, {name}');
  });

  it('does not interpolate if there is a space inside the curly braces', async () => {
    const { translate } = await createI18nStore({
      translations: {
        KEY: 'Hello, {my name}',
      },
    });

    expect(translate('KEY', { 'my name': 'Sergio' })).toBe('Hello, {my name}');
  });

  it('calls pluralFor if a magic number is passed', async () => {
    const locale = 'zh';
    const pluralFor = jest.fn().mockReturnValue('few');

    const { translate } = await createI18nStore({
      locale,
      pluralFor,
      translations: {
        KEY: 'Hello, {name}',
      },
    });

    translate('KEY', {}, 2);

    expect(pluralFor).toHaveBeenCalledTimes(1);
    expect(pluralFor).toHaveBeenCalledWith(locale, 2);
  });

  it('calls keyWithPlural with key and pluralType returned by pluralFor if a given magic number is passed', async () => {
    const locale = 'it';
    const pluralFor = jest.fn().mockReturnValue('other');
    const keyWithPlural = jest.fn().mockReturnValue('KEY.other');

    const { translate } = await createI18nStore({
      locale,
      keyWithPlural,
      pluralFor,
      translations: {
        KEY: 'Hello, {name}',
      },
    });

    translate('KEY', {}, 2);

    expect(keyWithPlural).toHaveBeenCalledTimes(1);
    expect(keyWithPlural).toHaveBeenCalledWith(locale, 'KEY', 'other');
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
      translationForMissingKey(_, key) {
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

describe('locale option', () => {
  beforeEach(() => {
    fetchMock.mockResponse('{}');
  });

  test('if locale is passed as option, that one is the locale', async () => {
    const { locale } = await createI18nStore({
      translations: {},
      availableLocales: ['en', 'es'],
      defaultLocale: 'es',
      locale: 'pt',
      localeList: ['es', 'en'],
    });

    expect(locale.get()).toBe('pt');
  });

  test('guess from options which is the best locale', async () => {
    const { locale } = await createI18nStore({
      translations: {},
      availableLocales: ['en', 'es'],
      defaultLocale: 'pt',
      localeList: ['es', 'en'],
    });

    expect(locale.get()).toBe('es');
  });

  test('guess from options which is the best locale', async () => {
    const { locale } = await createI18nStore({
      translations: {},
      availableLocales: ['en', 'es'],
      defaultLocale: 'pt',
      localeList: ['es', 'en'],
    });

    expect(locale.get()).toBe('es');
  });
});

describe('fetchTranslations', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify({}));
  });

  test('it is not called if some translations are passed in', async () => {
    await createI18nStore({
      translations: {
        KEY: 'Sorry',
      },
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  test('it is called if no translations are passed in', async () => {
    fetchMock.mockResponse(JSON.stringify({ key: 'hello, {name}' }));
    const { translate } = await createI18nStore({
      translations: {},
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(translate('key', { name: 'Sergio' })).toBe('hello, Sergio');
  });

  test('it is called when locale changes', async () => {
    fetchMock.mockResponses(
      JSON.stringify({ key: 'hello, {name}' }),
      JSON.stringify({ key: 'hola, {name}' })
    );
    const { locale, translate } = await createI18nStore({
      translations: {},
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(translate('key', { name: 'Sergio' })).toBe('hello, Sergio');

    locale.set('es');

    await forCondition(() => fetch['mock'].calls.length === 2);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(translate('key', { name: 'Sergio' })).toBe('hola, Sergio');
  });
});

describe('hasKey', () => {
  it('returns true if we have a translation for the given key', async () => {
    const { hasKey } = await createI18nStore({
      translations: {
        KEY: 'Sorry',
      },
    });

    expect(hasKey('KEY')).toBe(true);
  });

  it('returns false if we have no translation for the given key', async () => {
    const { hasKey } = await createI18nStore({
      translations: {
        KEY: 'Sorry',
      },
    });

    expect(hasKey('NOT.A.KEY')).toBe(false);
  });
});

describe('locale', () => {
  describe('set', () => {
    it('updates value of the locale', async () => {
      const { locale } = await createI18nStore({
        locale: 'pt',
        translations: {
          KEY: 'Sorry',
        },
      });

      expect(locale.get()).toBe('pt');

      await locale.set('jp');

      expect(locale.get()).toBe('jp');
    });

    it('fetches translations before setting locale', async () => {
      const deferred = (() => {
        let resolve;
        const promise = new Promise(res => (resolve = res));
        return { promise, resolve };
      })();
      const fetchLocale = jest.fn().mockImplementation(async () => {
        await deferred.promise;
        return { KEY: 'VALUE' };
      });
      const { locale } = await createI18nStore({
        fetchLocale,
        locale: 'pt',
        translations: {
          KEY: 'Sorry',
        },
      });

      const willSetLocale = locale.set('es');

      expect(fetchLocale).toHaveBeenCalled();
      expect(locale.get()).toBe('pt');

      deferred.resolve();
      await willSetLocale;
    });
  });

  describe('get', () => {
    it('returns value of the locale', async () => {
      const { locale } = await createI18nStore({
        locale: 'pt',
        translations: {
          KEY: 'Sorry',
        },
      });

      expect(locale.get()).toBe('pt');
    });
  });
});

describe('onLocaleWillUpdate', () => {
  it('is called before the new locale is set', async () => {
    let externalLocaleInCallback;
    const callback = jest.fn().mockImplementation(() => (externalLocaleInCallback = locale.get()));
    const { locale, onLocaleWillUpdate } = await createI18nStore({
      locale: 'pt',
      fetchLocale: async locale => ({ hola: locale, locale }),
    });
    onLocaleWillUpdate(callback);

    await locale.set('fr');

    expect(callback).toHaveBeenCalled();
    expect(externalLocaleInCallback).toBe('pt');
  });

  it('can use translate with the translations', async () => {
    const values = { hola: undefined, locale: undefined };
    const { locale, onLocaleWillUpdate } = await createI18nStore({
      locale: 'pt',
      fetchLocale: async locale => ({ hola: locale, locale }),
    });
    onLocaleWillUpdate(translate => {
      values.hola = translate('hola');
      values.locale = translate('locale');
    });

    await locale.set('fr');

    expect(values).toMatchObject({
      hola: 'fr',
      locale: 'fr',
    });
  });

  describe('translate argument', () => {
    it('passes keyWithPlural the new locale', async () => {
      const keyWithPlural = jest.fn().mockReturnValue('hola');
      const { locale, onLocaleWillUpdate } = await createI18nStore({
        keyWithPlural,
        locale: 'pt',
        fetchLocale: async locale => ({ hola: locale }),
      });
      onLocaleWillUpdate(t => t('some-key', {}, 2));

      await locale.set('fr');

      expect(keyWithPlural).toHaveBeenCalledTimes(1);
      expect(keyWithPlural).toHaveBeenCalledWith('fr', 'some-key', 'other');
    });

    it('passes pluralFor the new locale', async () => {
      const pluralFor = jest.fn().mockReturnValue('other');
      const { locale, onLocaleWillUpdate } = await createI18nStore({
        pluralFor,
        locale: 'pt',
        fetchLocale: async locale => ({ hola: locale }),
      });
      onLocaleWillUpdate(t => t('some-key', {}, 2));

      await locale.set('fr');

      expect(pluralFor).toHaveBeenCalledTimes(1);
      expect(pluralFor).toHaveBeenCalledWith('fr', 2);
    });

    it('passes translationForMissingKey the new locale', async () => {
      const translationForMissingKey = jest.fn().mockReturnValue('other translation');
      const { locale, onLocaleWillUpdate } = await createI18nStore({
        translationForMissingKey,
        locale: 'pt',
        fetchLocale: async locale => ({ hola: locale }),
      });
      onLocaleWillUpdate(t => t('non-existent-key'));

      await locale.set('fr');

      expect(translationForMissingKey).toHaveBeenCalledTimes(1);
      expect(translationForMissingKey).toHaveBeenCalledWith('fr', 'non-existent-key', {
        hola: 'fr',
      });
    });
  });

  describe('hasKey argument', () => {
    it('checks agains the new translations', async () => {
      let hasPt;
      let hasFr;
      const { locale, onLocaleWillUpdate } = await createI18nStore({
        locale: 'pt',
        fetchLocale: async locale => ({ [locale]: locale }),
      });
      onLocaleWillUpdate((_, hasKey) => {
        hasPt = hasKey('pt');
        hasFr = hasKey('fr');
      });

      await locale.set('fr');

      expect(hasPt).toBe(false);
      expect(hasFr).toBe(true);
    });
  });
});

const pluralFor = (_, number) => {
  switch (number) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
    default:
      return 'other';
  }
};

async function createI18nStore(options) {
  const store = createI18nOriginalStore({
    pluralFor,
    ...options,
  });
  await store.waitUntilReady;

  return store;
}

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
