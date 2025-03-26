import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterRequestDto } from './dto/request/register.dto';
import { OtpRequestDto } from '../mail/dtos/request/otp_request.dto';
import { VerifyOtpRequestDto } from '../mail/dtos/request/verify_otp.dto';
import { Auth } from '@src/share/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { ChangePasswordRequestDto } from './dto/request/change_password.dto';
import { AppConstants } from '@src/share/constants';

@Controller('auth')
// Thư viện giúp tạo tài liệu API Swagger.
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Mô tả API trên Swagger (giúp hiển thị thông tin rõ ràng hơn trong tài liệu API).
  @ApiOperation({ summary: 'Tạo một tài khoản' })
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() registerDto: RegisterRequestDto) {
    return this.authService.register(registerDto);
  }

  @Get('/verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyUser(token);
  }

  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Gửi mã OTP' })
  @Post('/send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() otpRequestDto: OtpRequestDto) {
    return this.authService.sendOtp(otpRequestDto);
  }

  @ApiOperation({ summary: 'Xác thực mã OTP' })
  @Post('/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() verifyOtpRequestDto: VerifyOtpRequestDto) {
    return this.authService.verifyOtp(verifyOtpRequestDto);
  }

  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @Post('/change-password')
  // Sử dụng Auth decorator để kiểm tra quyền truy cập.
  @Auth(...[Role.ADMIN, Role.USER]) // Gọi Auth và truyền Role
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Req() request: Request,
    @Body() changePasswordRequestDto: ChangePasswordRequestDto
  ) {
    const { email } = request[AppConstants.Auth.USER_AUTH_KEY]; // Lấy user từ token
    return this.authService.changePassword(email, changePasswordRequestDto);
  }
}
