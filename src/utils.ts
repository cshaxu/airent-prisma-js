import { omit } from "lodash";
import { DEFAULT_BATCH_SIZE } from "./consts";
import { LoadKey } from "./types";

async function batchLoad<ENTITY>(
  loader: (query: any) => Promise<ENTITY[]>,
  keys: LoadKey[],
  batchSize: number = DEFAULT_BATCH_SIZE
): Promise<ENTITY[]> {
  if (keys.length === 0) {
    return [];
  }
  const result: ENTITY[] = [];
  const where = buildWhere(keys);
  let offset = 0;
  let batch: ENTITY[] = [];
  do {
    const query = { where, skip: offset, take: batchSize };
    batch = await loader(query);
    result.push(...batch);
    offset += batch.length;
  } while (batch.length === batchSize);
  return result;
}

async function batchLoadTopMany<ENTITY>(
  loader: (query: any) => Promise<ENTITY[]>,
  matcher: (key: LoadKey, entity: ENTITY) => boolean,
  keys: LoadKey[],
  topSize: number,
  batchSize: number = DEFAULT_BATCH_SIZE
): Promise<ENTITY[]> {
  const result: ENTITY[] = [];
  if (keys.length === 0) {
    return result;
  }
  const { OR, ...otherConditions } = buildWhere(keys, false);
  const counter = new Map<LoadKey, number>();
  let remainingKeys: LoadKey[] = OR ?? [{}];
  let batch: ENTITY[] = [];
  do {
    const offset = remainingKeys.reduce(
      (count, key) => count + (counter.get(key) ?? 0),
      0
    );
    const query = {
      where: { OR: remainingKeys, ...otherConditions },
      skip: offset,
      take: batchSize,
    };
    batch = await loader(query);
    const nextRemainingKeys: LoadKey[] = [];
    for (const entity of batch) {
      for (const key of remainingKeys) {
        if (matcher(key, entity)) {
          const count = counter.get(key) ?? 0;
          if (count < topSize) {
            result.push(entity);
            counter.set(key, count + 1);
            break;
          }
        }
        const count = counter.get(key) ?? 0;
        if (count < topSize) {
          nextRemainingKeys.push(key);
        }
      }
    }
    remainingKeys = nextRemainingKeys;
  } while (remainingKeys.length > 0 && batch.length === batchSize);
  return result;
}

function buildWhere(loadKeys: LoadKey[], allowIn: boolean = true): LoadKey {
  if (loadKeys.length === 0) {
    return {};
  }
  const map = loadKeys.reduce((acc, loadKey) => {
    Object.entries(loadKey).forEach((entry) => {
      const array = acc[entry[0]] ?? [];
      array.push(entry[1]);
      acc[entry[0]] = array;
    });
    return acc;
  }, {} as Record<string, any[]>);
  const allKeys = Object.keys(map);
  const singleKeys = Object.entries(map)
    .filter((entry: [string, any[]]) => new Set(entry[1]).size === 1)
    .map((entry) => entry[0]);
  const singleKeySet = new Set(singleKeys);
  const multiKeys = allKeys.filter((key) => !singleKeySet.has(key));
  const where = Object.entries(loadKeys[0])
    .filter((entry) => singleKeySet.has(entry[0]))
    .reduce((acc, entry) => {
      acc[entry[0]] = entry[1];
      return acc;
    }, {} as LoadKey);
  if (multiKeys.length === 0) {
    return where;
  }
  if (allowIn && multiKeys.length === 1) {
    const onlyMultiKey = multiKeys[0];
    const values = map[onlyMultiKey];
    if (!["function", "object"].includes(typeof values[0])) {
      where[onlyMultiKey] = { in: values };
      return where;
    }
  }
  where["OR"] = loadKeys.map((loadKey) => omit(loadKey, singleKeys));
  return where;
}

export { batchLoad, batchLoadTopMany, buildWhere };
