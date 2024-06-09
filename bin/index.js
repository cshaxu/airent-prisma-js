#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and store the answer in the config object
function askQuestion(question, defaultAnswer) {
  return new Promise((resolve) =>
    rl.question(`${question} (${defaultAnswer}): `, resolve)
  ).then((a) => (a?.length ? a : defaultAnswer));
}

async function getShouldEnable(name) {
  const shouldEnable = await askQuestion(`Enable "${name}"`, "yes");
  return shouldEnable === "yes";
}

/** @typedef {Object} PrismaConfig
 *  @property {?string} libImportPath
 *  @property {string} extensionSchemaPath
 *  @property {string} prismaImport
 *  @property {string} prismaBatchSize
 */

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} libImportPath
 *  @property {string} schemaPath
 *  @property {string} entityPath
 *  @property {string} contextImportPath
 *  @property {?string[]} [augmentors]
 *  @property {?Template[]} [templates]
 *  @property {?PrismaConfig} prisma
 */

const CONFIG_FILE_PATH = path.join(process.cwd(), "airent.config.json");

const AIRENT_PRISMA_RESOURCES_PATH = "node_modules/@airent/prisma/resources";

const PRISMA_AUGMENTOR_PATH = `${AIRENT_PRISMA_RESOURCES_PATH}/augmentor.js`;

async function loadConfig() {
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const augmentors = config.augmentors ?? [];
  const templates = config.templates ?? [];
  return { ...config, augmentors, templates };
}

async function configure() {
  const config = await loadConfig();
  const { augmentors } = config;
  const isPrismaAugmentorEnabled = augmentors.includes(PRISMA_AUGMENTOR_PATH);
  const shouldEnablePrismaAugmentor = isPrismaAugmentorEnabled
    ? true
    : await getShouldEnable("Prisma");
  if (!shouldEnablePrismaAugmentor) {
    return;
  }
  if (!isPrismaAugmentorEnabled) {
    augmentors.push(PRISMA_AUGMENTOR_PATH);
  }

  config.prisma = config.prisma ?? {};

  config.prisma.prismaImport = await askQuestion(
    'Statement to import "prisma"',
    config.prisma.prismaImport ?? "import prisma from '@/lib/prisma';"
  );
  config.prisma.prismaBatchSize = await askQuestion(
    "Prisma batch size",
    config.prisma.prismaBatchSize ?? "1000"
  );

  const isPrismaYamlGeneratorEnabled =
    !!config.prisma.extensionSchemaPath?.length;
  const shouldEnablePrismaYamlGenerator = isPrismaYamlGeneratorEnabled
    ? false
    : await getShouldEnable("Prisma Dbml-based YAML Generator");
  if (shouldEnablePrismaYamlGenerator) {
    config.prisma.extensionSchemaPath = config.schemaPath;
    config.schemaPath = "node_modules/.airent/schemas";
    config.prisma.primitiveFields = await askQuestion(
      "Default behavior to generate primitive fields (skip | internal | external)",
      "external"
    );
    config.prisma.primitiveFields = await askQuestion(
      "Default behavior to generate primitive fields (skip | internal | external)",
      "internal"
    );
    console.log(
      '[AIRENT-PRISMA/INFO] Please run "npx airent-prisma generate" before "npx airent" in the future.'
    );
  }

  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(CONFIG_FILE_PATH, content);
  console.log(`[AIRENT-PRISMA/INFO] Package configured.`);
}

async function main(args) {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      throw new Error('[AIRENT-PRISMA/ERROR] "airent.config.json" not found');
    }

    if (args.includes("generate")) {
      const { generate } = require("./generate");
      await generate(args);
    } else {
      await configure();
    }
  } finally {
    rl.close();
  }
}

main(process.argv.slice(2)).catch(console.error);
