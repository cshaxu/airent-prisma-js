import { FilePageModel } from './file-page-type';
import { FilePageChunkModel } from './file-page-chunk-type';
import { Select } from 'airent';
import { FilePageFieldRequest, FilePageResponse } from './file-page-type';
import { FilePageChunkFieldRequest, FilePageChunkResponse } from './file-page-chunk-type';
import { AliasedFile as PrismaAliasedFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

/** structs */

export type AliasedFileModel = PrismaAliasedFile & { pages?: FilePageModel[]; chunks?: FilePageChunkModel[] };

export type AliasedFileFieldRequest = {
  size?: boolean;
  type?: boolean;
  chunks?: FilePageChunkFieldRequest;
};

export type AliasedFileResponse = {
  size?: number;
  type?: PrismaFileType;
  chunks?: FilePageChunkResponse[];
};

export type SelectedAliasedFileResponse<S extends AliasedFileFieldRequest> = Select<AliasedFileResponse, S>;
