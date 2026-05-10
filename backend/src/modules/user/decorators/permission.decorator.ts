import { SetMetadata } from '@nestjs/common';

export interface PermissionMetadata {
  name: string;
  module: string;
  systemModule?: string;
}

export const PERMISSION_META_KEY = 'permission_meta';
export const PermissionMeta = (metadata: PermissionMetadata) => 
  SetMetadata(PERMISSION_META_KEY, metadata);
