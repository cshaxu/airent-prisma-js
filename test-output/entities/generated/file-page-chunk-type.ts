import { AliasedFileModel } from './aliased-file-type';
import { FilePageModel } from './file-page-type';
// airent imports
import { Select } from 'airent';

// entity imports
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';
import { AliasedFileFieldRequest, AliasedFileResponse } from './aliased-file-type';
import { FilePageFieldRequest, FilePageResponse } from './file-page-type';

/** structs */

export type FilePageChunkModel = PrismaFilePageChunk & { file?: AliasedFileModel; page?: FilePageModel };

export type FilePageChunkFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  fileId?: boolean;
  pageId?: boolean;
  chunkId?: boolean;
  startLineId?: boolean;
  endLineId?: boolean;
  file?: AliasedFileFieldRequest;
  page?: FilePageFieldRequest;
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
  file?: AliasedFileResponse;
  page?: FilePageResponse;
};

export type SelectedFilePageChunkResponse<S extends FilePageChunkFieldRequest> = Select<FilePageChunkResponse, S>;

export type FilePageChunkPrimitiveField = 'id' | 'createdAt' | 'updatedAt' | 'fileId' | 'pageId' | 'chunkId' | 'startLineId' | 'endLineId';
