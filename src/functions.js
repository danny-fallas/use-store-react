// Private Functions
const isSameType = (value1, value2) => typeof value1 === typeof value2;

const isNumber = (value) => !isNaN(value);

const isArray = (value) => Array.isArray(value);

const isObject = (value) => typeof value === 'object';

const isString = (value) => typeof value === 'string';

const isTheSameObject = (object1, object2) => JSON.stringify(Object.values(object1).sort()) === JSON.stringify(Object.values(object2).sort());

const isTheSameArray = (arr1, arr2) => (arr1 && arr2) && (arr1.length === arr2.length) && arr1.every(value1 => arr2.some((value2) => isTheSameObject(value1, value2)));

// Public Consts
const ssrStateMock = [false, () => false];

const isBrowser = (typeof window !== 'undefined');

// Public Functions
const set = (storage, key, value) => storage.setItem(key, btoa(JSON.stringify(value || null)));

const get = (storage, key) => {
    const raw = storage.getItem(key);
    return (raw && raw.length) ? JSON.parse(atob(raw)) : null;
};

const refresh = (callback) => setInterval(callback, 500);

const getValidOptions = (options) => ({
    defaultValue: options?.defaultValue || false,
    isNew: options?.isNew || false,
    autoRefresh: options?.autoRefresh || false,
});

const stateShouldUpdate = (state, newState) => {
    switch (true) {
        case !isSameType(state, newState):
        case (isObject(newState) && !isTheSameObject(state, newState)):
        case (isArray(newState) && !isTheSameArray(state, newState)):
        case ((isString(newState) || isNumber(newState)) && state !== newState):
            return true;
        default:
            return false;
    }
};

export {
    ssrStateMock,
    isBrowser,
    set,
    get,
    refresh,
    getValidOptions,
    stateShouldUpdate
};