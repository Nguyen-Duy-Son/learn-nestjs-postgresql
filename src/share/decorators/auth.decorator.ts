import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthGuard } from '../guards/auth.guard';
import { Role } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

// export function Auth() {
//   return applyDecorators(
//     UseGuards(AuthGuard),
//     ApiBearerAuth(),
//     ApiUnauthorizedResponse({ description: 'Unauthorized' })
//   );
// }

export function Auth(...roles: Role[]) {
  return applyDecorators(
    Roles(...roles), // Gọi Roles và truyền roles
    UseGuards(AuthGuard, RolesGuard), // Gọi cả hai guards
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  );
}
