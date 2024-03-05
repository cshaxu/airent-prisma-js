import { ValidatePrismaArgs, batchLoad, batchLoadTopMany } from '../../../src';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { FilePageModel } from './file-page-type';
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

/** generated */
import {
  FileFieldRequest,
  FileResponse,
  RequestContext,
  FileModel,
} from './file-type';

/** associations */
import { FilePageEntity } from '../file-page';
import { FilePageChunkEntity } from '../file-page-chunk';

/** external types */
import { File as PrismaFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

export class FileEntityBase extends BaseEntity<
  FileModel, FileFieldRequest, FileResponse
> {
  public size: number;
  public type: PrismaFileType;
  public id: string;
  public context: RequestContext;

  protected pages?: FilePageEntity[];

  protected chunks?: FilePageChunkEntity[];

  public constructor(
    model: FileModel,
    group: FileEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.size = model.size;
    this.type = model.type;
    this.id = model.id;
    this.context = model.context;

    this.initialize(model);
  }

  public async present<S extends FileFieldRequest>(fieldRequest: S): Promise<Select<FileResponse, S>> {
    return {
      ...(fieldRequest.size !== undefined && { size: this.size }),
      ...(fieldRequest.type !== undefined && { type: this.type }),
      ...(fieldRequest.chunks !== undefined && { chunks: await this.getChunks().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chunks!)))) }),
      ...(fieldRequest.context !== undefined && { context: this.context }),
    } as Select<FileResponse, S>;
  }

  public static async presentMany<
    ENTITY extends FileEntityBase,
    S extends FileFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<Select<FileResponse, S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** associations */

  protected pagesLoadConfig: LoadConfig<FileEntityBase, FilePageEntity> = {
    name: 'FileEntity.pages',
    filter: (one: FileEntityBase) => one.pages === undefined,
    getter: (sources: FileEntityBase[]) => {
      return sources
        .map((one) => ({
          fileId: one.id,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.filePage.findMany, keys, 1234).then((models) => models.map((m) => ({ ...m, context: this.context })));
      return FilePageEntity.fromArray(models);
    },
    setter: (sources: FileEntityBase[], targets: FilePageEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ fileId: one.fileId }), (one) => one);
      sources.forEach((one) => {
        one.pages = map.get(JSON.stringify({ fileId: one.id })) ?? [];
        one.pages.forEach((e) => (e.context = one.context));
      });
    },
  };

  public async getPages(): Promise<FilePageEntity[]> {
    if (this.pages !== undefined) {
      return this.pages;
    }
    await this.load(this.pagesLoadConfig);
    return this.pages!;
  }

  public setPages(pages?: FilePageEntity[]): void {
    this.pages = pages;
  }

  protected chunksLoadConfig: LoadConfig<FileEntityBase, FilePageChunkEntity> = {
    name: 'FileEntity.chunks',
    filter: (one: FileEntityBase) => one.chunks === undefined,
    getter: (sources: FileEntityBase[]) => {
      return sources
        .map((one) => ({
          fileId: one.id,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoadTopMany((query) => prisma.filePageChunk.findMany({ ...query, orderBy: { pageId: 'asc', chunkId: 'desc' } }), (key, entity) => key.fileId === entity.fileId, keys, 10, 1234).then((models) => models.map((m) => ({ ...m, context: this.context })));
      return FilePageChunkEntity.fromArray(models);
    },
    setter: (sources: FileEntityBase[], targets: FilePageChunkEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ fileId: one.fileId }), (one) => one);
      sources.forEach((one) => {
        one.chunks = map.get(JSON.stringify({ fileId: one.id })) ?? [];
        one.chunks.forEach((e) => (e.context = one.context));
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

  protected initialize(model: FileModel): void {
    if (model.pages !== undefined) {
      this.pages = FilePageEntity.fromArray(model.pages.map((m) => ({ ...m, context: this.context })));
    }
    if (model.chunks !== undefined) {
      this.chunks = FilePageChunkEntity.fromArray(model.chunks.map((m) => ({ ...m, context: this.context })));
    }
  }

  /** prisma wrappers */

  public static async findMany<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindManyArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileFindManyArgs>,
    context: RequestContext,
  ): Promise<ENTITY[]> {
    const prismaModels = await prisma.file.findMany(args as unknown as Prisma.SelectSubset<T, Prisma.FileFindManyArgs>);
    const models = prismaModels.map((pm) => ({ ...pm, context }));
    return (this as any).fromArray(models);
  }

  public static async findUnique<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindUniqueArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileFindUniqueArgs>,
    context: RequestContext,
  ): Promise<ENTITY | null> {
    const prismaModel = await prisma.file.findUnique(args as unknown as Prisma.SelectSubset<T, Prisma.FileFindUniqueArgs>);
    if (prismaModel === null) {
      return null;
    }
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async findFirst<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindFirstArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileFindFirstArgs>,
    context: RequestContext,
  ): Promise<ENTITY | null> {
    const prismaModel = await prisma.file.findFirst(args as unknown as Prisma.SelectSubset<T, Prisma.FileFindFirstArgs>);
    if (prismaModel === null) {
      return null;
    }
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async findUniqueOrThrow<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileFindUniqueOrThrowArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.findUniqueOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.FileFindUniqueOrThrowArgs>);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async findFirstOrThrow<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileFindFirstOrThrowArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.findFirstOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.FileFindFirstOrThrowArgs>);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async upsert<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileUpsertArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileUpsertArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.upsert(args as unknown as Prisma.SelectSubset<T, Prisma.FileUpsertArgs>);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async create<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileCreateArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileCreateArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.create(args as unknown as Prisma.SelectSubset<T, Prisma.FileCreateArgs>);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async update<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileUpdateArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileUpdateArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.update(args as unknown as Prisma.SelectSubset<T, Prisma.FileUpdateArgs>);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async delete<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileDeleteArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.FileDeleteArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.delete(args as unknown as Prisma.SelectSubset<T, Prisma.FileDeleteArgs>);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static createMany = prisma.file.createMany;

  public static updateMany = prisma.file.updateMany;

  public static deleteMany = prisma.file.deleteMany;

  public static count = prisma.file.count;

  public static aggregate = prisma.file.aggregate;

  public static groupBy = prisma.file.groupBy;
}
