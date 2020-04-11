import { createStore, ObservableMap } from "@stencil/store";

export type TranslationStore = ObservableMap<Record<string, string>>;
export const createTranslationStore = (
  translations: Record<string, string>
): ObservableMap<Record<string, string>> => createStore(translations);
