import { LoadKey, toArrayMap, toObjectMap } from 'airent';
import { FilePageEntityBase } from './generated/file-page-base';
import {
  FilePageFieldRequest,
  FilePageResponse,
  FilePageModel,
} from './generated/file-page-type';
import { FileEntity } from './file';
import { FilePageChunkEntity } from './file-page-chunk';
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';

export class FilePageEntity extends FilePageEntityBase {
}
