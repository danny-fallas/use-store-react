import React from 'react'
import { useMyHook } from 'use-store-react'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App