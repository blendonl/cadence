import { EntityTimestamps } from '../../types/common.types';

export interface UserDto extends EntityTimestamps {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

export interface UserSummaryDto {
  id: string;
  email: string;
  name: string;
  image: string | null;
}
