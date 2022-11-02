// Imports
import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from 'react';
import {
  IOptionsAvailable,
  validations,
  refresh,
  set,
  get,
  getValidOptions,
  stateShouldUpdate,
  writeToLog,
  isSSR
} from './bll';

// Private functions

const handleState = (storage: Storage, key: string, defaultValue: any, options?: IOptionsAvailable) => {
  const {
    autoRefresh,
    isNew,
    debug,
  } = getValidOptions(options);
  const log = useCallback(writeToLog(debug, key), [debug, key]);

  const [state, setState] = useState(() => {
    if (defaultValue instanceof Function) {
      log('The defaultValue cannot be a function.', defaultValue, true);
      defaultValue = undefined;
    }

    const existentValue = get(storage, key);
    const _defaultValue = !isNew ? (existentValue !== undefined) ? existentValue : defaultValue : defaultValue;
    log('Default Value:', _defaultValue);
    return _defaultValue;
  });

  useEffect(() => {
    log('Updated value:', state);
    set(storage, key, state);
  }, [key, state]);

  useLayoutEffect(() => {
    if (autoRefresh) {
      const interval = refresh(() => {
        const newState = get(storage, key);
        if (stateShouldUpdate(state, newState)) {
          log('Auto refresh updating.');
          setState(newState);
        }
      });

      return () => clearInterval(interval);
    }
  }, [state]);

  return [state, setState];
};

// Public functions
const usePersistedState = (key: string, defaultValue: any, options?: IOptionsAvailable) => isSSR(defaultValue) || handleState(localStorage, key, defaultValue, options);
const useSessionState = (key: string, defaultValue: any, options: IOptionsAvailable) => isSSR(defaultValue) || handleState(sessionStorage, key, defaultValue, options);

// Exports
export {
  usePersistedState,
  useSessionState
};
