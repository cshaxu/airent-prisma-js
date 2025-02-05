const path = require("path");
const utils = require("airent/resources/utils.js");

function buildRelativePath(sourcePath, targetPath) /* string */ {
  const rawRelativePath = path
    .relative(sourcePath, targetPath)
    .replaceAll("\\", "/");
  return rawRelativePath.startsWith(".")
    ? rawRelativePath
    : `./${rawRelativePath}`;
}

function buildRelativeFull(sourcePath, targetPath, config) /* string */ {
  if (!targetPath.startsWith(".")) {
    return targetPath;
  }
  const suffix = utils.getModuleSuffix(config);
  const relativePath = buildRelativePath(sourcePath, targetPath);
  return `${relativePath}${suffix}`;
}

function augmentConfig(config) /* void */ {
  const { libImportPath } = config.prisma;
  config._packages.prisma = config._packages.prisma ?? {};
  config._packages.prisma.baseToLibFull = libImportPath
    ? buildRelativeFull(
        path.join(config.entityPath, "generated"),
        libImportPath,
        config
      )
    : "@airent/prisma";
}

/**
 * YAML FLAGS
 * - prisma: { skipFields: string[]; internalFields: string[]; deprecatedFields: string[] }
 * - isPrisma: false | undefined, top-level flag, false to skip generating prisma wrappers
 * - isPrisma: boolean | undefined, field-level flag to note field as prisma generated field
 * - prismaLoader: boolean | undefined, field-level flag to decide whether to generate loader for the field
 * - orderBy: object | undefined, association-field-level key to specify orderBy for the field loader
 * - take: number | undefined, association-field-level key to specify limit on the field
 */

// build entity._code.beforeBase

function buildBeforeBase(entity, config) /* Code[] */ {
  const libraryImports = [];
  if (entity.isPrisma !== false) {
    libraryImports.push("// library imports");
    libraryImports.push("import { Prisma } from '@prisma/client';");
  }
  const airentImports = [
    "// airent imports",
    `import { ValidatePrismaArgs, batchLoad, batchLoadTopMany, entityCompare } from '${config._packages.prisma.baseToLibFull}';`,
  ];
  const configImports = [
    "// config imports",
    JSON.parse(JSON.stringify(config.prisma.prismaImport)) ??
      "import prisma from 'TODO: specify prismaImport in your airent config';",
  ];

  const entityImports = [
    "// entity imports",
    `import { ${utils.toPascalCase(entity.name)}PrimitiveField } from '${
      config._packages.baseToTypePath
    }/${entity._strings.moduleName}';`,
    ...buildModelImports(entity, config._packages.baseToTypePath),
  ];

  return [
    ...libraryImports,
    ...airentImports,
    ...configImports,
    ...entityImports,
  ];
}

// build entity._code.beforeType
function buildBeforeType(entity, config) /* Code[] */ {
  return buildModelImports(entity, ".");
}

function buildModelImports(entity, relativePath) /* Code[] */ {
  const prismaAssociationTypes = entity.fields
    .filter(utils.isAssociationField)
    .filter((f) => f.isPrisma)
    .map((f) => f._type);
  const addedTypeNames = new Set();
  if (prismaAssociationTypes.length === 0) {
    return [];
  }
  return prismaAssociationTypes
    .map((t) => {
      if (addedTypeNames.has(t.name)) {
        return "";
      }
      addedTypeNames.add(t.name);
      return `import { ${utils.toPascalCase(
        t.name
      )}Model } from '${relativePath}/${t._entity._strings.moduleName}';`;
    })
    .filter((line) => line.length > 0);
}

// build entity._code.afterType
function buildAfterType(entity) /* Code[] */ {
  const primitiveFields = entity.fields
    .filter(utils.isPrimitiveField)
    .map((f) => `'${f.name}'`)
    .join(" | ");
  return [
    "",
    ...(entity.deprecated ? ["/** @deprecated */"] : []),
    `export type ${utils.toPascalCase(
      entity.name
    )}PrimitiveField = ${primitiveFields};`,
  ];
}

// build entity._code.insideBase

function buildInitializeMethodLines(entity) /* Code[] */ {
  const lines = entity.fields
    .filter(utils.isAssociationField)
    .filter((f) => f.isPrisma)
    .flatMap((f) => [
      `if (model.${f.name} !== undefined) {`,
      `  this.${f.name} = ${
        utils.isNullableField(f) ? `model.${f.name} === null ? null : ` : ""
      }${f._type._entity._strings.entityClass}.${
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

function buildPrismaPassThruMethodLines(entity, prismaMethod) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  return [
    "",
    `public static ${prismaMethod} = prisma.${prismaModelName}.${prismaMethod};`,
  ];
}

function buildPrismaArgName(entity, prismaMethod) /* Code */ {
  return `Prisma.${utils.toPascalCase(entity.name)}${utils.toPascalCase(
    prismaMethod
  )}Args`;
}

function buildPrismaMethodSignatureLines(
  entity,
  prismaMethod,
  typeSuffix
) /* Code[] */ {
  const prismaArgName = buildPrismaArgName(entity, prismaMethod);
  return [
    "",
    `public static async ${prismaMethod}<`,
    `  ENTITY extends ${entity._strings.baseClass},`,
    `  T extends ${prismaArgName},`,
    ">(",
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    `  args: ValidatePrismaArgs<T, ${prismaArgName}>,`,
    "  context: Context,",
    `): Promise<ENTITY${typeSuffix}> {`,
  ];
}

function buildPrismaManyMethodLines(entity, prismaMethod) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  const prismaArgName = buildPrismaArgName(entity, prismaMethod);
  const signatureLines = buildPrismaMethodSignatureLines(
    entity,
    prismaMethod,
    "[]"
  );
  const returnLines = ["  return many;", "}"];

  const executionLines = [
    `  const models = await prisma.${prismaModelName}.${prismaMethod}(`,
    `    args as unknown as Prisma.SelectSubset<T, ${prismaArgName}>`,
    "  );",
    "  const many = (this as any).fromArray(models, context);",
  ];

  return [...signatureLines, ...executionLines, ...returnLines];
}

function buildPrismaOneMethodLines(
  entity,
  prismaMethod,
  isNullable,
  beforeExecutionLines = [],
  afterExecutionLines = []
) /* Code[] */ {
  const prismaModelName = utils.toCamelCase(entity.name);
  const prismaArgName = buildPrismaArgName(entity, prismaMethod);

  const signatureLines = buildPrismaMethodSignatureLines(
    entity,
    prismaMethod,
    isNullable ? " | null" : ""
  );
  const returnLines = ["  return one;", "}"];

  const executionLines = [
    `  const model = await prisma.${prismaModelName}.${prismaMethod}(`,
    `    args as unknown as Prisma.SelectSubset<T, ${prismaArgName}>`,
    "  );",
    `  const one = ${
      isNullable ? "model === null ? null : " : ""
    }(this as any).fromOne(model, context) as ENTITY;`,
  ];

  return [
    ...signatureLines,
    ...beforeExecutionLines.map((line) => `  ${line}`),
    ...executionLines,
    ...afterExecutionLines.map((line) => `  ${line}`),
    ...returnLines,
  ];
}

function buildPrismaNullableReadOneMethodLines(
  entity,
  prismaMethod
) /* Code[] */ {
  return buildPrismaOneMethodLines(entity, prismaMethod, true);
}

function buildPrismaNonNullableReadOneMethodLines(
  entity,
  prismaMethod
) /* Code[] */ {
  return buildPrismaOneMethodLines(entity, prismaMethod, false);
}

function buildOneBeforeLines(isThrow) {
  return [
    `const oneBefore = await (this as any).findUnique${
      isThrow ? "OrThrow" : ""
    }(`,
    "  { where: args.where },",
    "  context",
    ") as ENTITY;",
  ];
}

const BEFORE_CREATE_LINES = ["await (this as any).beforeCreate(context);"];
const AFTER_CREATE_LINES = ["await (this as any).afterCreate(one, context);"];

function buildPrismaCreateOneMethodLines(entity) /* Code[] */ {
  const beforeAndAfterHooksLines = [
    "",
    `protected static beforeCreate<ENTITY extends ${entity._strings.baseClass}>(`,
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    "  _context: Context",
    "): void | Promise<void> {}",
    "",
    `protected static afterCreate<ENTITY extends ${entity._strings.baseClass}>(`,
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    "  _one: ENTITY,",
    "  _context: Context",
    "): void | Promise<void> {}",
  ];

  const prismaOneMethodLines = buildPrismaOneMethodLines(
    entity,
    "create",
    false,
    BEFORE_CREATE_LINES,
    AFTER_CREATE_LINES
  );

  return [...beforeAndAfterHooksLines, ...prismaOneMethodLines];
}

const BEFORE_UPDATE_LINES = [
  ...buildOneBeforeLines(true),
  "await (this as any).beforeUpdate(oneBefore, context);",
];
const AFTER_UPDATE_LINES = [
  "const updatedFields = entityCompare(",
  "  oneBefore,",
  "  one,",
  "  (this as any).PRIMITIVE_FIELDS",
  ");",
  "await (this as any).afterUpdate(oneBefore, one, updatedFields, context);",
];

function buildPrismaUpdateOneMethodLines(entity) /* Code[] */ {
  const beforeAndAfterHooksLines = [
    "",
    `protected static PRIMITIVE_FIELDS: ${utils.toPascalCase(
      entity.name
    )}PrimitiveField[] = [`,
    ...entity.fields
      .filter(utils.isPrimitiveField)
      .map((f) => `  '${f.name}',`),
    "];",
    "",
    `protected static beforeUpdate<ENTITY extends ${entity._strings.baseClass}>(`,
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    "  _oneBefore: ENTITY,",
    "  _context: Context",
    "): void | Promise<void> {}",
    "",
    `protected static afterUpdate<ENTITY extends ${entity._strings.baseClass}>(`,
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    "  _oneBefore: ENTITY,",
    "  _oneAfter: ENTITY,",
    `  _updatedFields: ${utils.toPascalCase(entity.name)}PrimitiveField[],`,
    "  _context: Context",
    "): void | Promise<void> {}",
  ];

  const prismaOneMethodLines = buildPrismaOneMethodLines(
    entity,
    "update",
    false,
    BEFORE_UPDATE_LINES,
    AFTER_UPDATE_LINES
  );

  return [...beforeAndAfterHooksLines, ...prismaOneMethodLines];
}

const BEFORE_DELETE_LINES = [
  ...buildOneBeforeLines(true),
  "await (this as any).beforeDelete(oneBefore, context);",
];
const AFTER_DELETE_LINES = [
  "await (this as any).afterDelete(oneBefore, context);",
];

function buildPrismaDeleteOneMethodLines(entity) /* Code[] */ {
  const beforeAndAfterHooksLines = [
    "",
    `protected static beforeDelete<ENTITY extends ${entity._strings.baseClass}>(`,
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    "  _oneBefore: ENTITY,",
    "  _context: Context",
    "): void | Promise<void> {}",
    "",
    `protected static afterDelete<ENTITY extends ${entity._strings.baseClass}>(`,
    `  this: EntityConstructor<${entity.model}, Context, ENTITY>,`,
    "  _oneBefore: ENTITY,",
    "  _context: Context",
    "): void | Promise<void> {}",
  ];

  const prismaOneMethodLines = buildPrismaOneMethodLines(
    entity,
    "delete",
    false,
    BEFORE_DELETE_LINES,
    AFTER_DELETE_LINES
  );

  return [...beforeAndAfterHooksLines, ...prismaOneMethodLines];
}

function buildPrismaUpsertOneMethodLines(entity) /* Code[] */ {
  const beforeExecutionLines = [
    ...buildOneBeforeLines(false),
    "if (oneBefore === null) {",
    ...BEFORE_CREATE_LINES.map((line) => `  ${line}`),
    "} else {",
    "  await (this as any).beforeUpdate(oneBefore, context);",
    "}",
  ];
  const afterExecutionLines = [
    "if (oneBefore === null) {",
    ...AFTER_CREATE_LINES.map((line) => `  ${line}`),
    "} else {",
    ...AFTER_UPDATE_LINES.map((line) => `  ${line}`),
    "}",
  ];
  return buildPrismaOneMethodLines(
    entity,
    "upsert",
    false,
    beforeExecutionLines,
    afterExecutionLines
  );
}

function buildInsideBase(entity) /* Code[] */ {
  if (entity.isPrisma === false) {
    return [];
  }
  const passThruMethods = [
    "count",
    "aggregate",
    "groupBy",
    "createMany",
    "updateMany",
    "deleteMany",
  ];
  const nullableReadOneMethods = ["findUnique", "findFirst"];
  const nonNullableReadOneMethods = ["findUniqueOrThrow", "findFirstOrThrow"];
  return [
    ...buildInitializeMethodLines(entity),
    "",
    "/** prisma wrappers */",
    ...passThruMethods.flatMap((n) =>
      buildPrismaPassThruMethodLines(entity, n)
    ),
    ...buildPrismaManyMethodLines(entity, "findMany"),
    ...nullableReadOneMethods.flatMap((n) =>
      buildPrismaNullableReadOneMethodLines(entity, n)
    ),
    ...nonNullableReadOneMethods.flatMap((n) =>
      buildPrismaNonNullableReadOneMethodLines(entity, n)
    ),
    ...buildPrismaCreateOneMethodLines(entity),
    ...buildPrismaUpdateOneMethodLines(entity),
    ...buildPrismaDeleteOneMethodLines(entity),
    ...buildPrismaUpsertOneMethodLines(entity),
  ];
}

// build entity.fields._code.loadConfig

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

  const entName = utils.toPascalCase(entity.name);
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

function augmentOne(entity, config, isVerbose) /* void */ {
  if (isVerbose) {
    console.log(`[AIRENT-PRISMA/INFO] augmenting ${entity.name}`);
  }

  const prismaBeforeBase = buildBeforeBase(entity, config);
  const prismaInsideBase = buildInsideBase(entity);
  const prismaBeforeType = buildBeforeType(entity, config);
  const prismaAfterType = buildAfterType(entity);
  entity._code.beforeBase.push(...prismaBeforeBase);
  entity._code.insideBase.push(...prismaInsideBase);
  entity._code.beforeType.push(...prismaBeforeType);
  entity._code.afterType.push(...prismaAfterType);
  entity.skipSelfLoader = true;
  entity.fields.filter(utils.isAssociationField).forEach((field) => {
    const { loadConfig } = field._code;
    const isLoaderGeneratable = buildIsLoaderGeneratable(field);
    loadConfig.isLoaderGeneratable = isLoaderGeneratable;
    loadConfig.targetModelsLoader = isLoaderGeneratable
      ? buildAssociationFieldModelsLoader(field, config)
      : "[/* TODO: load associated models */]";
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
