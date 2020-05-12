import { createStore } from '@stencil/store';

export const createLocale = (
  initialValue: string,
  beforeUpdate: (newLocale: string) => Promise<void> = async () => {}
) => {
  const { get, set, onChange } = createStore({ value: initialValue });

  return {
    get: () => get('value'),
    set: async (newLocale: string, force = false): Promise<void> => {
      if (newLocale === get('value') && !force) {
        return;
      }
      await beforeUpdate(newLocale);
      set('value', newLocale);
    },
    onChange: cb => onChange('value', cb),
  };
};
