# @dannyman/use-store

Two small React hooks for sharing JSON-compatible state in a page and persisting it in browser storage.

[![NPM](https://img.shields.io/npm/v/@dannyman/use-store.svg)](https://www.npmjs.com/package/@dannyman/use-store)

## Install

```bash
npm install @dannyman/use-store
```

Requires React 18 or later. The hooks use React's `useSyncExternalStore` API to
bridge browser storage into React, and are tested with React 18.3.1 and React
19.3.1.

For state that does not need browser persistence or external synchronization,
prefer React's built-in `useState` or `useReducer`.

## Usage

```jsx
import { usePersistedState, useSessionState } from '@dannyman/use-store';

function Preferences() {
  const [theme, setTheme] = usePersistedState('app:theme', 'system');
  const [draft, setDraft] = useSessionState('app:draft', '');

  return (
    <>
      <select value={theme} onChange={event => setTheme(event.target.value)}>
        <option value="system">System</option>
        <option value="dark">Dark</option>
      </select>
      <input value={draft} onChange={event => setDraft(event.target.value)} />
    </>
  );
}
```

Both hooks return `[value, setValue]`, and setters accept values or functional updates:

```js
const [count, setCount] = usePersistedState('app:count', 0);
setCount(current => current + 1);
```

## Storage behavior

- Hooks using the same storage type and key share updates within the same page.
- `usePersistedState` uses `localStorage`, so updates made through this hook are also observed in other same-origin tabs.
- `useSessionState` uses `sessionStorage`, which is scoped to a tab's page session. A tab opened with an opener may start with a copy of the opener's session storage; later changes are not shared across tabs.
- Existing stored values take precedence over the initial value. The initial value is used when the key is absent.
- During server rendering, the hook uses the initial value. After hydration, it reads browser storage and updates if a stored value exists.
- Values use JSON serialization. Existing v2 Base64-wrapped JSON values remain readable and are rewritten as plain JSON on the next successful update.

## Limits and errors

This package is intended for small, non-sensitive values such as preferences and drafts—not files, large datasets, or server state.

- Web Storage is synchronous, has browser-dependent quotas scoped to the origin, and is best-effort: users or browsers can clear or evict stored data.
- If serialization or a storage read/write fails (including quota exhaustion), the hook throws an error. A failed write does not update the in-page value. The package does not split data into multiple keys or fall back to another storage backend.
- Values should follow JSON semantics. Functions, `undefined`, cyclic structures, `BigInt`, and other non-JSON values cannot be persisted reliably.
- Base64 is not encryption. Browser storage is accessible to same-origin JavaScript; do not store secrets or sensitive data.
- For large or asynchronous data, use IndexedDB or another storage solution designed for it.

## Migrating from v2

The v3 API removes the experimental options object. Cross-tab and same-page updates are automatic:

```diff
- usePersistedState('app:theme', 'system', { listen: true, debug: true })
+ usePersistedState('app:theme', 'system')
```

`isSSR` is no longer needed. If a component used `isNew` to reset a key, call the returned setter with the desired value when that reset should occur. Existing v2 values are migrated the next time a successful update writes that key.

## Development

```bash
npm ci
npm ci --prefix example
npm test
npm run example
```

## Changelog

### 3.0.0

- React 18+ external-store integration with automatic same-page and cross-tab synchronization.
- Validated against React 18.3.1 and the latest stable React 19.3.1.
- Removed the options object and Base64 writes; added v2 storage migration.
- Clarified JSON, SSR, storage quota, and error behavior.
- Refreshed the Rollup toolchain and replaced the example's Create React App runner with Vite and Vitest.

### 2.1.0

- Changed `autoRefresh` to `listen`.
- Added storage event listening for persisted state.

### 2.0.9

- Allowed persisted read-only values with no default.
- Fixed a TypeScript issue in `useSessionState`.

### 2.0.6

- Added the experimental `isSSR` option.

### 2.0.4

- Added React 18 support and migrated to TypeScript.
- Removed unnecessary dependencies and files.
- Allowed `null` default values.

### 1.1.3

- Improved server-rendered defaults and background change listening.
- Added debug logging and the options object.

## License

MIT © [danny-fallas](https://github.com/danny-fallas)

Built by [Pacific EcoSolutions](https://pacificecosolutions.ai).
