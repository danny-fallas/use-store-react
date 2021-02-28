import { useState, useEffect } from 'react';

const isBrowser = (typeof window !== 'undefined');
const refresh = (callback) => setInterval(callback, 500);

const get = (storage, key) => {
  const raw = storage.getItem(key);
  return (raw && raw.length) ? JSON.parse(atob(raw)) : null;
};

const set = (storage, key, value) => storage.setItem(key, btoa(JSON.stringify(value || null)));

const usePersistedState = (key, defaultValue = false, isNew = false) => {
  if (!isBrowser) return [false, () => false];

  const storedValue = get(localStorage, key);
  const [state, setState] = useState(() => !isNew ? (storedValue !== null) ? storedValue : defaultValue : defaultValue);

  useEffect(() => { set(localStorage, key, state) }, [key, state]);

  useEffect(() => {
    const interval = refresh(() => setState(get(localStorage, key)));
    return () => clearInterval(interval);
  }, []);

  return [state, setState];
};

const useSessionState = (key, defaultValue = false, isNew = false) => {
  if (!isBrowser) return [false, () => false];

  const storedValue = get(sessionStorage, key);
  const [state, setState] = useState(() => !isNew ? (storedValue !== null) ? storedValue : defaultValue : defaultValue);

  useEffect(() => { set(sessionStorage, key, state) }, [key, state]);

  return [state, setState];
};

export {
  usePersistedState,
  useSessionState
};