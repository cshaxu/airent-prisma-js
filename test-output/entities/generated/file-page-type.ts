import { FileModel } from './file-type';
import { FilePageChunkModel } from './file-page-chunk-type';
import { Select } from 'airent';
import { FileFieldRequest, FileResponse } from './file-type';
import { FilePageChunkFieldRequest, FilePageChunkResponse } from './file-page-chunk-type';
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';

/** structs */

export type RequestContext = {};

export type FilePageModel = PrismaFilePage & { context: RequestContext } & { file?: FileModel; chunks?: FilePageChunkModel[] };

export type FilePageFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  fileId?: boolean;
  pageId?: boolean;
  lines?: boolean;
  file?: FileFieldRequest;
  chunks?: FilePageChunkFieldRequest;
  context?: boolean;
};

export type FilePageResponse = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  fileId?: string;
  pageId?: number;
  lines?: PrismaJsonValue;
  file?: FileResponse;
  chunks?: FilePageChunkResponse[];
  context?: RequestContext;
};

export type SelectedFilePageResponse<S extends FilePageFieldRequest> = Select<FilePageResponse, S>;
