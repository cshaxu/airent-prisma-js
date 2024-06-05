import { LoadKey } from "./types";
declare function batchLoad<ENTITY>(loader: (query: any) => Promise<ENTITY[]>, keys: LoadKey[], batchSize?: number): Promise<ENTITY[]>;
declare function batchLoadTopMany<ENTITY>(loader: (query: any) => Promise<ENTITY[]>, matcher: (key: LoadKey, entity: ENTITY) => boolean, keys: LoadKey[], topSize: number, batchSize?: number): Promise<ENTITY[]>;
declare function buildWhere(loadKeys: LoadKey[], allowIn?: boolean): LoadKey;
declare function getUpdatedFields<ENTITY>(original: ENTITY, updated: ENTITY, fields: string[]): string[];
declare function compare<T>(a: T, b: T): boolean;
export { batchLoad, batchLoadTopMany, buildWhere, compare, getUpdatedFields };
