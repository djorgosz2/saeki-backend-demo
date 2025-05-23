import { UserEntity } from '../../users/user.entity';

export class AuthResponseDto {
  token: string;
  tokenExpires: number;
  user: UserEntity;
}
