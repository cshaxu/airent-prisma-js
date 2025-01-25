// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-sources/context';

// entity imports
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';
import { AliasedFileEntity } from './aliased-file';
import { FilePageEntity } from './file-page';
import {
  FilePageChunkFieldRequest,
  FilePageChunkResponse,
  SelectedFilePageChunkResponse,
  FilePageChunkModel,
} from '../generated/types/file-page-chunk';
import { FilePageChunkEntityBase } from '../generated/entities/file-page-chunk';

export class FilePageChunkEntity extends FilePageChunkEntityBase {
}
