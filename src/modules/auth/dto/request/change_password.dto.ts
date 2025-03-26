import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'New Password phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự đặc biệt!',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Confirm Password phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự đặc biệt!',
  })
  confirmNewPassword: string;
}
