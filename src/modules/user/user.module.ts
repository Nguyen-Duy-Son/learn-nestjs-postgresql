import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BcryptConfig } from '@src/share/configs/bcrypt.config';

@Module({
  controllers: [UserController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard, // AuthGuard sẽ chạy trước cho tất cả API
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard, // RolesGuard chạy sau nếu có
    // },
    JwtService,
    UserService,
    PrismaService,
    BcryptConfig,
  ],
})
export class UserModule {}
