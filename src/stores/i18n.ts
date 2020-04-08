import { createStore } from "@stencil/store";

interface I18nState {
  defaultLocale: string;
  locale: string;
  localeChanged: (newValue: string) => void;
}

const I18N_SATE_DEFAULTS: I18nState = {
  defaultLocale: "us",
  locale: "us",
  localeChanged() {},
};

export const createI18nStore = (defaults: Partial<I18nState>) => {
  const map = createStore({ ...I18N_SATE_DEFAULTS, ...defaults });

  map.onChange("locale", (newValue) => map.state.localeChanged(newValue));

  return map;
};
