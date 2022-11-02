"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSSR = exports.writeToLog = exports.stateShouldUpdate = exports.getValidOptions = exports.refresh = exports.get = exports.set = exports.ssrStateMock = exports.validations = void 0;
/** PRIVATE FUNCTIONS */
const isSameType = (value1, value2) => typeof value1 === typeof value2;
const isTheSameObject = (object1, object2) => JSON.stringify(Object.values(object1).sort()) === JSON.stringify(Object.values(object2).sort());
const isTheSameArray = (arr1, arr2) => (arr1 && arr2) && (arr1.length === arr2.length) && arr1.every(value1 => arr2.some((value2) => isTheSameObject(value1, value2)));
const mbSize = (str) => (new Blob([str]).size) / 1048576;
/** CONSTANTS */
const ssrStateMock = (defaultValue = false) => [defaultValue, () => false];
exports.ssrStateMock = ssrStateMock;
const isBrowser = (typeof window !== 'undefined');
const validations = {
    isSameType,
    isTheSameObject,
    isTheSameArray,
};
exports.validations = validations;
/** PUBLIC FUNCTIONS */
const set = (storage, key, value) => {
    value = JSON.stringify(value);
    value = encodeURI(value);
    value = btoa(value);
    // TO DO: Checkout the max memory limits on storage and handle
    storage.setItem(key, value);
};
exports.set = set;
const get = (storage, key) => {
    const raw = storage.getItem(key);
    if (raw && raw.length) {
        let value = raw;
        value = atob(value);
        value = decodeURI(value);
        if (value) value = JSON.parse(value);

        return value;
    }
    else {
        return undefined;
    }
};
exports.get = get;
const refresh = (callback) => setInterval(callback, 500);
exports.refresh = refresh;
const getValidOptions = (options) => ({
    autoRefresh: options?.autoRefresh || false,
    debug: options?.debug || false,
    isNew: options?.isNew || false,
});
exports.getValidOptions = getValidOptions;
const stateShouldUpdate = (state, newState) => {
    switch (true) {
        case !isSameType(state, newState):
        case (newState instanceof Object && newState !== null && newState !== undefined && !isTheSameObject(state, newState)):
        case (newState instanceof Array && !isTheSameArray(state, newState)):
        case ((newState instanceof String || newState instanceof Number) && state !== newState):
            return true;
        default:
            return false;
    }
};
exports.stateShouldUpdate = stateShouldUpdate;
const writeToLog = (debug, key) => {
    if (debug) {
        return (message, object = () => { }, err = false) => {
            console.group(`[@dannyman/use-store]@%c${key}`, 'color: blue;');
            if (message)
                console.log(`${err ? '%cERROR: ' : '%c'}${message}`, `color: ${err ? 'red' : 'green'};`);
            if (!(object instanceof Function))
                console.log(`${typeof object} =>`, JSON.parse(JSON.stringify(object)));
            console.groupEnd();
        };
    }
    else {
        return () => { };
    }
};
exports.writeToLog = writeToLog;
const isSSR = (defaultValue) => (!isBrowser ? ssrStateMock(defaultValue) : false);
exports.isSSR = isSSR;
