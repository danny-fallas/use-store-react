import React from 'react'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { usePersistedState, useSessionState } from '@dannyman/use-store'
import { afterEach, expect, test, vi } from 'vitest'

const makeKey = name => `use-store-v3-test:${name}:${Math.random()}`

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

test('shares same-page state and supports functional updates', () => {
  const key = makeKey('shared')

  const SharedState = () => {
    const [left, setLeft] = usePersistedState(key, 0)
    const [right] = usePersistedState(key, 0)

    return (
      <>
        <button onClick={() => setLeft(current => current + 1)}>increment</button>
        <span data-testid="left">{left}</span>
        <span data-testid="right">{right}</span>
      </>
    )
  }

  render(<SharedState />)
  fireEvent.click(screen.getByText('increment'))

  expect(screen.getByTestId('left')).toHaveTextContent('1')
  expect(screen.getByTestId('right')).toHaveTextContent('1')
})

test('supports StrictMode mount, updates, cleanup, and remount', () => {
  const key = makeKey('strict-mode')

  const Value = () => {
    const [value, setValue] = usePersistedState(key, 0)
    return (
      <>
        <span data-testid="value">{value}</span>
        <button onClick={() => setValue(current => current + 1)}>increment</button>
      </>
    )
  }

  const view = render(
    <React.StrictMode>
      <Value />
    </React.StrictMode>
  )

  fireEvent.click(screen.getByText('increment'))
  expect(screen.getByTestId('value')).toHaveTextContent('1')
  view.unmount()

  render(
    <React.StrictMode>
      <Value />
    </React.StrictMode>
  )
  expect(screen.getByTestId('value')).toHaveTextContent('1')
})

test('keeps local and session values separate for the same key', () => {
  const key = makeKey('areas')
  localStorage.setItem(key, JSON.stringify('local'))
  sessionStorage.setItem(key, JSON.stringify('session'))

  const StorageAreas = () => {
    const [local] = usePersistedState(key, '')
    const [session] = useSessionState(key, '')

    return (
      <>
        <span data-testid="local">{local}</span>
        <span data-testid="session">{session}</span>
      </>
    )
  }

  render(<StorageAreas />)

  expect(screen.getByTestId('local')).toHaveTextContent('local')
  expect(screen.getByTestId('session')).toHaveTextContent('session')
})

test('reads the latest localStorage value when another-document event arrives', () => {
  const key = makeKey('cross-tab')

  const Value = () => {
    const [value] = usePersistedState(key, 'initial')
    return <span data-testid="value">{value}</span>
  }

  render(<Value />)
  const newValue = JSON.stringify('latest')

  act(() => {
    localStorage.setItem(key, newValue)
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify('stale event value'),
      oldValue: null,
      storageArea: localStorage
    }))
  })

  expect(screen.getByTestId('value')).toHaveTextContent('latest')
})

test('reads the new key without writing the previous value into it', () => {
  const oldKey = makeKey('old-key')
  const newKey = makeKey('new-key')
  localStorage.setItem(oldKey, JSON.stringify(1))
  localStorage.setItem(newKey, JSON.stringify(7))

  const Value = ({ storageKey }) => {
    const [value] = usePersistedState(storageKey, 0)
    return <span data-testid="value">{value}</span>
  }

  const view = render(<Value storageKey={oldKey} />)
  view.rerender(<Value storageKey={newKey} />)

  expect(screen.getByTestId('value')).toHaveTextContent('7')
  expect(localStorage.getItem(newKey)).toBe(JSON.stringify(7))
  expect(localStorage.getItem(oldKey)).toBe(JSON.stringify(1))
})

test('refreshes storage when a hook remounts after missing another-tab updates', () => {
  const key = makeKey('remount')

  const Value = () => {
    const [value] = usePersistedState(key, 'initial')
    return <span data-testid="value">{value}</span>
  }

  localStorage.setItem(key, JSON.stringify('before unmount'))
  const firstRender = render(<Value />)
  expect(screen.getByTestId('value')).toHaveTextContent('before unmount')
  firstRender.unmount()

  localStorage.setItem(key, JSON.stringify('changed while unsubscribed'))
  render(<Value />)

  expect(screen.getByTestId('value')).toHaveTextContent('changed while unsubscribed')
})

test('reads v2 values and rewrites them as JSON on the next update', () => {
  const key = makeKey('legacy')
  const initialValue = { greeting: 'olá' }
  const legacyValue = btoa(encodeURI(JSON.stringify(initialValue)))
  localStorage.setItem(key, legacyValue)

  const Value = () => {
    const [value, setValue] = usePersistedState(key, { greeting: '' })
    return (
      <>
        <span data-testid="value">{value.greeting}</span>
        <button onClick={() => setValue(current => ({ greeting: `${current.greeting}!` }))}>
          update
        </button>
      </>
    )
  }

  render(<Value />)
  expect(screen.getByTestId('value')).toHaveTextContent('olá')
  expect(localStorage.getItem(key)).toBe(legacyValue)

  fireEvent.click(screen.getByText('update'))
  expect(localStorage.getItem(key)).toBe(JSON.stringify({ greeting: 'olá!' }))
})

test('uses the initial value for server output, then hydrates from storage', async () => {
  const key = makeKey('ssr')
  localStorage.setItem(key, JSON.stringify('stored'))

  const Value = () => {
    const [value] = usePersistedState(key, 'initial')
    return <span>{value}</span>
  }

  const markup = renderToString(<Value />)
  expect(markup).toContain('initial')

  const container = document.createElement('div')
  container.innerHTML = markup
  await act(async () => {
    hydrateRoot(container, <Value />)
  })

  await waitFor(() => expect(container.textContent).toBe('stored'))
})

test('throws on malformed stored data', () => {
  const key = makeKey('malformed')
  localStorage.setItem(key, 'not-json')
  vi.spyOn(console, 'error').mockImplementation(() => {})

  const Value = () => {
    const [value] = usePersistedState(key, 'initial')
    return <span>{value}</span>
  }

  expect(() => render(<Value />)).toThrow('use-store: failed to read storage')
})

test('surfaces storage read failures', () => {
  const key = makeKey('read-failure')
  const originalGetItem = Storage.prototype.getItem
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (storageKey) {
    if (storageKey === key) {
      throw new DOMException('storage blocked', 'SecurityError')
    }

    return originalGetItem.call(this, storageKey)
  })
  vi.spyOn(console, 'error').mockImplementation(() => {})

  const Value = () => {
    const [value] = usePersistedState(key, 'initial')
    return <span>{value}</span>
  }

  expect(() => render(<Value />)).toThrow('use-store: failed to read storage')
})

test('does not commit a value when serialization fails', () => {
  const key = makeKey('serialization')
  let setValue

  const Value = () => {
    const [value, set] = usePersistedState(key, 0)
    setValue = set
    return <span data-testid="value">{value}</span>
  }

  render(<Value />)

  expect(() => setValue(BigInt(1))).toThrow('failed to serialize storage')
  expect(screen.getByTestId('value')).toHaveTextContent('0')
  expect(localStorage.getItem(key)).toBeNull()
})

test('does not commit a value when storage quota is exhausted', () => {
  const key = makeKey('quota')
  let setValue
  const originalSetItem = Storage.prototype.setItem

  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (storageKey, value) {
    if (storageKey === key) {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    }

    return originalSetItem.call(this, storageKey, value)
  })

  const Value = () => {
    const [value, set] = usePersistedState(key, 0)
    setValue = set
    return <span data-testid="value">{value}</span>
  }

  render(<Value />)

  expect(() => setValue(1)).toThrow('failed to write storage')
  expect(screen.getByTestId('value')).toHaveTextContent('0')
  expect(localStorage.getItem(key)).toBeNull()
})
