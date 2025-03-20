import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterRequestDto } from './dto/request/register.dto';

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

  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
