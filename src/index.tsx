// Imports
import {
  useState,
  useEffect,
  useCallback
} from 'react';
import {
  set,
  get,
  ssrMock,
  writeToLog,
  getValidOptions,
  IOptionsAvailable,
} from './bll';

// Private functions
const handleState = (storage: Storage, key: string, defaultValue?: any, options?: IOptionsAvailable) => {
  const {
    listen,
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

  const onStorageEvent = (event: StorageEvent) => {
    if (event.isTrusted && event.oldValue !== event.newValue) {
      const newState = get(storage, key);
      log('Listener: updating the state value.');
      setState(newState);
    }
  };

  useEffect(() => {
    setIsFirstRender(false);

    if (isFirstRender && !isNew && isSSR) {
      log('SSR: updating the default value.');
      setState(getInitialValue(true));
    }

    if (listen) {
      log('Listener: attaching a listener.');
      window.onstorage = onStorageEvent;
      return () => {
        log('Listener: removing a listener.');
        window.onstorage = null;
      };
    }
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      log('Updated value:', state);
      set(storage, key, state);
    }
  }, [key, state]);

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
