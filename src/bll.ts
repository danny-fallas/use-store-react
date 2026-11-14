import type { SetStateAction } from 'react'

export type StorageArea = 'local' | 'session'

type StoreEntry = {
  defaultValue: unknown
  key: string
  listeners: Set<() => void>
  onStorage: (event: StorageEvent) => void
  raw: string | null
  snapshot: unknown
  storage: Storage
}

const stores: Record<StorageArea, Map<string, StoreEntry>> = {
  local: new Map(),
  session: new Map()
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const storageError = (operation: string, key: string, error: unknown) => {
  const result = new Error(
    `use-store: failed to ${operation} storage for key "${key}": ${errorMessage(error)}`
  )
  result.name = 'StorageError'
  return result
}

const getStorage = (area: StorageArea, key: string) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Browser storage is not available')
    }

    return area === 'local' ? window.localStorage : window.sessionStorage
  } catch (error) {
    throw storageError('access', key, error)
  }
}

const readRawValue = (storage: Storage, key: string) => {
  try {
    return storage.getItem(key)
  } catch (error) {
    throw storageError('read', key, error)
  }
}

const serialize = (key: string, value: unknown) => {
  try {
    const raw = JSON.stringify(value)

    if (raw === undefined) {
      throw new TypeError('Only JSON-serializable values can be persisted')
    }

    return raw
  } catch (error) {
    throw storageError('serialize', key, error)
  }
}

const parse = (key: string, raw: string) => {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    try {
      return JSON.parse(decodeURI(atob(raw))) as unknown
    } catch (error) {
      throw storageError('read', key, error)
    }
  }
}

const notify = (entry: StoreEntry) => {
  Array.from(entry.listeners).forEach(listener => listener())
}

const updateFromStorage = (entry: StoreEntry, raw: string | null) => {
  if (raw === entry.raw) return

  const snapshot = raw === null ? entry.defaultValue : parse(entry.key, raw)
  entry.raw = raw
  entry.snapshot = snapshot
  notify(entry)
}

const createEntry = (
  area: StorageArea,
  key: string,
  defaultValue: unknown
): StoreEntry => {
  const storage = getStorage(area, key)
  const raw = readRawValue(storage, key)

  const entry: StoreEntry = {
    defaultValue,
    key,
    listeners: new Set(),
    onStorage: () => {},
    raw,
    snapshot: raw === null ? defaultValue : parse(key, raw),
    storage
  }

  entry.onStorage = event => {
    if (
      event.storageArea !== storage ||
      (event.key !== key && event.key !== null)
    ) {
      return
    }

    updateFromStorage(entry, readRawValue(storage, key))
  }

  return entry
}

const getEntry = (
  area: StorageArea,
  key: string,
  defaultValue: unknown
) => {
  const areaStores = stores[area]
  const existing = areaStores.get(key)
  if (existing) return existing

  const entry = createEntry(area, key, defaultValue)
  areaStores.set(key, entry)
  return entry
}

export const getStoreSnapshot = <T,>(
  area: StorageArea,
  key: string,
  defaultValue: T
): T => {
  if (typeof window === 'undefined') return defaultValue
  const entry = getEntry(area, key, defaultValue)
  if (entry.listeners.size === 0) {
    updateFromStorage(entry, readRawValue(entry.storage, key))
  }
  return entry.snapshot as T
}

export const subscribeToStore = (
  area: StorageArea,
  key: string,
  defaultValue: unknown,
  listener: () => void
) => {
  if (typeof window === 'undefined') return () => {}

  const entry = getEntry(area, key, defaultValue)
  const isFirstListener = entry.listeners.size === 0
  if (isFirstListener) {
    window.addEventListener('storage', entry.onStorage)
  }
  entry.listeners.add(listener)
  if (isFirstListener) {
    try {
      updateFromStorage(entry, readRawValue(entry.storage, key))
    } catch (error) {
      entry.listeners.delete(listener)
      window.removeEventListener('storage', entry.onStorage)
      throw error
    }
  }

  return () => {
    entry.listeners.delete(listener)
    if (entry.listeners.size === 0) {
      window.removeEventListener('storage', entry.onStorage)
    }
  }
}

export const setStoreValue = <T,>(
  area: StorageArea,
  key: string,
  defaultValue: T,
  action: SetStateAction<T>
) => {
  const entry = getEntry(area, key, defaultValue)
  const previous = entry.snapshot as T
  const next = typeof action === 'function'
    ? (action as (value: T) => T)(previous)
    : action
  const raw = serialize(key, next)

  if (Object.is(next, previous) && entry.raw === raw) return

  try {
    entry.storage.setItem(key, raw)
  } catch (error) {
    throw storageError('write', key, error)
  }

  entry.raw = raw
  entry.snapshot = next
  notify(entry)
}
