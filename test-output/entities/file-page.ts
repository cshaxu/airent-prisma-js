// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-resources/context';

// entity imports
import { FilePage as PrismaFilePage } from '@prisma/client';
import { JsonValue as PrismaJsonValue } from '@prisma/client/runtime/library';
import { AliasedFileEntity } from './aliased-file';
import { FilePageChunkEntity } from './file-page-chunk';
import {
  FilePageFieldRequest,
  FilePageResponse,
  SelectedFilePageResponse,
  FilePageModel,
} from './generated/file-page-type';
import { FilePageEntityBase } from './generated/file-page-base';

export class FilePageEntity extends FilePageEntityBase {
}
