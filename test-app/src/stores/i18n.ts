import { createI18nStore } from 'stencil-i18n-store';

const { translate, locale, waitUntilReady } = createI18nStore({
  fetchLocale: async locale => ({ locale }),
});

export { translate, locale, waitUntilReady };
