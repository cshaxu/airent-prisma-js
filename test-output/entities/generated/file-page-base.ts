import { ValidatePrismaArgs, batchLoad, batchLoadTopMany } from '../../../src/index';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { AliasedFileModel } from './aliased-file-type';
import { FilePageChunkModel } from './file-page-chunk-type';
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
import { Context } from '../../../test-resources/context';

/** generated */
import {
  FilePageFieldRequest,
  FilePageResponse,
  SelectedFilePageResponse,
  FilePageModel,
} from './file-page-type';

/** associations */
import { AliasedFileEntity } from '../aliased-file';
import { FilePageChunkEntity } from '../file-page-chunk';

/** external types */
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';

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
    return (this as any).fromArray(models, context);
  }

  public static async findUnique<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindUniqueArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindUniqueArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePage.findUnique(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindUniqueArgs>);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model, context);
  }

  public static async findFirst<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindFirstArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindFirstArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePage.findFirst(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindFirstArgs>);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model, context);
  }

  public static async findUniqueOrThrow<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindUniqueOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.findUniqueOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindUniqueOrThrowArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async findFirstOrThrow<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageFindFirstOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.findFirstOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageFindFirstOrThrowArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async upsert<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageUpsertArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageUpsertArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.upsert(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageUpsertArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async create<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageCreateArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageCreateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.create(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageCreateArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async update<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageUpdateArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageUpdateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.update(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageUpdateArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async delete<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageDeleteArgs,
  >(
    this: EntityConstructor<FilePageModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageDeleteArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.delete(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageDeleteArgs>);
    return (this as any).fromOne(model, context);
  }

  public static createMany = prisma.filePage.createMany;

  public static updateMany = prisma.filePage.updateMany;

  public static deleteMany = prisma.filePage.deleteMany;

  public static count = prisma.filePage.count;

  public static aggregate = prisma.filePage.aggregate;

  public static groupBy = prisma.filePage.groupBy;
}
