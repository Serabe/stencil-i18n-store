import { bestLocale } from './best-locale';

describe('bestLocale', () => {
  test('if there are no matching locales, return default locale', () => {
    expect(bestLocale(['pt'], ['es', 'en'], 'en')).toBe('en');
  });

  test('if the best language is a localization of one of the available languages, choose it over a later version', () => {
    expect(bestLocale(['es-ES', 'en'], ['en', 'es'], 'en')).toBe('es');
  });
});
