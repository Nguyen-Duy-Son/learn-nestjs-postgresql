import { Role } from '@prisma/client';
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ!' }) // Kiểm tra email
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Password phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự đặc biệt!',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  // giúp cho trường đó có thể bị bỏ trống mà không gây lỗi.
  @IsOptional()
  updatedAt: Date;

  @IsString()
  @IsOptional()
  role?: Role = Role.USER;
}
