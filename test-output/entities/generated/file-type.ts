import { FilePageModel } from './file-page-type';
import { FilePageChunkModel } from './file-page-chunk-type';
import { FilePageFieldRequest, FilePageResponse } from './file-page-type';
import { FilePageChunkFieldRequest, FilePageChunkResponse } from './file-page-chunk-type';
import { File as PrismaFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

/** structs */

export type FileModel = PrismaFile & { pages?: FilePageModel[]; chunks?: FilePageChunkModel[] };

export type FileFieldRequest = {
  createdAt?: boolean;
  size?: boolean;
  type?: boolean;
};

export type FileResponse = {
  createdAt?: Date;
  size?: number;
  type?: PrismaFileType;
};
