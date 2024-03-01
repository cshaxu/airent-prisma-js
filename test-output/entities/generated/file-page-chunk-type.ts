import { FileModel } from './file-type';
import { FilePageModel } from './file-page-type';
import { FileFieldRequest, FileResponse } from './file-type';
import { FilePageFieldRequest, FilePageResponse } from './file-page-type';
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';

/** structs */

export type RequestContext = {};

export type FilePageChunkModel = PrismaFilePageChunk & { context: RequestContext } & { file?: FileModel; page?: FilePageModel };

export type FilePageChunkFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  fileId?: boolean;
  pageId?: boolean;
  chunkId?: boolean;
  startLineId?: boolean;
  endLineId?: boolean;
  file?: FileFieldRequest;
  page?: FilePageFieldRequest;
  context?: boolean;
};

export type FilePageChunkResponse = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  fileId?: string;
  pageId?: number;
  chunkId?: number;
  startLineId?: number;
  endLineId?: number;
  file?: FileResponse;
  page?: FilePageResponse;
  context?: RequestContext;
};
