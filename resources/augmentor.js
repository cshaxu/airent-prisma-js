const utils = require("airent/resources/utils.js");

/**
 * CONFIG FIELDS
 * prismaImport: string | undefined, import statement for prisma client
 *
 * YAML FLAGS
 * - prisma: { skipFields: string[]; internalFields: string[]; universalFields: string[] }
 * - isPrisma: false | undefined, top-level flag, false to skip generating prisma wrappers
 * - isPrisma: boolean | undefined, field-level flag to note field as prisma generated field
 * - prismaLoader: boolean | undefined, field-level flag to decide whether to generate loader for the field
 */

function getUniversalFields(entity, config) /* Field[] */ {
  const names = (config.prismaModelUniversalFields ?? []).map((f) => f.name);
  return entity.fields.filter((f) => names.includes(f.name));
}

// build entity.code.beforeBase

function buildBeforeBase(entity, config) /* Code[] */ {
  const requiredImports = [
    `import { batchLoad } from '${
      config.airentPrismaPackage ?? "airent-prisma"
    }';`,
  ];
  if (entity.isPrisma !== false) {
    requiredImports.push("import { Prisma } from '@prisma/client';");
  }
  const prismaImport =
    JSON.parse(JSON.stringify(config.prismaImport)) ??
    "import prisma from 'TODO: specify prismaImport in your airent config';";

  return [...requiredImports, prismaImport, ...buildModelImports(entity)];
}

// build entity.code.beforeType
function buildBeforeType(entity) /* Code[] */ {
  return buildModelImports(entity);
}

function buildModelImports(entity) /* Code[] */ {
  const prismaAssociationFields = entity.fields
    .filter(utils.isAssociationField)
    .filter((f) => f.isPrisma);
  return prismaAssociationFields
    .map((f) => f._type)
    .map(
      (t) =>
        `import { ${utils.toTitleCase(t.name)}Model } from './${
          t.strings.typePackage
        }';`
    );
}

// build entity.code.insideBase

function buildPrismaMethodSignatureLines(
  config,
  entity,
  prismaMethod,
  typeSuffix
) /* Code[] */ {
  const { name: entityName, strings } = entity;
  const entName = utils.toTitleCase(entityName);
  const prismaArgName = `Prisma.${entName}${utils.toTitleCase(
    prismaMethod
  )}Args`;
  const universalFieldLines = getUniversalFields(entity, config).map(
    (af) => `  ${af.name}: ${af.type},`
  );
  return [
    "",
    `public static async ${prismaMethod}<`,
    `  ENTITY extends ${strings.baseClass},`,
    `  T extends ${prismaArgName},`,
    ">(",
    `  this: EntityConstructor<${entity.model}, ENTITY>,`,
    `  args: Prisma.SelectSubset<T, ${prismaArgName}>,`,
    ...universalFieldLines,
    `): Promise<ENTITY${typeSuffix}> {`,
  ];
}

function buildPrismaManyMethodLines(entity, config, prismaMethod) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  const universalFields = getUniversalFields(entity, config);
  const beforeLines = buildPrismaMethodSignatureLines(
    config,
    entity,
    prismaMethod,
    "[]"
  );
  const afterLines = ["  return (this as any).fromArray(models);", "}"];

  const variableName = universalFields.length === 0 ? "models" : "prismaModels";
  const prismaLoaderLine = `  const ${variableName} = await prisma.${prismaModelName}.${prismaMethod}(args);`;

  if (universalFields.length === 0) {
    return [...beforeLines, prismaLoaderLine, ...afterLines];
  }

  const universalFieldNameList = universalFields
    .map((af) => af.name)
    .join(", ");
  return [
    ...beforeLines,
    prismaLoaderLine,
    `  const models = ${variableName}.map((pm) => ({ ...pm, ${universalFieldNameList} }));`,
    ...afterLines,
  ];
}

function buildPrismaOneMethodLines(
  config,
  entity,
  prismaMethod,
  isNullable
) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  const universalFields = getUniversalFields(entity, config);

  const beforeLines = buildPrismaMethodSignatureLines(
    config,
    entity,
    prismaMethod,
    isNullable ? " | null" : ""
  );
  const afterLines = ["  return (this as any).fromOne(model);", "}"];

  const variableName = universalFields.length === 0 ? "model" : "prismaModel";
  const prismaLoaderLines = [
    `  const ${variableName} = await prisma.${prismaModelName}.${prismaMethod}(args);`,
    ...(isNullable
      ? [`  if (${variableName} === null) {`, "    return null;", "  }"]
      : []),
  ];

  if (universalFields.length === 0) {
    return [...beforeLines, ...prismaLoaderLines, ...afterLines];
  }

  const universalFieldNameList = universalFields
    .map((af) => af.name)
    .join(", ");
  return [
    ...beforeLines,
    ...prismaLoaderLines,
    `  const model = { ...${variableName}, ${universalFieldNameList} };`,
    ...afterLines,
  ];
}

function buildPrismaNullableOneMethodLines(
  config,
  entity,
  prismaMethod
) /* Code[] */ {
  return buildPrismaOneMethodLines(entity, config, prismaMethod, true);
}

function buildPrismaNonNullableOneMethodLines(
  config,
  entity,
  prismaMethod
) /* Code[] */ {
  return buildPrismaOneMethodLines(entity, config, prismaMethod, false);
}

function buildPrismaPassThruMethodLines(entity, prismaMethod) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  return [
    "",
    `public static ${prismaMethod} = prisma.${prismaModelName}.${prismaMethod};`,
  ];
}

function buildInitializeMethodLines(entity, config) /* Code[] */ {
  const universalFields = getUniversalFields(entity, config);
  const universalFieldSetters = universalFields
    .map((af) => af.name)
    .map((afn) => `${afn}: this.${afn}`)
    .join(", ");
  const universalFieldSettersString =
    universalFields.length === 0 ? "" : `, ${universalFieldSetters}`;
  const lines = entity.fields
    .filter(utils.isAssociationField)
    .filter((f) => f.isPrisma)
    .flatMap((f) => [
      `if (model.${f.name} !== undefined) {`,
      `  this.${f.name} = ${
        utils.isNullableField(f) ? `model.${f.name} === null ? null : ` : ""
      }${f._type._entity.strings.entityClass}.${
        utils.isArrayField(f) ? "fromArray" : "fromOne"
      }(${
        utils.isArrayField(f)
          ? `model.${f.name}.map((m) => ({ ...m${universalFieldSettersString} }))`
          : `{ ...model.${f.name}${universalFieldSettersString} }`
      });`,
      "}",
    ])
    .map((line) => `  ${line}`);
  if (lines.length === 0) {
    return [];
  }
  return [
    "",
    `protected initialize(model: ${entity.model}): void {`,
    ...lines,
    "}",
  ];
}

function buildInsideBase(entity, config) /* Code[] */ {
  if (entity.isPrisma === false) {
    return [];
  }
  const nullableOneMethods = ["findUnique", "findFirst"];
  const nonNullableOneMethods = [
    "findUniqueOrThrow",
    "findFirstOrThrow",
    "upsert",
    "create",
    "update",
    "delete",
  ];
  const passThruMethods = [
    "createMany",
    "updateMany",
    "deleteMany",
    "count",
    "aggregate",
    "groupBy",
  ];
  return [
    ...buildInitializeMethodLines(entity, config),
    "",
    "/** prisma wrappers */",
    ...buildPrismaManyMethodLines(entity, config, "findMany"),
    ...nullableOneMethods.flatMap((n) =>
      buildPrismaNullableOneMethodLines(entity, config, n)
    ),
    ...nonNullableOneMethods.flatMap((n) =>
      buildPrismaNonNullableOneMethodLines(entity, config, n)
    ),
    ...passThruMethods.flatMap((n) =>
      buildPrismaPassThruMethodLines(entity, n)
    ),
  ];
}

// build entity.fields.code.loadConfig

function buildIsLoaderGeneratable(field) /* boolean */ {
  if (field.prismaLoader === true) {
    return true;
  }
  if (field.prismaLoader === false) {
    return false;
  }
  const otherEntity = field._type?._entity;
  return otherEntity !== undefined && otherEntity.isPrisma !== false;
}

function buildModelsLoader(entity, config) /* Code */ {
  const entName = utils.toTitleCase(entity.name);
  const prismaModelName = utils.toCamelCase(entName);
  const universalFields = getUniversalFields(entity, config);
  const universalFieldSetters = universalFields
    .map((af) => af.name)
    .map((afn) => `${afn}: this.${afn}`)
    .join(", ");
  const universalFieldSettersString =
    universalFields.length === 0 ? "" : `, ${universalFieldSetters}`;
  const batchSizeString =
    config.prismaBatchSize === undefined ? "" : `, ${config.prismaBatchSize}`;
  return `await batchLoad(prisma.${prismaModelName}.findMany, keys${batchSizeString}).then((models) => models.map((m) => ({ ...m${universalFieldSettersString} })))`;
}

// function buildSelfLoaderLines(entity) /* Code */ {
//   const beforeLine = `if (keys.length === 0) { return []; }`;
//   const afterLine = `return (this as any).fromArray(loadedModels);`;
//   const selfModelsLoader =
//     entity.isPrisma === false
//       ? "[/* Please add `skipSelfLoader: true` in entity yaml */]"
//       : buildModelsLoader(utils.toTitleCase(entity.name));
//
//   const universalFields = getUniversalFields(entity);
//   if (universalFields.length === 0) {
//     const loadedModelsLine = `const loadedModels = ${selfModelsLoader};`;
//     return [beforeLine, loadedModelsLine, afterLine];
//   }
//
//   const { entityClass } = entity.strings;
//   const universalFieldLines = universalFields.map((af) => [
//     `const { ${af.name} } = keys[0];`,
//     `if (${af.name} === undefined) {`,
//     `  throw new Error('${entityClass}: ${af.name} is undefined');`,
//     `}`,
//   ]);
//   const universalFieldNameList = universalFields
//     .map((af) => af.name)
//     .join(", ");
//   const keysOmitterLines = [
//     `keys = keys.map(({ ${universalFieldNameList}, ...rest }) => rest);`,
//   ];
//   const prismaModelsLine = `const prismaModels = ${selfModelsLoader};`;
//   const loadedModelsLine = `const loadedModels = prismaModels.map((pm) => ({ ...pm, ${universalFieldNameList} }));`;
//   return [
//     beforeLine,
//     ...universalFieldLines.flat(),
//     ...keysOmitterLines.flat(),
//     prismaModelsLine,
//     loadedModelsLine,
//     afterLine,
//   ];
// }

function buildLoadConfigSetterLines(config, field) /* Code[] */ {
  const universalFields = getUniversalFields(field._type._entity, config);
  const universalFieldInitializeLines = universalFields.length
    ? [
        "targets.forEach((one) => {",
        ...universalFields.map((af) => `  one.${af.name} = this.${af.name};`),
        "});",
      ]
    : [];
  const mapper = field.code.loadConfig.targetMapper;
  const setter = field.code.loadConfig.sourceSetter;
  const mapperLine = `const map = ${mapper};`;
  if (!utils.isEntityTypeField(field)) {
    return [
      ...universalFieldInitializeLines,
      mapperLine,
      `sources.forEach((one) => (one.${field.name} = ${setter}));`,
    ];
  }
  const universalFieldUpdateLines = universalFields.map((af) => [
    utils.isArrayField(field)
      ? `  one.${field.name}.forEach((e) => (e.${af.name} = one.${af.name}));`
      : utils.isNullableField(field)
      ? `  if (one.${field.name} !== null) { one.${field.name}.${af.name} = one.${af.name}; }`
      : `  one.${field.name}.${af.name} = one.${af.name};`,
  ]);
  return [
    ...universalFieldInitializeLines,
    mapperLine,
    `sources.forEach((one) => {`,
    `  one.${field.name} = ${setter};`,
    ...universalFieldUpdateLines.flat(),
    `});`,
  ];
}

function augmentOne(entity, config, isVerbose) /* void */ {
  if (isVerbose) {
    console.log(`[AIRENT-PRISMA/INFO] augmenting ${entity.name}`);
  }

  const prismaBeforeBase = buildBeforeBase(entity, config);
  const prismaInsideBase = buildInsideBase(entity, config);
  const prismaBeforeType = buildBeforeType(entity);
  entity.code.beforeBase.push(...prismaBeforeBase);
  entity.code.insideBase.push(...prismaInsideBase);
  entity.code.beforeType.push(...prismaBeforeType);
  entity.skipSelfLoader = true;
  // entity.code.selfLoaderLines = buildSelfLoaderLines(entity);
  entity.fields.filter(utils.isAssociationField).forEach((field) => {
    const { loadConfig } = field.code;
    const isLoaderGeneratable = buildIsLoaderGeneratable(field);
    loadConfig.isLoaderGeneratable = isLoaderGeneratable;
    loadConfig.targetModelsLoader = isLoaderGeneratable
      ? buildModelsLoader(field._type._entity, config)
      : "[/* TODO: load associated models */]";
    loadConfig.setterLines = buildLoadConfigSetterLines(config, field);
  });
}

function augment(data, isVerbose) {
  const { entityMap, config } = data;
  Object.values(entityMap).forEach((entity) =>
    augmentOne(entity, config, isVerbose)
  );
}

module.exports = { augment };
