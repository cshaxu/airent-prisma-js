import { LoadKey, toArrayMap, toObjectMap } from 'airent';
import { Context } from '../../test-resources/context';
import { AliasedFileEntityBase } from './generated/aliased-file-base';
import {
  AliasedFileFieldRequest,
  AliasedFileResponse,
  SelectedAliasedFileResponse,
  AliasedFileModel,
} from './generated/aliased-file-type';
import { FilePageEntity } from './file-page';
import { FilePageChunkEntity } from './file-page-chunk';
import { AliasedFile as PrismaAliasedFile } from '@prisma/client';
import { FileType as PrismaFileType } from '@prisma/client';

export class AliasedFileEntity extends AliasedFileEntityBase {
}
