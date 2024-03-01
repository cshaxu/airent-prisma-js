import { FilePageModel } from './file-page-type';
import { FilePageChunkModel } from './file-page-chunk-type';
import { FilePageFieldRequest, FilePageResponse } from './file-page-type';
import { FilePageChunkFieldRequest, FilePageChunkResponse } from './file-page-chunk-type';
import { File as PrismaFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

/** structs */

export type RequestContext = {};

export type FileModel = PrismaFile & { context: RequestContext } & { pages?: FilePageModel[]; chunks?: FilePageChunkModel[] };

export type FileFieldRequest = {
  size?: boolean;
  type?: boolean;
  chunks?: FilePageChunkFieldRequest;
  context?: boolean;
};

export type FileResponse = {
  size?: number;
  type?: PrismaFileType;
  chunks?: FilePageChunkResponse[];
  context?: RequestContext;
};
