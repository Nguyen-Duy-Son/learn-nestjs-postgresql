import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { BcryptConfig } from '@src/share/configs/bcrypt.config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { LoginResponseDto } from './dto/response/login.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptConfig: BcryptConfig,
    private readonly jwtService: JwtService
  ) {}

  async register(registerRequestDto: RegisterRequestDto) {
    // Tạo một tài khoản mới.
    return this.createUser(registerRequestDto);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Đăng nhập vào hệ thống.
    const { email, password } = loginDto;
    const user = await this.getAuthenticatedUser(email, password);
    const payload = { id: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });

    const response = new LoginResponseDto();
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
    response.user = plainToInstance(UserEntity, user, { excludeExtraneousValues: true });

    return response;
  }

  private async createUser(registerDto: RegisterRequestDto): Promise<UserEntity> {
    const { email, password } = registerDto;

    // Kiểm tra xem email đã tồn tại chưa
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const newPassword = await this.bcryptConfig.hashPassword(password);

    // Tạo user mới và chỉ trả về các trường cần thiết
    const result = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: newPassword,
      },
    });
    const newUser = plainToInstance(UserEntity, result, { excludeExtraneousValues: true });

    return newUser;
  }

  private async getAuthenticatedUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('User not found. Please register to continue');
    }
    await this.verifyPassword(password, user.password);
    return user;
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    const isPasswordMatching = await this.bcryptConfig.comparePassword(password, hashedPassword);
    if (!isPasswordMatching) {
      throw new BadRequestException('Password is not correct');
    }
  }
}
