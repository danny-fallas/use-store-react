# @dannyman/use-store

  

> Custom React Hook to enable using useState across the whole React Application

  

[![NPM](https://img.shields.io/npm/v/@dannyman/use-store.svg)](https://www.npmjs.com/package/@dannyman/use-store) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

  

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