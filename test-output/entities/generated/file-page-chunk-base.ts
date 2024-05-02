import { ValidatePrismaArgs, batchLoad, batchLoadTopMany } from '../../../src';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { FileModel } from './file-type';
import { FilePageModel } from './file-page-type';
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
  FilePageChunkFieldRequest,
  FilePageChunkResponse,
  SelectedFilePageChunkResponse,
  FilePageChunkModel,
} from './file-page-chunk-type';

/** associations */
import { FileEntity } from '../file';
import { FilePageEntity } from '../file-page';

/** external types */
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';

export class FilePageChunkEntityBase extends BaseEntity<
  FilePageChunkModel, Context, FilePageChunkFieldRequest, FilePageChunkResponse
> {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public fileId: string;
  public pageId: number;
  public chunkId: number;
  public startLineId: number;
  public endLineId: number;

  protected file?: FileEntity;

  protected page?: FilePageEntity;

  public constructor(
    model: FilePageChunkModel,
    context: Context,
    group: FilePageChunkEntityBase[],
    lock: AsyncLock,
  ) {
    super(context, group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.fileId = model.fileId;
    this.pageId = model.pageId;
    this.chunkId = model.chunkId;
    this.startLineId = model.startLineId;
    this.endLineId = model.endLineId;

    this.initialize(model, context);
  }

  public async present<S extends FilePageChunkFieldRequest>(fieldRequest: S): Promise<SelectedFilePageChunkResponse<S>> {
    await this.beforePresent(fieldRequest);
    const response = {
      ...(fieldRequest.id !== undefined && { id: this.id }),
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.updatedAt !== undefined && { updatedAt: this.updatedAt }),
      ...(fieldRequest.fileId !== undefined && { fileId: this.fileId }),
      ...(fieldRequest.pageId !== undefined && { pageId: this.pageId }),
      ...(fieldRequest.chunkId !== undefined && { chunkId: this.chunkId }),
      ...(fieldRequest.startLineId !== undefined && { startLineId: this.startLineId }),
      ...(fieldRequest.endLineId !== undefined && { endLineId: this.endLineId }),
      ...(fieldRequest.file !== undefined && { file: await this.getFile().then((one) => one.present(fieldRequest.file!)) }),
      ...(fieldRequest.page !== undefined && { page: await this.getPage().then((one) => one.present(fieldRequest.page!)) }),
    };
    await this.afterPresent(fieldRequest, response as Select<FilePageChunkResponse, S>);
    return response as SelectedFilePageChunkResponse<S>;
  }

  public static async presentMany<
    ENTITY extends FilePageChunkEntityBase,
    S extends FilePageChunkFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedFilePageChunkResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** associations */

  protected fileLoadConfig: LoadConfig<FilePageChunkEntityBase, FileEntity> = {
    name: 'FilePageChunkEntity.file',
    filter: (one: FilePageChunkEntityBase) => one.file === undefined,
    getter: (sources: FilePageChunkEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.fileId,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.file.findMany, keys, 1234).then((models) => models.map((m) => ({ ...m })));
      return FileEntity.fromArray(models, this.context);
    },
    setter: (sources: FilePageChunkEntityBase[], targets: FileEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }), (one) => one);
      sources.forEach((one) => {
        one.file = map.get(JSON.stringify({ id: one.fileId }))!;
      });
    },
  };

  public async getFile(): Promise<FileEntity> {
    if (this.file !== undefined) {
      return this.file;
    }
    await this.load(this.fileLoadConfig);
    return this.file!;
  }

  public setFile(file?: FileEntity): void {
    this.file = file;
  }

  protected pageLoadConfig: LoadConfig<FilePageChunkEntityBase, FilePageEntity> = {
    name: 'FilePageChunkEntity.page',
    filter: (one: FilePageChunkEntityBase) => one.page === undefined,
    getter: (sources: FilePageChunkEntityBase[]) => {
      return sources
        .map((one) => ({
          fileId: one.fileId,
          pageId: one.pageId,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.filePage.findMany, keys, 1234).then((models) => models.map((m) => ({ ...m })));
      return FilePageEntity.fromArray(models, this.context);
    },
    setter: (sources: FilePageChunkEntityBase[], targets: FilePageEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ fileId: one.fileId, pageId: one.pageId }), (one) => one);
      sources.forEach((one) => {
        one.page = map.get(JSON.stringify({ fileId: one.fileId, pageId: one.pageId }))!;
      });
    },
  };

  public async getPage(): Promise<FilePageEntity> {
    if (this.page !== undefined) {
      return this.page;
    }
    await this.load(this.pageLoadConfig);
    return this.page!;
  }

  public setPage(page?: FilePageEntity): void {
    this.page = page;
  }

  protected initialize(model: FilePageChunkModel, context: Context): void {
    if (model.file !== undefined) {
      this.file = FileEntity.fromOne({ ...model.file }, context);
    }
    if (model.page !== undefined) {
      this.page = FilePageEntity.fromOne({ ...model.page }, context);
    }
  }

  /** prisma wrappers */

  public static async findMany<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindManyArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkFindManyArgs>,
    context: Context,
  ): Promise<ENTITY[]> {
    const models = await prisma.filePageChunk.findMany(
      args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkFindManyArgs>
    );
    return (this as any).fromArray(models, context);
  }

  public static async findUnique<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindUniqueArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkFindUniqueArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePageChunk.findUnique(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkFindUniqueArgs>);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model, context);
  }

  public static async findFirst<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindFirstArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkFindFirstArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePageChunk.findFirst(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkFindFirstArgs>);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model, context);
  }

  public static async findUniqueOrThrow<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkFindUniqueOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.findUniqueOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkFindUniqueOrThrowArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async findFirstOrThrow<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkFindFirstOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.findFirstOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkFindFirstOrThrowArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async upsert<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkUpsertArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkUpsertArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.upsert(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkUpsertArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async create<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkCreateArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkCreateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.create(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkCreateArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async update<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkUpdateArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkUpdateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.update(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkUpdateArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async delete<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkDeleteArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FilePageChunkDeleteArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.delete(args as unknown as Prisma.SelectSubset<T, Prisma.FilePageChunkDeleteArgs>);
    return (this as any).fromOne(model, context);
  }

  public static createMany = prisma.filePageChunk.createMany;

  public static updateMany = prisma.filePageChunk.updateMany;

  public static deleteMany = prisma.filePageChunk.deleteMany;

  public static count = prisma.filePageChunk.count;

  public static aggregate = prisma.filePageChunk.aggregate;

  public static groupBy = prisma.filePageChunk.groupBy;
}
