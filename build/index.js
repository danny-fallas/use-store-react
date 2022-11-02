"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSessionState = exports.usePersistedState = void 0;
// Imports
const react_1 = require("react");
const bll_1 = require("./bll");
// Private functions
const handleState = (storage, key, defaultValue = false, options) => {
    const { autoRefresh, isNew, debug, } = (0, bll_1.getValidOptions)(options);
    const log = (0, react_1.useCallback)((0, bll_1.writeToLog)(debug, key), [debug, key]);
    const [state, setState] = (0, react_1.useState)(() => {
        if (defaultValue instanceof Function) {
            log('The defaultValue cannot be a function.', defaultValue, true);
            defaultValue = false;
        }
        const existentValue = (0, bll_1.get)(storage, key);
        const _defaultValue = !isNew ? (existentValue !== undefined) ? existentValue : defaultValue : defaultValue;
        log('Default Value:', _defaultValue);
        return _defaultValue;
    });
    (0, react_1.useEffect)(() => {
        log('Updated value:', state);
        (0, bll_1.set)(storage, key, state);
    }, [key, state]);
    (0, react_1.useLayoutEffect)(() => {
        if (autoRefresh) {
            const interval = (0, bll_1.refresh)(() => {
                const newState = (0, bll_1.get)(storage, key);
                if ((0, bll_1.stateShouldUpdate)(state, newState)) {
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
const usePersistedState = (key, defaultValue, options) => (0, bll_1.isSSR)(defaultValue) || handleState(localStorage, key, defaultValue, options);
exports.usePersistedState = usePersistedState;
const useSessionState = (key, defaultValue, options) => (0, bll_1.isSSR)(defaultValue) || handleState(sessionStorage, key, defaultValue, options);
exports.useSessionState = useSessionState;
