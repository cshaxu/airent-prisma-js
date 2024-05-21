import { AliasedFileModel } from './aliased-file-type';
import { FilePageChunkModel } from './file-page-chunk-type';
import { Select } from 'airent';
import { AliasedFileFieldRequest, AliasedFileResponse } from './aliased-file-type';
import { FilePageChunkFieldRequest, FilePageChunkResponse } from './file-page-chunk-type';
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';

/** structs */

export type FilePageModel = PrismaFilePage & { file?: AliasedFileModel; chunks?: FilePageChunkModel[] };

export type FilePageFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  fileId?: boolean;
  pageId?: boolean;
  lines?: boolean;
  file?: AliasedFileFieldRequest;
  chunks?: FilePageChunkFieldRequest;
};

export type FilePageResponse = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  fileId?: string;
  pageId?: number;
  lines?: PrismaJsonValue;
  file?: AliasedFileResponse;
  chunks?: FilePageChunkResponse[];
};

export type SelectedFilePageResponse<S extends FilePageFieldRequest> = Select<FilePageResponse, S>;
