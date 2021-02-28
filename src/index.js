// Imports
import { useState, useEffect } from 'react';

// Constants
const ssrStateMock = [false, () => false];

// Private functions
const isBrowser = (typeof window !== 'undefined');
const refresh = (callback) => setInterval(callback, 500);
const set = (storage, key, value) => storage.setItem(key, btoa(JSON.stringify(value || null)));
const get = (storage, key) => {
  const raw = storage.getItem(key);
  return (raw && raw.length) ? JSON.parse(atob(raw)) : null;
};

// Public functions
const usePersistedState = (key, defaultValue = false, isNew = false) => {
  if (!isBrowser) return ssrStateMock;

  const storedValue = get(localStorage, key);
  const state = useState(() => !isNew ? (storedValue !== null) ? storedValue : defaultValue : defaultValue);

  useEffect(() => { set(localStorage, key, state) }, [key, state]);

  useEffect(() => {
    const interval = refresh(() => setState(get(localStorage, key)));
    return () => clearInterval(interval);
  }, []);

  return state;
};

const useSessionState = (key, defaultValue = false, isNew = false) => {
  if (!isBrowser) return ssrStateMock;

  const storedValue = get(sessionStorage, key);
  const state = useState(() => !isNew ? (storedValue !== null) ? storedValue : defaultValue : defaultValue);

  useEffect(() => { set(sessionStorage, key, state) }, [key, state]);

  return state;
};

// Exports
export {
  usePersistedState,
  useSessionState
};