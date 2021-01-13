
# @dannyman/use-store

  

  

> Custom React Hook to enable using useState across the whole React Application

  

  

[![NPM](https://img.shields.io/npm/v/@dannyman/use-store.svg)](https://www.npmjs.com/package/@dannyman/use-store) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

 ## Overview
 
**usePersistedState** and **useSessionState** hooks will allow you to create global state variables to share or get across your React application.

## How it works
**usePersistedState:**  will allow you to store data and access it anywhere on your React app, even with the app open on different tabs or windows (on the same browser). The data will persist even if the app gets closed (if the localstorage is cleared, the data will get destroyed).

**useSessionState:** works as the usePersistedState hook, but encapsules the data so it can be used only on a single client session and it gets destroyed when the user leaves the app.
  
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

  

  

## Usage

  

  

```jsx

  

import React from  'react';

  

import { usePersistedState, useSessionState } from  '@dannyman/use-store';

  

const  Example  = () => {

const [name, setName] =  useSessionState('app:key:name', 'default value', true);

const [lastName, setLasName] =  usePersistedState('app:key:lastName', 'default value', true);

return (

<div>Hello, {name}  {lastName}</div>

);

};

  

```

  

  

The *usePersistedState* and *useSessionState* hooks will receive the following parameters:

  

* **key**: unique key name used to access the state (required).

  

* **defaultValue**: sets the state value to this (default = false).

  

* **isNew**: overrides any value previously stored on component mount (default = false).

  

  

## License

  

  

MIT © [danny-fallas](https://github.com/danny-fallas)

  

  

---

  

  

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).