import { UserEntity } from '@src/modules/user/entities/user.entity';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserEntity;
}
