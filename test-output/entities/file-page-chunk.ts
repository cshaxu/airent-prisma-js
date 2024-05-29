// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-resources/context';

// entity imports
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';
import { AliasedFileEntity } from './aliased-file';
import { FilePageEntity } from './file-page';
import {
  FilePageChunkFieldRequest,
  FilePageChunkResponse,
  SelectedFilePageChunkResponse,
  FilePageChunkModel,
} from './generated/file-page-chunk-type';
import { FilePageChunkEntityBase } from './generated/file-page-chunk-base';

export class FilePageChunkEntity extends FilePageChunkEntityBase {
}
