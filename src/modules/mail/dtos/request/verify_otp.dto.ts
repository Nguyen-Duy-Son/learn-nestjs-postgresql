import { OtpPurpose, OtpType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpRequestDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsString()
  @IsNotEmpty()
  typeOtp: OtpType;

  @IsString()
  @IsNotEmpty()
  purposeOtp: OtpPurpose;
}
