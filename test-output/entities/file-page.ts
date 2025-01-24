// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-sources/context';

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
} from '../generated/types/file-page';
import { FilePageEntityBase } from '../generated/entities/file-page';

export class FilePageEntity extends FilePageEntityBase {
}
