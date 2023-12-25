import { LoadKey, toArrayMap, toObjectMap } from 'airent';
import { FilePageChunkEntityBase } from './generated/file-page-chunk-base';
import {
  FilePageChunkFieldRequest,
  FilePageChunkResponse,
} from './generated/file-page-chunk-type';
import { FileEntity } from './file';
import { FilePageEntity } from './file-page';
import { FilePageChunk as PrismaFilePageChunk } from '@prisma/client';

export class FilePageChunkEntity extends FilePageChunkEntityBase {
}
