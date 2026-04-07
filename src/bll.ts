/** TYPES */
type IOptionsAvailable = {
    listen?: boolean,
    debug?: boolean,
    isNew?: boolean,
    isSSR?: boolean,
};

/** PRIVATE FUNCTIONS */
const isSameType = (value1: any, value2: any) => typeof value1 === typeof value2;

const isTheSameObject = (object1: object, object2: object) => JSON.stringify(Object.values(object1).sort()) === JSON.stringify(Object.values(object2).sort());

const isTheSameArray = (arr1: Array<any>, arr2: Array<any>) => (arr1 && arr2) && (arr1.length === arr2.length) && arr1.every(value1 => arr2.some((value2) => isTheSameObject(value1, value2)));


/** CONSTANTS */

const CHUNK_KEY_SUFFIX = '__chunk_';
const CHUNK_COUNT_SUFFIX = '__chunk_count';
const MAX_CHUNK_MB = 4;
const CHUNK_SIZE_BYTES = Math.floor(MAX_CHUNK_MB * 1048576 * 0.9);

const ssrStateMock = (defaultValue: any = undefined) => [defaultValue, () => false];

const isBrowser = (typeof window !== 'undefined');

const validations = {
    isSameType,
    isTheSameObject,
    isTheSameArray,
};

/** PRIVATE HELPERS */

const removeChunks = (storage: Storage, key: string) => {
    const countRaw = storage.getItem(`${key}${CHUNK_COUNT_SUFFIX}`);
    if (countRaw !== null) {
        const count = parseInt(countRaw, 10);
        if (isNaN(count)) return;
        for (let i = 0; i < count; i++) {
            storage.removeItem(`${key}${CHUNK_KEY_SUFFIX}${i}`);
        }
        storage.removeItem(`${key}${CHUNK_COUNT_SUFFIX}`);
    }
};

/** PUBLIC FUNCTIONS */

const set = (storage: Storage, key: string, value: any) => {
    let encoded: string = JSON.stringify(value);
    encoded = encodeURI(encoded);
    encoded = btoa(encoded);

    removeChunks(storage, key);

    if (encoded.length > MAX_CHUNK_MB * 1048576) {
        const chunks: string[] = [];
        for (let i = 0; i < encoded.length; i += CHUNK_SIZE_BYTES) {
            chunks.push(encoded.slice(i, i + CHUNK_SIZE_BYTES));
        }
        chunks.forEach((chunk, index) => {
            storage.setItem(`${key}${CHUNK_KEY_SUFFIX}${index}`, chunk);
        });
        storage.setItem(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks.length));
        storage.removeItem(key);
    } else {
        storage.setItem(key, encoded);
    }
}

const get = (storage: Storage, key: string) => {
    const countRaw = storage.getItem(`${key}${CHUNK_COUNT_SUFFIX}`);

    let raw: string | null;
    if (countRaw !== null) {
        const count = parseInt(countRaw, 10);
        if (isNaN(count)) return undefined;
        let assembled = '';
        for (let i = 0; i < count; i++) {
            const chunk = storage.getItem(`${key}${CHUNK_KEY_SUFFIX}${i}`);
            if (chunk === null) {
                console.warn(`[@dannyman/use-store] Missing chunk ${i} for key "${key}". Data is corrupted and cannot be retrieved.`);
                return undefined;
            }
            assembled += chunk;
        }
        raw = assembled;
    } else {
        raw = storage.getItem(key);
    }

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
    listen: options?.listen || false,
    debug: options?.debug || false,
    isNew: options?.isNew || false,
    isSSR: options?.isSSR || false,
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

const ssrMock = (defaultValue: any) => (!isBrowser ? ssrStateMock(defaultValue) : false);

export {
    IOptionsAvailable,
    isBrowser,
    validations,
    set,
    get,
    refresh,
    ssrMock,
    writeToLog,
    ssrStateMock,
    getValidOptions,
    stateShouldUpdate,
};
