import { useCallback, useSyncExternalStore } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  getStoreSnapshot,
  setStoreValue,
  subscribeToStore,
  type StorageArea
} from './bll'

type StorageHook = {
  <T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>]
  <T = unknown>(
    key: string
  ): [T | undefined, Dispatch<SetStateAction<T | undefined>>]
}

const createStorageHook = (area: StorageArea): StorageHook => {
  function useStorageState<T>(
    key: string,
    initialValue: T
  ): [T, Dispatch<SetStateAction<T>>]
  function useStorageState<T = unknown>(
    key: string
  ): [T | undefined, Dispatch<SetStateAction<T | undefined>>]
  function useStorageState<T = unknown>(
    key: string,
    initialValue?: T
  ): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
    const subscribe = useCallback(
      (listener: () => void) =>
        subscribeToStore(area, key, initialValue, listener),
      [area, key, initialValue]
    )
    const getSnapshot = useCallback(
      () => getStoreSnapshot(area, key, initialValue),
      [area, key, initialValue]
    )
    const getServerSnapshot = useCallback(() => initialValue, [initialValue])
    const value = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    )
    const setValue = useCallback<Dispatch<SetStateAction<T | undefined>>>(
      action => setStoreValue(area, key, initialValue, action),
      [area, key, initialValue]
    )

    return [value, setValue]
  }
  return useStorageState
}

export const usePersistedState = createStorageHook('local')
export const useSessionState = createStorageHook('session')
