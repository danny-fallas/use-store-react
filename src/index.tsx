// Imports
import {
  useState,
  useEffect,
  useCallback
} from 'react';
import {
  set,
  get,
  refresh,
  ssrMock,
  writeToLog,
  getValidOptions,
  stateShouldUpdate,
  IOptionsAvailable,
} from './bll';

// Private functions
const handleState = (storage: Storage, key: string, defaultValue?: any, options?: IOptionsAvailable) => {
  const {
    autoRefresh,
    isNew,
    debug,
    isSSR,
  } = getValidOptions(options);

  const log = useCallback(writeToLog(debug, key), [debug, key]);
  const getInitialValue = (onFirstRender: boolean = false) => {
    let _defaultValue = defaultValue;

    if (_defaultValue instanceof Function) {
      log('The defaultValue cannot be a function.', defaultValue, true);
      _defaultValue = undefined;
    }

    if (isNew || (isSSR && !onFirstRender)) {
      _defaultValue = defaultValue
    } else {
      const existentValue = get(storage, key);
      _defaultValue = (existentValue !== undefined && existentValue !== 'undefined') ? existentValue : defaultValue;
    }

    log('Default Value:', _defaultValue);
    return _defaultValue;
  };

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [state, setState] = useState<any>(getInitialValue);

  useEffect(() => {
    setIsFirstRender(false);

    if (isFirstRender && !isNew && isSSR) {
      log('SSR: updating the default value.');
      setState(getInitialValue(true));
    }
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      log('Updated value:', state);
      set(storage, key, state);
    }
  }, [key, state]);

  useEffect(() => {
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
const usePersistedState = (key: string, defaultValue?: any, options?: IOptionsAvailable) => ssrMock(defaultValue) || handleState(localStorage, key, defaultValue, options);
const useSessionState = (key: string, defaultValue?: any, options?: IOptionsAvailable) => ssrMock(defaultValue) || handleState(sessionStorage, key, defaultValue, options);

// Exports
export {
  usePersistedState,
  useSessionState
};
