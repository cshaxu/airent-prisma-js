import { batchLoad } from '../../../src';
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

/** generated */
import {
  FilePageChunkFieldRequest,
  FilePageChunkResponse,
  FilePageChunkModel,
} from './file-page-chunk-type';

/** associations */
import { FileEntity } from '../file';
import { FilePageEntity } from '../file-page';

/** external types */
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';

export class FilePageChunkEntityBase extends BaseEntity<
  FilePageChunkModel, FilePageChunkFieldRequest, FilePageChunkResponse
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
    group: FilePageChunkEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.fileId = model.fileId;
    this.pageId = model.pageId;
    this.chunkId = model.chunkId;
    this.startLineId = model.startLineId;
    this.endLineId = model.endLineId;

    this.initialize(model);
  }

  public async present<S extends FilePageChunkFieldRequest>(fieldRequest: S): Promise<Select<FilePageChunkResponse, S>> {
    return {
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
    } as Select<FilePageChunkResponse, S>;
  }

  public static async presentMany<
    ENTITY extends FilePageChunkEntityBase,
    S extends FilePageChunkFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<Select<FilePageChunkResponse, S>[]> {
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
      const models = await batchLoad(prisma.file.findMany, keys);
      return FileEntity.fromArray(models);
    },
    setter: (sources: FilePageChunkEntityBase[], targets: FileEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => {
        one.file = map.get(`${one.fileId}`)!;
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
      const models = await batchLoad(prisma.filePage.findMany, keys);
      return FilePageEntity.fromArray(models);
    },
    setter: (sources: FilePageChunkEntityBase[], targets: FilePageEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.fileId}*${one.pageId}`, (one) => one);
      sources.forEach((one) => {
        one.page = map.get(`${one.fileId}*${one.pageId}`)!;
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

  protected initialize(model: FilePageChunkModel): void {
    if (model.file !== undefined) {
      this.file = FileEntity.fromOne({ ...model.file });
    }
    if (model.page !== undefined) {
      this.page = FilePageEntity.fromOne({ ...model.page });
    }
  }

  /** prisma wrappers */

  public static async findMany<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindManyArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkFindManyArgs>,
  ): Promise<ENTITY[]> {
    const models = await prisma.filePageChunk.findMany(args);
    return (this as any).fromArray(models);
  }

  public static async findUnique<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindUniqueArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkFindUniqueArgs>,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePageChunk.findUnique(args);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model);
  }

  public static async findFirst<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindFirstArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkFindFirstArgs>,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePageChunk.findFirst(args);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model);
  }

  public static async findUniqueOrThrow<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkFindUniqueOrThrowArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.findUniqueOrThrow(args);
    return (this as any).fromOne(model);
  }

  public static async findFirstOrThrow<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkFindFirstOrThrowArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.findFirstOrThrow(args);
    return (this as any).fromOne(model);
  }

  public static async upsert<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkUpsertArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkUpsertArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.upsert(args);
    return (this as any).fromOne(model);
  }

  public static async create<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkCreateArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkCreateArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.create(args);
    return (this as any).fromOne(model);
  }

  public static async update<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkUpdateArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkUpdateArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.update(args);
    return (this as any).fromOne(model);
  }

  public static async delete<
    ENTITY extends FilePageChunkEntityBase,
    T extends Prisma.FilePageChunkDeleteArgs,
  >(
    this: EntityConstructor<FilePageChunkModel, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageChunkDeleteArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePageChunk.delete(args);
    return (this as any).fromOne(model);
  }

  public static createMany = prisma.filePageChunk.createMany;

  public static updateMany = prisma.filePageChunk.updateMany;

  public static deleteMany = prisma.filePageChunk.deleteMany;

  public static count = prisma.filePageChunk.count;

  public static aggregate = prisma.filePageChunk.aggregate;

  public static groupBy = prisma.filePageChunk.groupBy;
}
