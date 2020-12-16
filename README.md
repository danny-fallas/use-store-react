# use-store-react

> Custom React Hook to enable Store usage without Redux

[![NPM](https://img.shields.io/npm/v/use-store-react.svg)](https://www.npmjs.com/package/use-store-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-store-react
```

## Usage

```jsx
import React, { Component } from 'react'

import { useMyHook } from 'use-store-react'

const Example = () => {
  const example = useMyHook()
  return (
    <div>{example}</div>
  )
}
```

## License

MIT © [danny-fallas](https://github.com/danny-fallas)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
