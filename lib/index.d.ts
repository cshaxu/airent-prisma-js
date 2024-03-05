type LoadKey = Record<string, any>;
type ValidatePrismaArgs<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends {
    select: any;
} ? "Property `select` not supported by @airent/prisma." : {});
declare function batchLoad<ENTITY>(loader: (query: any) => Promise<ENTITY[]>, keys: LoadKey[], batchSize?: number): Promise<ENTITY[]>;
declare function batchLoadTopMany<ENTITY>(loader: (query: any) => Promise<ENTITY[]>, matcher: (key: LoadKey, entity: ENTITY) => boolean, keys: LoadKey[], topSize: number, batchSize?: number): Promise<ENTITY[]>;
declare function buildWhere(loadKeys: LoadKey[], allowIn?: boolean): LoadKey;
export { ValidatePrismaArgs, batchLoad, batchLoadTopMany, buildWhere };
