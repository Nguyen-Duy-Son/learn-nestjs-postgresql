import { Role } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserEntity {
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  fullName: string;
  @Expose()
  address: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  deletedAt: Date;
  @Expose()
  role: Role;
  @Expose()
  isVerifiedEmail: boolean;
}
