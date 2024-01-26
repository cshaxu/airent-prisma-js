import { batchLoad } from '../../../src';
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
  public createdAt: Date;
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

    this.createdAt = model.createdAt;
    this.size = model.size;
    this.type = model.type;
    this.id = model.id;
    this.context = model.context;

    this.initialize(model);
  }

  public async present<S extends FileFieldRequest>(fieldRequest: S): Promise<Select<FileResponse, S>> {
    return {
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.size !== undefined && { size: this.size }),
      ...(fieldRequest.type !== undefined && { type: this.type }),
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
      const models = await batchLoad(prisma.filePage.findMany, keys).then((models) => models.map((m) => ({ ...m, context: this.context })));
      return FilePageEntity.fromArray(models);
    },
    setter: (sources: FileEntityBase[], targets: FilePageEntity[]) => {
      targets.forEach((one) => {
        one.context = this.context;
      });
      const map = toArrayMap(targets, (one) => `${one.fileId}`, (one) => one);
      sources.forEach((one) => {
        one.pages = map.get(`${one.id}`) ?? [];
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
      const models = await batchLoad(prisma.filePageChunk.findMany, keys).then((models) => models.map((m) => ({ ...m, context: this.context })));
      return FilePageChunkEntity.fromArray(models);
    },
    setter: (sources: FileEntityBase[], targets: FilePageChunkEntity[]) => {
      targets.forEach((one) => {
        one.context = this.context;
      });
      const map = toArrayMap(targets, (one) => `${one.fileId}`, (one) => one);
      sources.forEach((one) => {
        one.chunks = map.get(`${one.id}`) ?? [];
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
    args: Prisma.SelectSubset<T, Prisma.FileFindManyArgs>,
    context: RequestContext,
  ): Promise<ENTITY[]> {
    const prismaModels = await prisma.file.findMany(args);
    const models = prismaModels.map((pm) => ({ ...pm, context }));
    return (this as any).fromArray(models);
  }

  public static async findUnique<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindUniqueArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindUniqueArgs>,
    context: RequestContext,
  ): Promise<ENTITY | null> {
    const prismaModel = await prisma.file.findUnique(args);
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
    args: Prisma.SelectSubset<T, Prisma.FileFindFirstArgs>,
    context: RequestContext,
  ): Promise<ENTITY | null> {
    const prismaModel = await prisma.file.findFirst(args);
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
    args: Prisma.SelectSubset<T, Prisma.FileFindUniqueOrThrowArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.findUniqueOrThrow(args);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async findFirstOrThrow<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindFirstOrThrowArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.findFirstOrThrow(args);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async upsert<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileUpsertArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileUpsertArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.upsert(args);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async create<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileCreateArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileCreateArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.create(args);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async update<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileUpdateArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileUpdateArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.update(args);
    const model = { ...prismaModel, context };
    return (this as any).fromOne(model);
  }

  public static async delete<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileDeleteArgs,
  >(
    this: EntityConstructor<FileModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileDeleteArgs>,
    context: RequestContext,
  ): Promise<ENTITY> {
    const prismaModel = await prisma.file.delete(args);
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
