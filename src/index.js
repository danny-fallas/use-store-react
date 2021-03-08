// Imports
import {
  useState,
  useEffect,
  useLayoutEffect
} from 'react';
import {
  ssrStateMock,
  isBrowser,
  refresh,
  set,
  get,
  getValidOptions,
  stateShouldUpdate
} from './functions';

// Private functions
const handleState = (storage, key, options) => {
  if (!isBrowser) return ssrStateMock;

  const {
    defaultValue,
    isNew,
    autoRefresh
  } = getValidOptions(options);

  const [state, setState] = useState(() => {
    const existentValue = get(storage, key);
    return !isNew ? (existentValue !== null) ? existentValue : defaultValue : defaultValue;
  });

  useEffect(() => {
    set(storage, key, state)
  }, [key, state]);

  useLayoutEffect(() => {
    if (autoRefresh) {
      const interval = refresh(() => {
        const newState = get(storage, key);
        if (stateShouldUpdate(state, newState)) setState(newState);
      });

      return () => clearInterval(interval);
    }
  }, [state]);

  return [state, setState];
};

// Public functions
const usePersistedState = (key, options) => handleState(localStorage, key, options);
const useSessionState = (key, options) => handleState(sessionStorage, key, options);

// Exports
export {
  usePersistedState,
  useSessionState
};