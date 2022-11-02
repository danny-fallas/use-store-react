/** TYPES */
type IOptionsAvailable = {
    autoRefresh?: boolean,
    debug?: boolean,
    isNew?: boolean,
};

/** PRIVATE FUNCTIONS */
const isSameType = (value1: any, value2: any) => typeof value1 === typeof value2;

const isTheSameObject = (object1: object, object2: object) => JSON.stringify(Object.values(object1).sort()) === JSON.stringify(Object.values(object2).sort());

const isTheSameArray = (arr1: Array<any>, arr2: Array<any>) => (arr1 && arr2) && (arr1.length === arr2.length) && arr1.every(value1 => arr2.some((value2) => isTheSameObject(value1, value2)));

const mbSize = (str: string) => (new Blob([str]).size) / 1048576;

/** CONSTANTS */

const ssrStateMock = (defaultValue = undefined) => [defaultValue, () => false];

const isBrowser = (typeof window !== 'undefined');

const validations = {
    isSameType,
    isTheSameObject,
    isTheSameArray,
};

/** PUBLIC FUNCTIONS */

const set = (storage: Storage, key: string, value: any) => {
    value = JSON.stringify(value);
    value = encodeURI(value);
    value = btoa(value);

    // TO DO: Checkout the max memory limits on storage and handle

    storage.setItem(key, value);
}

const get = (storage: Storage, key: string) => {
    const raw = storage.getItem(key);

    if (raw && raw.length) {
        let value = raw;
        value = atob(value);
        value = decodeURI(value);
        if (value && value !== 'undefined') value = JSON.parse(value);

        return value;
    } else {
        return undefined;
    }
};

const refresh = (callback: Function) => setInterval(callback, 500);

const getValidOptions = (options?: IOptionsAvailable) => ({
    autoRefresh: options?.autoRefresh || false,
    debug: options?.debug || false,
    isNew: options?.isNew || false,
});

const stateShouldUpdate = (state: any, newState: any) => {
    switch (true) {
        case !isSameType(state, newState):
        case (newState instanceof Object && newState !== undefined && !isTheSameObject(state, newState)):
        case (newState instanceof Array && !isTheSameArray(state, newState)):
        case ((newState instanceof String || newState instanceof Number) && state !== newState):
            return true;
        default:
            return false;
    }
};

const writeToLog = (debug: boolean, key: string) => {
    if (debug) {
        return (message: string, object = () => { }, err = false) => {
            console.group(`[@dannyman/use-store]@%c${key}`, 'color: blue;');

            if (message) console.log(`${err ? '%cERROR: ' : '%c'}${message}`, `color: ${err ? 'red' : 'green'};`);
            if (!(object instanceof Function)) console.log(`${typeof object} =>`, JSON.parse(JSON.stringify(object)));

            console.groupEnd();
        }
    } else {
        return () => { };
    }
};

const isSSR = (defaultValue: any) => (!isBrowser ? ssrStateMock(defaultValue) : false);

export {
    IOptionsAvailable,
    validations,
    ssrStateMock,
    set,
    get,
    refresh,
    getValidOptions,
    stateShouldUpdate,
    writeToLog,
    isSSR
};