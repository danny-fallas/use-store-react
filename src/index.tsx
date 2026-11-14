import { useCallback, useSyncExternalStore } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  getStoreSnapshot,
  setStoreValue,
  subscribeToStore,
  type StorageArea
} from './bll'

const createStorageHook = (area: StorageArea) =>
  function useStorageState<T>(
    key: string,
    initialValue: T
  ): [T, Dispatch<SetStateAction<T>>] {
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
    const setValue = useCallback<Dispatch<SetStateAction<T>>>(
      action => setStoreValue(area, key, initialValue, action),
      [area, key, initialValue]
    )

    return [value, setValue]
  }

export const usePersistedState = createStorageHook('local')
export const useSessionState = createStorageHook('session')
