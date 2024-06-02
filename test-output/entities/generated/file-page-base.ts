// library imports
import { Prisma } from '@prisma/client';
// airent imports
import { ValidatePrismaArgs, batchLoad, batchLoadTopMany, getUpdatedFields } from '../../../src/index';
// config imports
import prisma from '../../../test-resources/prisma';
// entity imports
import { AliasedFileModel } from './aliased-file-type';
import { FilePageChunkModel } from './file-page-chunk-type';
// airent imports
import {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
  sequential,
  toArrayMap,
  toObjectMap,
} from 'airent';

// config imports
import { Context } from '../../../test-resources/context';

// entity imports
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';
import { AliasedFileEntity } from '../aliased-file';
import { FilePageChunkEntity } from '../file-page-chunk';
import {
  FilePageFieldRequest,
  FilePageResponse,
  SelectedFilePageResponse,
  FilePageModel,
} from './file-page-type';

export class FilePageEntityBase extends BaseEntity<
  FilePageModel, Context, FilePageFieldRequest, FilePageResponse
> {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public fileId: string;
  public pageId: number;
  public lines: PrismaJsonValue;

  protected file?: AliasedFileEntity;

  protected chunks?: FilePageChunkEntity[];

  public constructor(
    model: FilePageModel,
    context: Context,
    group: FilePageEntityBase[],
    lock: AsyncLock,
  ) {
    super(context, group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.fileId = model.fileId;
    this.pageId = model.pageId;
    this.lines = model.lines;

    this.initialize(model, context);
  }

  public async present<S extends FilePageFieldRequest>(fieldRequest: S): Promise<SelectedFilePageResponse<S>> {
    await this.beforePresent(fieldRequest);
    const response = {
      ...(fieldRequest.id !== undefined && { id: this.id }),
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.updatedAt !== undefined && { updatedAt: this.updatedAt }),
      ...(fieldRequest.fileId !== undefined && { fileId: this.fileId }),
      ...(fieldRequest.pageId !== undefined && { pageId: this.pageId }),
      ...(fieldRequest.lines !== undefined && { lines: this.lines }),
      ...(fieldRequest.file !== undefined && { file: await this.getFile().then((one) => one.present(fieldRequest.file!)) }),
      ...(fieldRequest.chunks !== undefined && { chunks: await this.getChunks().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chunks!)))) }),
    };
    await this.afterPresent(fieldRequest, response as Select<FilePageResponse, S>);
    return response as SelectedFilePageResponse<S>;
  }

  public static async presentMany<
    ENTITY extends FilePageEntityBase,
    S extends FilePageFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedFilePageResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** associations */

  protected fileLoadConfig: LoadConfig<FilePageEntityBase, AliasedFileEntity> = {
    name: 'FilePageEntity.file',
    filter: (one: FilePageEntityBase) => one.file === undefined,
    getter: (sources: FilePageEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.fileId,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.aliasedFile.findMany, keys, 1234);
      return AliasedFileEntity.fromArray(models, this.context);
    },
    setter: (sources: FilePageEntityBase[], targets: AliasedFileEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }), (one) => one);
      sources.forEach((one) => {
        one.file = map.get(JSON.stringify({ id: one.fileId }))!;
      });
    },
  };

  public async getFile(): Promise<AliasedFileEntity> {
    if (this.file !== undefined) {
      return this.file;
    }
    await this.load(this.fileLoadConfig);
    return this.file!;
  }

  public setFile(file?: AliasedFileEntity): void {
    this.file = file;
  }

  protected chunksLoadConfig: LoadConfig<FilePageEntityBase, FilePageChunkEntity> = {
    name: 'FilePageEntity.chunks',
    filter: (one: FilePageEntityBase) => one.chunks === undefined,
    getter: (sources: FilePageEntityBase[]) => {
      return sources
        .map((one) => ({
          fileId: one.fileId,
          pageId: one.pageId,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.filePageChunk.findMany, keys, 1234);
      return FilePageChunkEntity.fromArray(models, this.context);
    },
    setter: (sources: FilePageEntityBase[], targets: FilePageChunkEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ fileId: one.fileId, pageId: one.pageId }), (one) => one);
      sources.forEach((one) => {
        one.chunks = map.get(JSON.stringify({ fileId: one.fileId, pageId: one.pageId })) ?? [];
      });
    },
  };

  public async getChunks(): Promise<FilePageChunkEntity[]> {
    if (this.chunks !== undefined) {
      return this.chunks;
    }
    await this.load(this.chunksLoadConfig);
    return this.chunks!;
  }

  public setChunks(chunks?: FilePageChunkEntity[]): void {
    this.chunks = chunks;
  }

  protected initialize(model: FilePageModel, context: Context): void {
    if (model.file !== undefined) {
      this.file = AliasedFileEntity.fromOne(model.file, context);
    }
    if (model.chunks !== undefined) {
      this.chunks = FilePageChunkEntity.fromArray(model.chunks, context);
    }
  }

  /** prisma wrappers */

  public static count = prisma.filePage.count;

  public static aggregate = prisma.filePage.aggregate;

  public static groupBy = prisma.filePage.groupBy;

  public static createMany = prisma.filePage.createMany;

  public static updateMany = prisma.filePage.updateMany;

  public static deleteMany = prisma.filePage.deleteMany;

  public static async findMany<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindManyArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindManyArgs>,
    context: Context,
  ): Promise<ENTITY[]> {
    const models = await prisma.filePage.findMany(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindManyArgs>
    );
    const many = (this as any).fromArray(models, context);
    return many;
  }

  public static async findUnique<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindUniqueArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindUniqueArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePage.findUnique(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindUniqueArgs>
    );
    const one = model === null ? null : (this as any).fromOne(model, context) as ENTITY;
    return one;
  }

  public static async findFirst<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindFirstArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindFirstArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePage.findFirst(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindFirstArgs>
    );
    const one = model === null ? null : (this as any).fromOne(model, context) as ENTITY;
    return one;
  }

  public static async findUniqueOrThrow<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindUniqueOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.findUniqueOrThrow(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindUniqueOrThrowArgs>
    );
    const one = (this as any).fromOne(model, context) as ENTITY;
    return one;
  }

  public static async findFirstOrThrow<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindFirstOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.findFirstOrThrow(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindFirstOrThrowArgs>
    );
    const one = (this as any).fromOne(model, context) as ENTITY;
    return one;
  }

  protected static beforeCreate<ENTITY extends FilePageEntityBase>(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    _context: Context
  ): void | Promise<void> {}

  protected static afterCreate<ENTITY extends FilePageEntityBase>(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    _one: ENTITY,
    _context: Context
  ): void | Promise<void> {}

  public static async create<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageCreateArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageCreateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    await (this as any).beforeCreate(context);
    const model = await prisma.filePage.create(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageCreateArgs>
    );
    const one = (this as any).fromOne(model, context) as ENTITY;
    await (this as any).afterCreate(one, context);
    return one;
  }

  protected static PRIMITIVE_FIELDS = [
    'id',
    'createdAt',
    'updatedAt',
    'fileId',
    'pageId',
    'lines',
  ];

  protected static beforeUpdate<ENTITY extends FilePageEntityBase>(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    _oneBefore: ENTITY,
    _context: Context
  ): void | Promise<void> {}

  protected static afterUpdate<ENTITY extends FilePageEntityBase>(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    _oneBefore: ENTITY,
    _oneAfter: ENTITY,
    _updatedFields: string[],
    _context: Context
  ): void | Promise<void> {}

  public static async update<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageUpdateArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageUpdateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const oneBefore = await (this as any).findUniqueOrThrow(
      { where: args.where },
      context
    ) as ENTITY;
    await (this as any).beforeUpdate(oneBefore, context);
    const model = await prisma.filePage.update(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageUpdateArgs>
    );
    const one = (this as any).fromOne(model, context) as ENTITY;
    const updatedFields = getUpdatedFields(
      oneBefore,
      one,
      (this as any).PRIMITIVE_FIELDS
    );
    await (this as any).afterUpdate(oneBefore, one, updatedFields, context);
    return one;
  }

  protected static beforeDelete<ENTITY extends FilePageEntityBase>(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    _oneBefore: ENTITY,
    _context: Context
  ): void | Promise<void> {}

  protected static afterDelete<ENTITY extends FilePageEntityBase>(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    _oneBefore: ENTITY,
    _context: Context
  ): void | Promise<void> {}

  public static async delete<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageDeleteArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageDeleteArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const oneBefore = await (this as any).findUniqueOrThrow(
      { where: args.where },
      context
    ) as ENTITY;
    await (this as any).beforeDelete(oneBefore, context);
    const model = await prisma.filePage.delete(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageDeleteArgs>
    );
    const one = (this as any).fromOne(model, context) as ENTITY;
    await (this as any).afterDelete(oneBefore, context);
    return one;
  }

  public static async upsert<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageUpsertArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageUpsertArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const oneBefore = await (this as any).findUnique(
      { where: args.where },
      context
    ) as ENTITY;
    if (oneBefore === null) {
      await (this as any).beforeCreate(context);
    } else {
      await (this as any).beforeUpdate(oneBefore, context);
    }
    const model = await prisma.filePage.upsert(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageUpsertArgs>
    );
    const one = (this as any).fromOne(model, context) as ENTITY;
    if (oneBefore === null) {
      await (this as any).afterCreate(one, context);
    } else {
      const updatedFields = getUpdatedFields(
        oneBefore,
        one,
        (this as any).PRIMITIVE_FIELDS
      );
      await (this as any).afterUpdate(oneBefore, one, updatedFields, context);
    }
    return one;
  }
}
