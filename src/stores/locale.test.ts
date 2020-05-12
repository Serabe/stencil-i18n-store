import { createLocale } from './locale';

describe('createLocale', () => {
  describe('get', () => {
    it('returns the current value of locale', () => {
      const locale = createLocale('es');

      expect(locale.get()).toBe('es');
    });
  });

  describe('set', () => {
    it('updates value', async () => {
      const locale = createLocale('es');

      expect(locale.get()).toBe('es');

      await locale.set('pt');

      expect(locale.get()).toBe('pt');
    });

    it('calls the beforeUpdate hook before the new value is set', async () => {
      let localeInHook;
      const beforeUpdate = jest.fn().mockImplementation(() => (localeInHook = locale.get()));
      const locale = createLocale('es', beforeUpdate);

      await locale.set('pt');

      expect(localeInHook).toBe('es');
      expect(beforeUpdate).toHaveBeenCalledTimes(1);
      expect(beforeUpdate).toHaveBeenCalledWith('pt');
    });

    it('does not call beforeUpdate if it is not being update', async () => {
      const beforeUpdate = jest.fn();
      const locale = createLocale('es', beforeUpdate);

      await locale.set('es');

      expect(beforeUpdate).not.toHaveBeenCalled();
    });
  });

  describe('onChange', () => {
    it('is called when set changes the value', async () => {
      const callback = jest.fn();
      const locale = createLocale('es');
      locale.onChange(callback);

      await locale.set('pt');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('pt');
    });

    it('is not called if set does not change the value', async () => {
      const callback = jest.fn();
      const locale = createLocale('es');
      locale.onChange(callback);

      await locale.set('es');

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
