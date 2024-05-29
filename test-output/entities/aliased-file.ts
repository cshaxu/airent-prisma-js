// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-resources/context';

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
} from './generated/aliased-file-type';
import { AliasedFileEntityBase } from './generated/aliased-file-base';

export class AliasedFileEntity extends AliasedFileEntityBase {
}
