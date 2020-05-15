import { createStore } from '@stencil/store';

export const createLocale = (
  initialValue: string = typeof document === 'undefined'
    ? 'en'
    : document?.children?.[0]?.getAttribute('lang'),
  beforeUpdate: (newLocale: string) => Promise<void> = async () => {}
) => {
  const { get, set, onChange: originalOnChange } = createStore({ value: initialValue });

  const onChange = cb => originalOnChange('value', cb);

  if (typeof document !== 'undefined') {
    onChange(locale => document.children?.[0]?.setAttribute('lang', locale));
  }

  return {
    get: () => get('value'),
    set: async (newLocale: string, force = false): Promise<void> => {
      if (newLocale === get('value') && !force) {
        return;
      }
      await beforeUpdate(newLocale);
      set('value', newLocale);
    },
    onChange,
  };
};
