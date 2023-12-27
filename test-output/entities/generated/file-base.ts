import { batchLoad } from '../../../src';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
  toArrayMap,
  toObjectMap,
} from 'airent';

/** generated */
import {
  FileFieldRequest,
  FileResponse,
} from './file-type';

/** associations */
import { FilePageEntity } from '../file-page';
import { FilePageChunkEntity } from '../file-page-chunk';

/** external types */
import { File as PrismaFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

export class FileEntityBase extends BaseEntity<
  PrismaFile, FileFieldRequest, FileResponse
> {
  public createdAt: Date;
  public size: number;
  public type: PrismaFileType;
  public id: string;

  protected pages?: FilePageEntity[];

  protected chunks?: FilePageChunkEntity[];

  public constructor(
    model: PrismaFile,
    group: FileEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.createdAt = model.createdAt;
    this.size = model.size;
    this.type = model.type;
    this.id = model.id;

    this.initialize();
  }

  public async present<S extends FileFieldRequest>(fieldRequest: S): Promise<Select<FileResponse, S>> {
    return {
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.size !== undefined && { size: this.size }),
      ...(fieldRequest.type !== undefined && { type: this.type }),
    } as Select<FileResponse, S>;
  }

  public static async presentMany<
    ENTITY extends FileEntityBase,
    S extends FileFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<Select<FileResponse, S>[]> {
    return await Promise.all(entities.map((one) => one.present(fieldRequest)));
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
      const models = await batchLoad(prisma.filePage.findMany, keys);
      return FilePageEntity.fromArray(models);
    },
    setter: (sources: FileEntityBase[], targets: FilePageEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.fileId}`, (one) => one);
      sources.forEach((one) => {
        one.pages = map.get(`${one.id}`) ?? [];
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
      const models = await batchLoad(prisma.filePageChunk.findMany, keys);
      return FilePageChunkEntity.fromArray(models);
    },
    setter: (sources: FileEntityBase[], targets: FilePageChunkEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.fileId}`, (one) => one);
      sources.forEach((one) => {
        one.chunks = map.get(`${one.id}`) ?? [];
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
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindManyArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindManyArgs>,
  ): Promise<ENTITY[]> {
    const models = await prisma.file.findMany(args)
    return (this as any).fromArray(models);
  }

  public static async findUnique<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindUniqueArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindUniqueArgs>,
  ): Promise<ENTITY | null> {
    const model = await prisma.file.findUnique(args);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model);
  }

  public static async findFirst<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindFirstArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindFirstArgs>,
  ): Promise<ENTITY | null> {
    const model = await prisma.file.findFirst(args);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model);
  }

  public static async findUniqueOrThrow<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindUniqueOrThrowArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.file.findUniqueOrThrow(args);
    return (this as any).fromOne(model);
  }

  public static async findFirstOrThrow<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileFindFirstOrThrowArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.file.findFirstOrThrow(args);
    return (this as any).fromOne(model);
  }

  public static async upsert<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileUpsertArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileUpsertArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.file.upsert(args);
    return (this as any).fromOne(model);
  }

  public static async create<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileCreateArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileCreateArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.file.create(args);
    return (this as any).fromOne(model);
  }

  public static async update<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileUpdateArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileUpdateArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.file.update(args);
    return (this as any).fromOne(model);
  }

  public static async delete<
    ENTITY extends FileEntityBase,
    T extends Prisma.FileDeleteArgs,
  >(
    this: EntityConstructor<PrismaFile, ENTITY>,
    args: Prisma.SelectSubset<T, Prisma.FileDeleteArgs>,
  ): Promise<ENTITY> {
    const model = await prisma.file.delete(args);
    return (this as any).fromOne(model);
  }

  public static createMany = prisma.file.createMany;

  public static updateMany = prisma.file.updateMany;

  public static deleteMany = prisma.file.deleteMany;

  public static count = prisma.file.count;

  public static aggregate = prisma.file.aggregate;

  public static groupBy = prisma.file.groupBy;
}
