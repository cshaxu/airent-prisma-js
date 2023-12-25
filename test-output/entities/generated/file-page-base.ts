import { batchLoad } from '../../../src';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  toArrayMap,
  toObjectMap,
} from 'airent';

/** generated */
import {
  FilePageFieldRequest,
  FilePageResponse,
} from './file-page-type';

/** associations */
import { FileEntity } from '../file';
import { FilePageChunkEntity } from '../file-page-chunk';

/** external types */
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';

export class FilePageEntityBase extends BaseEntity<
  PrismaFilePage, FilePageFieldRequest, FilePageResponse
> {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public fileId: string;
  public pageId: number;
  public lines: PrismaJsonValue;

  protected file?: FileEntity;

  protected chunks?: FilePageChunkEntity[];

  public constructor(
    model: PrismaFilePage,
    group: FilePageEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.fileId = model.fileId;
    this.pageId = model.pageId;
    this.lines = model.lines;

    this.initialize();
  }

  public async present(fieldRequest: FilePageFieldRequest): Promise<FilePageResponse> {
    return {
      id: fieldRequest.id === undefined ? undefined : this.id,
      createdAt: fieldRequest.createdAt === undefined ? undefined : this.createdAt,
      updatedAt: fieldRequest.updatedAt === undefined ? undefined : this.updatedAt,
      fileId: fieldRequest.fileId === undefined ? undefined : this.fileId,
      pageId: fieldRequest.pageId === undefined ? undefined : this.pageId,
      lines: fieldRequest.lines === undefined ? undefined : this.lines,
      file: fieldRequest.file === undefined ? undefined : await this.getFile().then((one) => one.present(fieldRequest.file!)),
      chunks: fieldRequest.chunks === undefined ? undefined : await this.getChunks().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chunks!)))),
    };
  }

  /** associations */

  protected fileLoadConfig: LoadConfig<FilePageEntityBase, FileEntity> = {
    name: 'FilePageEntity.file',
    filter: (one: FilePageEntityBase) => one.file === undefined,
    getter: (sources: FilePageEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.fileId,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.file.findMany, keys);
      return FileEntity.fromArray(models);
    },
    setter: (sources: FilePageEntityBase[], targets: FileEntity[]) => {
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
      const models = await batchLoad(prisma.filePageChunk.findMany, keys);
      return FilePageChunkEntity.fromArray(models);
    },
    setter: (sources: FilePageEntityBase[], targets: FilePageChunkEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.fileId}*${one.pageId}`, (one) => one);
      sources.forEach((one) => {
        one.chunks = map.get(`${one.fileId}*${one.pageId}`) ?? [];
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

  /** prisma wrappers */

  public static async findMany<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindManyArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageFindManyArgs>,
  ): Promise<ENTITY[]> {
    const models = await prisma.filePage.findMany(args)
    return (this as any).fromArray(models);
  }

  public static async findUnique<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindUniqueArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageFindUniqueArgs>,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePage.findUnique(args);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model);
  }

  public static async findFirst<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindFirstArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageFindFirstArgs>,
  ): Promise<ENTITY | null> {
    const model = await prisma.filePage.findFirst(args);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model);
  }

  public static async findUniqueOrThrow<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageFindUniqueOrThrowArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.findUniqueOrThrow(args);
    return (this as any).fromOne(model);
  }

  public static async findFirstOrThrow<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageFindFirstOrThrowArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.findFirstOrThrow(args);
    return (this as any).fromOne(model);
  }

  public static async upsert<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageUpsertArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageUpsertArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.upsert(args);
    return (this as any).fromOne(model);
  }

  public static async create<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageCreateArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageCreateArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.create(args);
    return (this as any).fromOne(model);
  }

  public static async update<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageUpdateArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageUpdateArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.update(args);
    return (this as any).fromOne(model);
  }

  public static async delete<
    ENTITY extends FilePageEntityBase,
    T extends Prisma.FilePageDeleteArgs,
  >(
    this: EntityConstructor<PrismaFilePage, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FilePageDeleteArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.filePage.delete(args);
    return (this as any).fromOne(model);
  }

  public static createMany = prisma.filePage.createMany;

  public static updateMany = prisma.filePage.updateMany;

  public static deleteMany = prisma.filePage.deleteMany;

  public static count = prisma.filePage.count;

  public static aggregate = prisma.filePage.aggregate;

  public static groupBy = prisma.filePage.groupBy;
}
