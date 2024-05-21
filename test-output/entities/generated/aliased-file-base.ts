import { ValidatePrismaArgs, batchLoad, batchLoadTopMany } from '../../../src/index';
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
import { Context } from '../../../test-resources/context';

/** generated */
import {
  AliasedFileFieldRequest,
  AliasedFileResponse,
  SelectedAliasedFileResponse,
  AliasedFileModel,
} from './aliased-file-type';

/** associations */
import { FilePageEntity } from '../file-page';
import { FilePageChunkEntity } from '../file-page-chunk';

/** external types */
import { AliasedFile as PrismaAliasedFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

export class AliasedFileEntityBase extends BaseEntity<
  AliasedFileModel, Context, AliasedFileFieldRequest, AliasedFileResponse
> {
  public size: number;
  public type: PrismaFileType;
  public id: string;

  protected pages?: FilePageEntity[];

  protected chunks?: FilePageChunkEntity[];

  public constructor(
    model: AliasedFileModel,
    context: Context,
    group: AliasedFileEntityBase[],
    lock: AsyncLock,
  ) {
    super(context, group, lock);

    this.size = model.size;
    this.type = model.type;
    this.id = model.id;

    this.initialize(model, context);
  }

  public async present<S extends AliasedFileFieldRequest>(fieldRequest: S): Promise<SelectedAliasedFileResponse<S>> {
    await this.beforePresent(fieldRequest);
    const response = {
      ...(fieldRequest.size !== undefined && { size: this.size }),
      ...(fieldRequest.type !== undefined && { type: this.type }),
      ...(fieldRequest.chunks !== undefined && { chunks: await this.getChunks().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chunks!)))) }),
    };
    await this.afterPresent(fieldRequest, response as Select<AliasedFileResponse, S>);
    return response as SelectedAliasedFileResponse<S>;
  }

  public static async presentMany<
    ENTITY extends AliasedFileEntityBase,
    S extends AliasedFileFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedAliasedFileResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** associations */

  protected pagesLoadConfig: LoadConfig<AliasedFileEntityBase, FilePageEntity> = {
    name: 'AliasedFileEntity.pages',
    filter: (one: AliasedFileEntityBase) => one.pages === undefined,
    getter: (sources: AliasedFileEntityBase[]) => {
      return sources
        .map((one) => ({
          fileId: one.id,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoad(prisma.filePage.findMany, keys, 1234);
      return FilePageEntity.fromArray(models, this.context);
    },
    setter: (sources: AliasedFileEntityBase[], targets: FilePageEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ fileId: one.fileId }), (one) => one);
      sources.forEach((one) => {
        one.pages = map.get(JSON.stringify({ fileId: one.id })) ?? [];
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

  protected chunksLoadConfig: LoadConfig<AliasedFileEntityBase, FilePageChunkEntity> = {
    name: 'AliasedFileEntity.chunks',
    filter: (one: AliasedFileEntityBase) => one.chunks === undefined,
    getter: (sources: AliasedFileEntityBase[]) => {
      return sources
        .map((one) => ({
          fileId: one.id,
        }));
    },
    loader: async (keys: LoadKey[]) => {
      const models = await batchLoadTopMany((query) => prisma.filePageChunk.findMany({ ...query, orderBy: { pageId: 'asc', chunkId: 'desc' } }), (key, entity) => key.fileId === entity.fileId, keys, 10, 1234);
      return FilePageChunkEntity.fromArray(models, this.context);
    },
    setter: (sources: AliasedFileEntityBase[], targets: FilePageChunkEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ fileId: one.fileId }), (one) => one);
      sources.forEach((one) => {
        one.chunks = map.get(JSON.stringify({ fileId: one.id })) ?? [];
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

  protected initialize(model: AliasedFileModel, context: Context): void {
    if (model.pages !== undefined) {
      this.pages = FilePageEntity.fromArray(model.pages, context);
    }
    if (model.chunks !== undefined) {
      this.chunks = FilePageChunkEntity.fromArray(model.chunks, context);
    }
  }

  /** prisma wrappers */

  public static async findMany<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileFindManyArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileFindManyArgs>,
    context: Context,
  ): Promise<ENTITY[]> {
    const models = await prisma.aliasedFile.findMany(
      args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileFindManyArgs>
    );
    return (this as any).fromArray(models, context);
  }

  public static async findUnique<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileFindUniqueArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileFindUniqueArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.aliasedFile.findUnique(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileFindUniqueArgs>);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model, context);
  }

  public static async findFirst<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileFindFirstArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileFindFirstArgs>,
    context: Context,
  ): Promise<ENTITY | null> {
    const model = await prisma.aliasedFile.findFirst(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileFindFirstArgs>);
    if (model === null) {
      return null;
    }
    return (this as any).fromOne(model, context);
  }

  public static async findUniqueOrThrow<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileFindUniqueOrThrowArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileFindUniqueOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.aliasedFile.findUniqueOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileFindUniqueOrThrowArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async findFirstOrThrow<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileFindFirstOrThrowArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileFindFirstOrThrowArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.aliasedFile.findFirstOrThrow(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileFindFirstOrThrowArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async upsert<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileUpsertArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileUpsertArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.aliasedFile.upsert(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileUpsertArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async create<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileCreateArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileCreateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.aliasedFile.create(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileCreateArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async update<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileUpdateArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileUpdateArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.aliasedFile.update(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileUpdateArgs>);
    return (this as any).fromOne(model, context);
  }

  public static async delete<
    ENTITY extends AliasedFileEntityBase,
    T extends Prisma.AliasedFileDeleteArgs,
  >(
    this: EntityConstructor<AliasedFileModel, Context, ENTITY>,
    args: ValidatePrismaArgs<T, Prisma.AliasedFileDeleteArgs>,
    context: Context,
  ): Promise<ENTITY> {
    const model = await prisma.aliasedFile.delete(args as unknown as Prisma.SelectSubset<T, Prisma.AliasedFileDeleteArgs>);
    return (this as any).fromOne(model, context);
  }

  public static createMany = prisma.aliasedFile.createMany;

  public static updateMany = prisma.aliasedFile.updateMany;

  public static deleteMany = prisma.aliasedFile.deleteMany;

  public static count = prisma.aliasedFile.count;

  public static aggregate = prisma.aliasedFile.aggregate;

  public static groupBy = prisma.aliasedFile.groupBy;
}
