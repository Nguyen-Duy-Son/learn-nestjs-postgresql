import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { AppConstants } from '../constants';
import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);
//     if (!token) {
//       throw new UnauthorizedException('Vui lòng đăng nhập');
//     }
//     try {
//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: process.env.JWT_ACCESS_SECRET,
//       });
//       request[AppConstants.Auth.USER_AUTH_KEY] = payload;
//     } catch {
//       throw new UnauthorizedException('Vui lòng đăng nhập');
//     }
//     return true;
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    try {
      // Giải mã token trước (decode không cần `secret`)
      const decoded = this.jwtService.decode(token) as { jwtSecret: string } | null;
      if (!decoded || !decoded.jwtSecret) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Chọn `secret key` phù hợp dựa trên loại token
      let secretKey: string;
      switch (decoded.jwtSecret) {
        case process.env.JWT_ACCESS_SECRET:
          secretKey = this.configService.get<string>('JWT_ACCESS_SECRET');
          break;
        case process.env.JWT_RESET_PASSWORD_SECRET:
          secretKey = this.configService.get<string>('JWT_RESET_PASSWORD_SECRET');
          break;
        case process.env.JWT_REFRESH_SECRET:
          secretKey = this.configService.get<string>('JWT_REFRESH_SECRET');
          break;
        case process.env.JWT_VERIFY_EMAIL_SECRET:
          secretKey = this.configService.get<string>('JWT_VERIFY_EMAIL_SECRET');
          break;
        case process.env.JWT_RESET_PASSWORD_SECRET:
          secretKey = this.configService.get<string>('JWT_RESET_PASSWORD_SECRET');
          break;
        default:
          throw new UnauthorizedException('Loại token không hợp lệ');
      }

      // Xác minh token với `secret key` tương ứng
      const payload = await this.jwtService.verifyAsync(token, { secret: secretKey });
      request[AppConstants.Auth.USER_AUTH_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
