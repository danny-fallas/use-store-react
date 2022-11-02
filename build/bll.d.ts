/** TYPES */
declare type IOptionsAvailable = {
    autoRefresh: boolean;
    debug: boolean;
    isNew: boolean;
};
/** CONSTANTS */
declare const ssrStateMock: (defaultValue?: boolean) => (boolean | (() => boolean))[];
declare const validations: {
    isSameType: (value1: any, value2: any) => boolean;
    isTheSameObject: (object1: object, object2: object) => boolean;
    isTheSameArray: (arr1: Array<any>, arr2: Array<any>) => boolean;
};
/** PUBLIC FUNCTIONS */
declare const set: (storage: Storage, key: string, value: any) => void;
declare const get: (storage: Storage, key: string) => string | undefined;
declare const refresh: (callback: Function) => number;
declare const getValidOptions: (options?: IOptionsAvailable) => {
    autoRefresh: boolean;
    debug: boolean;
    isNew: boolean;
};
declare const stateShouldUpdate: (state: any, newState: any) => boolean;
declare const writeToLog: (debug: boolean, key: string) => (message: string, object?: () => void, err?: boolean) => void;
declare const isSSR: (defaultValue: any) => false | (boolean | (() => boolean))[];
export { IOptionsAvailable, validations, ssrStateMock, set, get, refresh, getValidOptions, stateShouldUpdate, writeToLog, isSSR };
