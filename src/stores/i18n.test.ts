import { createI18nStore } from "./i18n";

describe("I18n map", () => {
  describe("localeChanged", () => {
    test("it is called when locale is changed", () => {
      const localeChanged = jest.fn();
      const { state } = createI18nStore({
        defaultLocale: "es",
        locale: "es",
        localeChanged,
        /*
        translate: () => "",
        translations: {}
        */
      });

      state.locale = "us";

      expect(localeChanged).toHaveBeenCalledWith("us");
    });

    test("it calls the right localeChanged", () => {
      const oldLocaleChanged = jest.fn();
      const newLocaleChanged = jest.fn();
      const { state } = createI18nStore({
        defaultLocale: "es",
        locale: "es",
        localeChanged: oldLocaleChanged,
      });

      state.localeChanged = newLocaleChanged;
      state.locale = "us";

      expect(oldLocaleChanged).not.toHaveBeenCalled();
      expect(newLocaleChanged).toHaveBeenCalled();
    });
  });
});
