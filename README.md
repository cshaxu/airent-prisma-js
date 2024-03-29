# @airent/prisma

Airent Prisma Plugin - Automatically generate Airent schema and data loaders with Prisma.js

## Why do you need this?

- It can automatically generate Airent schema YAML definitions from your Prisma schema definitions. You will not have to copy the primitive or association fields from your Prisma schema any more!
- It can automatically generate Airent data loaders for your entities so you don't need to write any data-level code at all!

## Getting Started

### Installation

First, install with npm:

```bash
npm install @airent/prisma
```

Then, update the configuration file `airent.config.js` with the following command:

```bash
npx airent-prisma
```

### Generate Airent schema YAML definitions

Every time after you update your Prisma schema, you can run the following command to update your Airent schema YAML definitions:

```bash
npx airent-prisma generate
```

This will generate the Airent schema YAML definitions in `node_modules/.airent`. Make sure you always run this command before you run `npx airent` to generate your Typescript code.

### (Optional) Simplify your entity schemas

Review primitive and association fields in your existing entity schema, and you can safely remove the fields that are already defined in your Prisma DBML files. You may also reomve the `model` line and some `types` from your entity schema, as they will be automatically generated by Airent-Prisma.

### (Optional) Customize your entity schemas

If you want to make certain primitive or association fields internal and not expose them in presenters or field requests, simple add these lines to your entity schema:

```yaml
prisma:
  internalFields:
    - field1
    - field2
```

This is it. Have fun!
