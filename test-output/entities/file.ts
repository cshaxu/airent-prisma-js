import { LoadKey, toArrayMap, toObjectMap } from 'airent';
import { FileEntityBase } from './generated/file-base';
import {
  FileFieldRequest,
  FileResponse,
  FileModel,
} from './generated/file-type';
import { FilePageEntity } from './file-page';
import { FilePageChunkEntity } from './file-page-chunk';
import { File as PrismaFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

export class FileEntity extends FileEntityBase {
}
