import { IOptionsAvailable } from './bll';
declare const usePersistedState: (key: string, defaultValue: any, options?: IOptionsAvailable) => any[];
declare const useSessionState: (key: string, defaultValue: any, options: IOptionsAvailable) => any[];
export { usePersistedState, useSessionState };
