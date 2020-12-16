import { useState, useEffect } from 'react';

const isBrowser = (typeof window !== 'undefined');
const refresh = (callback) => setInterval(callback, 500);

const get = (storage, key) => {
  const item = isBrowser && storage.getItem(key);
  return item && JSON.parse(atob(item));
};

const set = (storage, key, value) => isBrowser && storage.setItem(key, btoa(JSON.stringify(value || false)));

const usePersistedState = (key, defaultValue = false, isNew = false) => {
  const [state, setState] = useState(() => !isNew ? get(localStorage, key) || defaultValue : defaultValue);

  useEffect(() => { set(localStorage, key, state) }, [key, state]);

  useEffect(() => {
    const interval = refresh(() => setState(get(localStorage, key)));
    return () => clearInterval(interval);
  }, []);

  return [state, setState];
};

const useSessionState = (key, defaultValue = false, isNew = false) => {
  const [state, setState] = useState(() => !isNew ? get(sessionStorage, key) || defaultValue : defaultValue);

  useEffect(() => { set(sessionStorage, key, state) }, [key, state]);

  useEffect(() => {
    const interval = refresh(() => setState(get(sessionStorage, key)));
    return () => clearInterval(interval);
  }, []);

  return [state, setState];
};

export {
  usePersistedState,
  useSessionState
};