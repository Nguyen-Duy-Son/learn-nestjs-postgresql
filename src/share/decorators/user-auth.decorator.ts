import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

import { AppConstants } from '../constants';

export const UserAuth = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  return request[AppConstants.Auth.USER_AUTH_KEY];
});
