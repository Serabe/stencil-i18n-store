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


## Advanced Usage

### Polyfilling Intl
