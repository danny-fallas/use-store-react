
# @dannyman/use-store

  

  

> Custom React Hook to enable using useState across the whole React Application

  

  

[![NPM](https://img.shields.io/npm/v/@dannyman/use-store.svg)](https://www.npmjs.com/package/@dannyman/use-store) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


 ## Overview
 
**usePersistedState** and **useSessionState** hooks will allow you to create global state variables to share or get across your React application.

## How it works
**usePersistedState:**  will allow you to store data and access it anywhere on your React app, even with the app open on different tabs or windows (on the same browser). The data will persist even if the app gets closed (unless the localstorage is cleared, in this case the data will get destroyed).

**useSessionState:** works as the usePersistedState hook, but encapsules the data so it can be used only on a single client session (read [this](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) to understand when a new session is created) and it gets destroyed as soon as the user leaves the session.
  
## Features

* Works exactly as the **useState** React Hook.
* Supports all the JavaScript data types and data structures.
* Persists the data depending on your needs.
* The hooks will update the browser storage on the background.
* Data will be available for all the React components and apps.
* All the data is base64 encoded.
* No need to use redux.
* Easy to use.
  

## Install


```bash
npm install --save @dannyman/use-store
```

_Use the latest version for better support. Or upgrade to @1.1.3 if you are still using v1_

## Usage

The *usePersistedState* and *useSessionState* hooks will receive the following parameters:

  

* **key**: unique key name used to access the state. **required**
* **defaultValue**: sets the state value to this value. **default = false**
* **options**: object with the following options:
    * **isNew**: overrides any value previously stored on component mount. **default = false**
    * **listen** (\*): listens to any changes that happen on the background and updates the current state. Works for usePersistedState only. **default = false**
    * **debug**: shows information about the state status. **default = false**
    * **isSSR** (\*): the instantiation of the state will use the default value provided to match server output (if you are using the state to render inside a view), and then if it's not new it will update with the stored value. **default = false**



_\* EXPERIMENTAL FEATURE, you could experience some issues._

## Example
  
```jsx
import React from  'react';
import { usePersistedState, useSessionState } from  '@dannyman/use-store';

const  Example  = () => {
    const [name, setName] =  useSessionState('app:key:name','Danny', { isNew: true });
    const [message] =  usePersistedState('app:key:message', 'nice to meet you', { listen: true });

    return (
        <div>Hello {name},  {message}!</div>
        <input type="text" onChange={(e) => setName(e.target.value)} />
    );
};
```
 ## Changelog
 v2.1.0
 * Changed the option autoRefresh to listen
 * Using event listeners to refresh data on the usePersistedState hook

 v2.0.9
 * Allow persisted state read-only values with no defaults
 * Fixed TS issue on useSessionState hook

 v2.0.6
 * Added support for SSR frameworks (isSSR option)

 v2.0.4
 * Updated to support React 18
 * Migrated to Typescript
 * Removed unnecessary dependencies and files
 * Allow null defaultValues

 v1.1.3
 * Using provided defaultValue during server-side rendering.
 * Adding "debug" option for logging.
 * Validating non-function defaultValue.
 * Fixing server-side rendering framework issue.
 * Reverting hook signature for defaultValue.
 * Enabling background change listening.
 * Implementing options object for future functionality.


## License

MIT © [danny-fallas](https://github.com/danny-fallas)

---