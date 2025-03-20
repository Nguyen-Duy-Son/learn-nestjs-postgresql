import { PartialType } from '@nestjs/swagger';
import { RegisterRequestDto } from '@src/modules/auth/dto/request/register.dto';

export class UpdateUserDto extends PartialType(RegisterRequestDto) {}
