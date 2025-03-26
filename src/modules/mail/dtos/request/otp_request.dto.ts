import { OtpPurpose, OtpType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class OtpRequestDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  typeOtp: OtpType;

  @IsString()
  @IsNotEmpty()
  purposeOtp: OtpPurpose;
}
