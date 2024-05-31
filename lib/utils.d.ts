import { LoadKey } from "./types";
declare function getUpdatedFields<ENTITY>(original: ENTITY, updated: ENTITY, primaryFields: string[], dateFields: string[]): string[];
declare function batchLoad<ENTITY>(loader: (query: any) => Promise<ENTITY[]>, keys: LoadKey[], batchSize?: number): Promise<ENTITY[]>;
declare function batchLoadTopMany<ENTITY>(loader: (query: any) => Promise<ENTITY[]>, matcher: (key: LoadKey, entity: ENTITY) => boolean, keys: LoadKey[], topSize: number, batchSize?: number): Promise<ENTITY[]>;
declare function buildWhere(loadKeys: LoadKey[], allowIn?: boolean): LoadKey;
export { batchLoad, batchLoadTopMany, buildWhere, getUpdatedFields };
