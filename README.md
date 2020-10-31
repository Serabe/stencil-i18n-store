# Stencil I18n Store

`stencil-i18n-store` is a highly configurable solution for I18n in `stencil` based on `@stencil/store`.

## Features

* __Highly configurable__
* __Sensible defaults__
* __Based on `@stencil/store`__
* __Lightweight__ _(~1KB)_

## Installation

First, run `npm install --save stencil-i18n-store`. You might want to create a config file in `src/` (if you are in a Stencil project). The minimum recommended configuration is:

```ts
// src/i18n.config.ts
export default {
  availableLocales: ['en'],
  defaultLocale: 'en'
}
```

Finally, add your store wherever you have your stores:

```ts
// src/stores/i18n.ts
import { createI18nStore } from 'stencil-i18n-store';
import config from '../i18n.config';

export const i18n = createI18nStore(config);
```

Though exporting the store directly is possible, selecting which parts to export is more desirable. We'll see some advance usage later on.

## Basic Usage

The store will start loading the best fit locale as soon as it is created. `createI18nStore` exposes a `waitUntilReady` promise so you can wait to render your app until everything is ready. After that initial wait, you won't need to worry about anything, as changing the locale will wait until the new translations are loaded to rerender your components.

After that, just use `translate` in your components.

### Translation files.

Translation files are just JSON files. The JSON needs to be a `Record<string, string>`.

```json
// en.json
{
  "key1": "My content",
  "key2": "Other content"
}
```

## API

## Config

### `availableLocales?: readonly string[]`

List of locales available in your application. Defaults to `['en']`.

### `defaultLocale?: string`

Default locale to use. Defaults to `'en'`.

### `fetchLocale?: (locale: string) => Promise<Record<string, string>>`

Tells stencil-i18n-store how to load the given locale. By default, it will load the JSON from `'/src/assets/locales/'` with the same name as the locale and the extension `json`. For example, `fetchLocale('en')` will try to load the locale from `/assets/locales/en.json`.

If you are running tests, `fetchLocale` will return an empty object (no translations at all).

### `interpolateValues?: (str: string, interpolations: Record<string, string>) => string`

This function receives a localized string and a map of values to interpolate.
By default, interpolated values are surrounded by curly braces like this: `{someValue}`.
By default, this function will look for `someValue` in the `interpolations` record and use that value
to replace the `{someValue}`.

You can write curly braces my prefixing the starting one with a backslash `\{this won't be looked up}`.

### `keyWithPlural: (locale: string, key: string, pluralType: 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' | string) => string`

Returns the key to use given the base key and the plural type. When using the pluralization system, this is the function in charge of creating the actual key to be used.

If current locale is `'en'` and the plural type is `'many'`, a key like `'my.key` would be transformed into `'my.key.many'` by default. Then, `stencil-i18n-store` will look for `'my.key.many'` in the translations store.

### `locale: string`

In case you want to force a locale.

### `localeList: string[]`

The list of available locales in the user's system. By default it is `navigator.languages ?? ['en']`.

### `pluralFor: (locale: string, n: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' | string`

Given a locale an a number, returns the plural type to use. Currently, `stencil-i18n-store` does not use this information, it is just passed to `keyWithPlural`.

### `translations: Record<string, string>`

You can pass the translations to use in case you have them preloaded.

### `translationForMissingKey: (locale: string, key: string) => string`

Returns the localized string to use should the key not be found in the translations.

## API

`createI18nStore` expects some options (described above) and returns an object with the following fields:

### `addTranslations: (newTranslations: Record<string, string>) => void`

This method allows the user to add translations without removing the current ones, though it might override some of them.

### `hasKey: (key: string) => boolean`

Check if a given key is present in translations.

### `loadTranslations: (newTranslations: Record<string, string>) => void`

Behaves like `addTranslations` but `loadTranslations` does remove previous translations.

### `locale: localeStore`

Provide a locale store where you can `get(): string` the locale, `set(newLocale: string, force: boolean = false): Promise<void>` it and listen to changes by providing a callback to `onChange(cb: any): () => void`.

### `translate: (key: string, interpolationsOrMagicNumber?: Record<string, string> | number, maybeMagicNumber?: number) => string`

It looks for the key in your translations and return it. You can provide interpolations to use in case you have some dynamic content.

Also, you can use pluralization by providing a magic number as the last argument (either after the key or the interpolations if you are providing some).

### `waitUntilReady: Promise<void>`

Setting up everything takes some time, as `stencil-i18n-store` needs to load your translations. In your application, you need to wait for this promise to be resolved before being able to use `translate`. You usually want to do that in the `componentWillLoad` of your root component.

## Advanced Usage

### Polyfilling Intl
