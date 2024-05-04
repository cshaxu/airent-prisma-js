const path = require("path");
const utils = require("airent/resources/utils.js");

function enforceRelativePath(relativePath) /* string */ {
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function buildRelativePackage(sourcePath, targetPath, config) /* string */ {
  if (!targetPath.startsWith(".")) {
    return targetPath;
  }
  const suffix = utils.getModuleSuffix(config);
  const relativePath = enforceRelativePath(
    path.relative(sourcePath, targetPath).replaceAll("\\", "/")
  );
  return `${relativePath}${suffix}`;
}

function augmentConfig(config) /* void */ {
  const { libImportPath } = config.prisma;
  config.prisma.baseLibPackage = libImportPath
    ? buildRelativePackage(
        path.join(config.entityPath, "generated"),
        libImportPath,
        config
      )
    : "@airent/prisma";
  config.prisma.entityLibPackage = libImportPath
    ? buildRelativePackage(config.entityPath, libImportPath, config)
    : "@airent/prisma";
}

/**
 * YAML FLAGS
 * - prisma: { skipFields: string[]; internalFields: string[]; universalFields: string[] }
 * - isPrisma: false | undefined, top-level flag, false to skip generating prisma wrappers
 * - isPrisma: boolean | undefined, field-level flag to note field as prisma generated field
 * - prismaLoader: boolean | undefined, field-level flag to decide whether to generate loader for the field
 * - orderBy: object | undefined, association-field-level key to specify orderBy for the field loader
 * - take: number | undefined, association-field-level key to specify limit on the field
 */

// build entity.code.beforeBase

function buildBeforeBase(entity, config) /* Code[] */ {
  const requiredImports = [
    `import { ValidatePrismaArgs, batchLoad, batchLoadTopMany } from '${config.prisma.baseLibPackage}';`,
  ];
  if (entity.isPrisma !== false) {
    requiredImports.push("import { Prisma } from '@prisma/client';");
  }
  const prismaImport =
    JSON.parse(JSON.stringify(config.prisma.prismaImport)) ??
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

function buildPrismaArgName(entity, prismaMethod) /* Code */ {
  return `Prisma.${utils.toTitleCase(entity.name)}${utils.toTitleCase(
    prismaMethod
  )}Args`;
}

function buildPrismaMethodSignatureLines(
  config,
  entity,
  prismaMethod,
  typeSuffix
) /* Code[] */ {
  const prismaArgName = buildPrismaArgName(entity, prismaMethod);
  return [
    "",
    `public static async ${prismaMethod}<`,
    `  ENTITY extends ${entity.strings.baseClass},`,
    `  T extends ${prismaArgName},`,
    ">(",
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    `  args: ValidatePrismaArgs<T, ${prismaArgName}>,`,
    "  context: Context,",
    `): Promise<ENTITY${typeSuffix}> {`,
  ];
}

function buildPrismaManyMethodLines(entity, config, prismaMethod) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  const prismaArgName = buildPrismaArgName(entity, prismaMethod);
  const beforeLines = buildPrismaMethodSignatureLines(
    config,
    entity,
    prismaMethod,
    "[]"
  );
  const afterLines = [
    "  return (this as any).fromArray(models, context);",
    "}",
  ];

  const prismaLoaderLines = [
    `  const models = await prisma.${prismaModelName}.${prismaMethod}(`,
    `    args as unknown as Prisma.SelectSubset<T, ${prismaArgName}>`,
    "  );",
  ];

  return [...beforeLines, ...prismaLoaderLines, ...afterLines];
}

function buildPrismaOneMethodLines(
  config,
  entity,
  prismaMethod,
  isNullable
) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  const prismaArgName = buildPrismaArgName(entity, prismaMethod);

  const beforeLines = buildPrismaMethodSignatureLines(
    config,
    entity,
    prismaMethod,
    isNullable ? " | null" : ""
  );
  const afterLines = ["  return (this as any).fromOne(model, context);", "}"];

  const prismaLoaderLines = [
    `  const model = await prisma.${prismaModelName}.${prismaMethod}(args as unknown as Prisma.SelectSubset<T, ${prismaArgName}>);`,
    ...(isNullable
      ? [`  if (model === null) {`, "    return null;", "  }"]
      : []),
  ];

  return [...beforeLines, ...prismaLoaderLines, ...afterLines];
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
  const lines = entity.fields
    .filter(utils.isAssociationField)
    .filter((f) => f.isPrisma)
    .flatMap((f) => [
      `if (model.${f.name} !== undefined) {`,
      `  this.${f.name} = ${
        utils.isNullableField(f) ? `model.${f.name} === null ? null : ` : ""
      }${f._type._entity.strings.entityClass}.${
        utils.isArrayField(f) ? "fromArray" : "fromOne"
      }(${`model.${f.name}`}, context);`,
      "}",
    ])
    .map((line) => `  ${line}`);
  if (lines.length === 0) {
    return [];
  }
  return [
    "",
    `protected initialize(model: ${entity.model}, context: Context): void {`,
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

function buildAssociationFieldModelsLoader(field, config) /* Code */ {
  const batch = field.take ? "batchLoadTopMany" : "batchLoad";

  const entity = field._type._entity;

  const entName = utils.toTitleCase(entity.name);
  const prismaModelName = utils.toCamelCase(entName);
  const loader = field.orderBy?.length
    ? `(query) => prisma.${prismaModelName}.findMany({ ...query, orderBy: { ${field.orderBy
        .flatMap((item) => Object.keys(item).map((k) => `${k}: '${item[k]}'`))
        .join(", ")} } })`
    : `prisma.${prismaModelName}.findMany`;

  const targetFields = utils.getTargetFields(field);
  const matcher = field.take
    ? `, (key, entity) => ${targetFields
        .map((tf) => `key.${tf.aliasOf ?? tf.name} === entity.${tf.name}`)
        .join(" && ")}`
    : "";

  const topSize = field.take ? `, ${field.take}` : "";

  const batchSize =
    config.prisma.prismaBatchSize === undefined
      ? ""
      : `, ${config.prisma.prismaBatchSize}`;

  return `await ${batch}(${loader}${matcher}, keys${topSize}${batchSize})`;
}

function buildLoadConfigSetterLines(field) /* Code[] */ {
  const mapper = field.code.loadConfig.targetMapper;
  const setter = field.code.loadConfig.sourceSetter;
  const mapperLine = `const map = ${mapper};`;
  if (!utils.isEntityTypeField(field)) {
    return [
      mapperLine,
      `sources.forEach((one) => (one.${field.name} = ${setter}));`,
    ];
  }
  return [
    mapperLine,
    `sources.forEach((one) => {`,
    `  one.${field.name} = ${setter};`,
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
  entity.fields.filter(utils.isAssociationField).forEach((field) => {
    const { loadConfig } = field.code;
    const isLoaderGeneratable = buildIsLoaderGeneratable(field);
    loadConfig.isLoaderGeneratable = isLoaderGeneratable;
    loadConfig.targetModelsLoader = isLoaderGeneratable
      ? buildAssociationFieldModelsLoader(field, config)
      : "[/* TODO: load associated models */]";
    loadConfig.setterLines = buildLoadConfigSetterLines(field);
  });
}

function augment(data, isVerbose) {
  const { entityMap, config } = data;
  augmentConfig(config, isVerbose);
  Object.values(entityMap).forEach((entity) =>
    augmentOne(entity, config, isVerbose)
  );
}

module.exports = { augment };
