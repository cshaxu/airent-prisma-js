const utils = require("airent/resources/utils");

/** this optional plugin enables "explodeSourceKey" feature for array fields as source key
 * example in YAML:
 * - id: 0
 *   name: products
 *   type: Product[]
 *   strategy: association
 *   sourceKeys:
 *     - productIds
 *   targetKeys:
 *     - id
 *   explodeSourceKey: productIds
 */

function getLoadConfigGetterLinesWithExplodeSourceKey(field) /* Code[] */ {
  const explodeSourceKeyIndex = field.sourceKeys.indexOf(
    field.explodeSourceKey
  );
  if (explodeSourceKeyIndex < 0) {
    throw new Error(
      "[AIRENT/PRISMA/ERROR] sourceKeys must include explodeSourceKey"
    );
  }
  const entity = field._parent;
  if (!utils.isArrayField(field)) {
    throw new Error(
      `[AIRENT/PRISMA/ERROR] '${entity.name}.${field.name}' must be an array field to enable 'explodeSourceKey'.`
    );
  }
  const explodeSourceField = utils.queryField(field.explodeSourceKey, entity);
  if (!explodeSourceField) {
    throw new Error(
      `[AIRENT/PRISMA/ERROR] '${entity.name}.${field.explodeSourceKey}' is missing.`
    );
  }
  if (!utils.isArrayField(explodeSourceField)) {
    throw new Error(
      `[AIRENT/PRISMA/ERROR] '${entity.name}.${field.explodeSourceKey}' must be an array field to enable 'explodeSourceKey'.`
    );
  }

  const { getterLines } = field._code.loadConfig;
  if (getterLines !== undefined) {
    return getterLines;
  }

  const sourceFields = utils.getSourceFields(field);
  const targetFields = utils.getTargetFields(field);
  const targetFilters = utils.getTargetFilters(field);
  // reject nullable sourceField whose targetField is required
  const filters = sourceFields
    .filter(
      (sf, i) =>
        utils.isNullableField(sf) && !utils.isNullableField(targetFields[i])
    )
    .map((sf) => `  .filter((one) => one.${sf._strings.fieldGetter} !== null)`);
  const mappedFields = sourceFields.map((sf, i) => {
    const rawTargetFieldName = targetFields[i].aliasOf ?? targetFields[i].name;
    if (i === explodeSourceKeyIndex) {
      return `      ${rawTargetFieldName},`;
    }
    return `      ${rawTargetFieldName}: one.${sf._strings.fieldGetter},`;
  });
  const filterFields = targetFilters.map((tf) => {
    const rawTargetFieldName = tf.aliasOf ?? tf.name;
    return `      ${rawTargetFieldName}: ${tf.value},`;
  });
  return [
    "return sources",
    ...filters,
    "  .flatMap((one) =>",
    `    one.${explodeSourceField._strings.fieldGetter}.map((${
      targetFields[explodeSourceKeyIndex].aliasOf ??
      targetFields[explodeSourceKeyIndex].name
    }) => ({`,
    ...mappedFields,
    ...filterFields,
    "  })));",
  ];
}

function getLoadConfigSetterLinesWithExplodeSourceKey(field) /* Code[] */ {
  const explodeSourceKeyIndex = field.sourceKeys.indexOf(
    field.explodeSourceKey
  );
  if (explodeSourceKeyIndex < 0) {
    throw new Error(
      "[AIRENT/PRISMA/ERROR] sourceKeys must include explodeSourceKey"
    );
  }
  const entity = field._parent;
  if (!utils.isArrayField(field)) {
    throw new Error(
      `[AIRENT/PRISMA/ERROR] '${entity.name}.${field.name}' must be an array field to enable 'explodeSourceKey'.`
    );
  }
  const explodeSourceField = utils.queryField(field.explodeSourceKey, entity);
  if (!explodeSourceField) {
    throw new Error(
      `[AIRENT/PRISMA/ERROR] '${entity.name}.${field.explodeSourceKey}' is missing.`
    );
  }
  if (!utils.isArrayField(explodeSourceField)) {
    throw new Error(
      `[AIRENT/PRISMA/ERROR] '${entity.name}.${field.explodeSourceKey}' must be an array field to enable 'explodeSourceKey'.`
    );
  }

  const { setterLines } = field._code.loadConfig;
  if (setterLines !== undefined) {
    return setterLines;
  }

  const sourceFields = utils.getSourceFields(field);
  const targetFields = utils.getTargetFields(field);

  // build target mapper
  const targetKeyString = `JSON.stringify({ ${targetFields
    .map((tf, i) => `${tf.name}: one.${targetFields[i]._strings.fieldGetter}`)
    .join(", ")} })`;
  const targetMapper = `toObjectMap(targets, (one) => ${targetKeyString}, (one) => one)`;

  // build source setter

  const nullConditions = sourceFields
    .filter(
      (sf, i) =>
        utils.isNullableField(sf) && !utils.isNullableField(targetFields[i])
    )
    .map((sf) => `one.${sf._strings.fieldGetter} === null`)
    .join(" || ");
  const nullSetter =
    nullConditions.length === 0
      ? ""
      : `(${nullConditions}) ? ${utils.isArrayField(field) ? "[]" : "null"} : `;
  const sourceKeyString = `JSON.stringify({ ${targetFields
    .map((tf, i) => {
      if (i === explodeSourceKeyIndex) {
        return tf.name;
      }
      return `${tf.name}: one.${sourceFields[i]._strings.fieldGetter}`;
    })
    .join(", ")} })`;
  const sourceSetter = `${nullSetter}one.${explodeSourceField._strings.fieldGetter}.map((${targetFields[explodeSourceKeyIndex].name}) => ${sourceKeyString}).filter((key) => map.has(key)).map((key) => map.get(key)!)`;

  return [
    `const map = ${targetMapper};`,
    `sources.forEach((one) => (one.${field.name} = ${sourceSetter}));`,
  ];
}

function augmentTemplates(templates) /* void */ {
  const baseTemplate = templates.find((t) =>
    t.name.includes("base-template.ts.ejs")
  );
  const entityTemplate = templates.find((t) =>
    t.name.includes("entity-template.ts.ejs")
  );

  baseTemplate.functions.originalGetLoadConfigGetterLines =
    baseTemplate.functions.getLoadConfigGetterLines;
  baseTemplate.functions.getLoadConfigGetterLines = (field) =>
    field.explodeSourceKey
      ? getLoadConfigGetterLinesWithExplodeSourceKey(field)
      : baseTemplate.functions.originalGetLoadConfigGetterLines(field);

  entityTemplate.functions.originalGetLoadConfigGetterLines =
    entityTemplate.functions.getLoadConfigGetterLines;
  entityTemplate.functions.getLoadConfigGetterLines = (field) =>
    field.explodeSourceKey
      ? getLoadConfigGetterLinesWithExplodeSourceKey(field)
      : entityTemplate.functions.originalGetLoadConfigGetterLines(field);

  baseTemplate.functions.originalGetLoadConfigSetterLines =
    baseTemplate.functions.getLoadConfigSetterLines;
  baseTemplate.functions.getLoadConfigSetterLines = (field) =>
    field.explodeSourceKey
      ? getLoadConfigSetterLinesWithExplodeSourceKey(field)
      : baseTemplate.functions.originalGetLoadConfigSetterLines(field);

  entityTemplate.functions.originalGetLoadConfigSetterLines =
    entityTemplate.functions.getLoadConfigSetterLines;
  entityTemplate.functions.getLoadConfigSetterLines = (field) =>
    field.explodeSourceKey
      ? getLoadConfigSetterLinesWithExplodeSourceKey(field)
      : entityTemplate.functions.originalGetLoadConfigSetterLines(field);
}

function augment(data) {
  augmentTemplates(data.templates);
}

module.exports = { augment };
