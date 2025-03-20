import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    const secret =
      this.configService.get<string>('JWT_ACCESS_SECRET') || 'learn_nestjs_access_server';
    const expiresIn = this.configService.get<number>('JWT_ACCESS_EXPIRATION') || '15m';
    return { secret, signOptions: { expiresIn } };
  }
}
