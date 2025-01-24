// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-sources/context';

// entity imports
import { AliasedFile as PrismaAliasedFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';
import { FilePageEntity } from './file-page';
import { FilePageChunkEntity } from './file-page-chunk';
import {
  AliasedFileFieldRequest,
  AliasedFileResponse,
  SelectedAliasedFileResponse,
  AliasedFileModel,
} from '../generated/types/aliased-file';
import { AliasedFileEntityBase } from '../generated/entities/aliased-file';

export class AliasedFileEntity extends AliasedFileEntityBase {
}
