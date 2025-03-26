import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { BcryptConfig } from '@src/share/configs/bcrypt.config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { LoginResponseDto } from './dto/response/login.dto';
import { plainToInstance } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { Otp, OtpPurpose, OtpType } from '@prisma/client';
import { OtpRequestDto } from '../mail/dtos/request/otp_request.dto';
import { VerifyOtpRequestDto } from '../mail/dtos/request/verify_otp.dto';
import { ChangePasswordRequestDto } from './dto/request/change_password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptConfig: BcryptConfig,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(registerRequestDto: RegisterRequestDto) {
    // Tạo một tài khoản mới.
    return this.sendNotificationCreateAccount(registerRequestDto);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Đăng nhập vào hệ thống.
    try {
      const { email, password } = loginDto;
      const user = await this.getAuthenticatedUser(email, password);
      const payload = { id: user.id, role: user.role, jwtSecret: process.env.JWT_ACCESS_SECRET };
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found. Please register to continue');
      }
      const isCheckVerifyEmail = await this.isCheckVerifyEmail(user.isVerifiedEmail);
      if (!isCheckVerifyEmail) {
        throw new BadRequestException('Please verify your email to continue');
      }

      await this.verifyPassword(password, user.password);

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async isCheckVerifyEmail(isVerifiedEmail: boolean) {
    return isVerifiedEmail === true;
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    try {
      const isPasswordMatching = await this.bcryptConfig.comparePassword(password, hashedPassword);
      if (!isPasswordMatching) {
        throw new BadRequestException('Password is not correct');
      }
    } catch (error) {
      console.error(`❌ Verify password failed:`, error);
      throw new BadRequestException('Verify password failed');
    }
  }

  private async createUser(registerDto: RegisterRequestDto): Promise<UserEntity> {
    try {
      const { password } = registerDto;
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
    } catch (error) {
      console.error(`❌ Create user failed:`, error);
      throw new BadRequestException('Create user failed');
    }
  }

  private async sendNotificationCreateAccount(registerDto: RegisterRequestDto) {
    try {
      // Kiểm tra xem email đã tồn tại chưa
      const { email } = registerDto;
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        throw new BadRequestException('Email already exists');
      }

      await this.createUser(registerDto);

      const payload = { email: email };
      const tokenVerifyEmail = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_VERIFY_EMAIL_SECRET,
        expiresIn: process.env.JWT_VERIFY_EMAIL_EXPIRATION,
      });

      // Gửi email thông báo tạo tài khoản
      await this.mailService.sendVerificationEmail(
        email,
        'Welcome to our application',
        tokenVerifyEmail
      );
      return { message: 'Send mail successfully !' };
    } catch (error) {
      console.error(`❌ Gửi email thất bại:`, error);
      throw new BadRequestException(error.message);
    }
  }

  async verifyUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_VERIFY_EMAIL_SECRET,
      });

      const email = payload.email;
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      return await this.prisma.user.update({
        where: { email },
        data: { isVerifiedEmail: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendOtp(otpRequestDto: OtpRequestDto) {
    try {
      const { email } = otpRequestDto;
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const otpData = await this.prisma.otp.findFirst({
        where: {
          email,
          typeOtp: OtpType.EMAIL,
          purposeOtp: OtpPurpose.FORGOT_PASSWORD,
        },
        orderBy: {
          createdAt: 'desc', // Lấy OTP mới nhất
        },
      });

      if (otpData && (await this.isCheckOtp(otpData))) {
        throw new BadRequestException('Please wait 1 minute before sending again');
      }

      if (otpRequestDto.typeOtp === OtpType.EMAIL) {
        await this.mailService.sendOtpEmail(email, OtpType.EMAIL, OtpPurpose.FORGOT_PASSWORD);
      }
      return { message: 'Send OTP to successfully !' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyOtp(verifyOtpRequestDto: VerifyOtpRequestDto) {
    try {
      if (verifyOtpRequestDto.typeOtp === OtpType.EMAIL) {
        return await this.verifyOtpEmail(verifyOtpRequestDto);
      }
      return;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async verifyOtpEmail(verifyOtpRequestDto: VerifyOtpRequestDto) {
    try {
      const { email, otpCode } = verifyOtpRequestDto;
      const otpData = await this.prisma.otp.findFirst({
        where: {
          email,
          otpCode,
          typeOtp: OtpType.EMAIL,
          purposeOtp: OtpPurpose.FORGOT_PASSWORD,
        },
        orderBy: {
          createdAt: 'desc', // Lấy OTP mới nhất
        },
      });

      if (!otpData || !(await this.isCheckOtp(otpData))) {
        throw new BadRequestException('OTP is invalid or expired');
      }

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const payload = {
        email: email,
        jwtSecret: process.env.JWT_RESET_PASSWORD_SECRET,
        role: user.role,
      };
      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRATION,
      });

      return { message: 'Verify OTP successfully !', data: token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async isCheckOtp(otpData: Otp): Promise<boolean> {
    try {
      const { createdAt, expiresAt } = otpData;
      const currentTime = Date.now(); // Lấy thời gian hiện tại (milliseconds)

      // Kiểm tra OTP có còn hạn không
      if (currentTime > expiresAt) {
        return false; // OTP đã hết hạn
      }

      // Kiểm tra xem expiresAt có đúng 1 phút sau createdAt không
      const isValidDuration = expiresAt - BigInt(createdAt.getTime()) === BigInt(60 * 1000); // 1 phút = 60,000ms

      return isValidDuration;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changePassword(email: string, changePasswordRequestDto: ChangePasswordRequestDto) {
    try {
      const { newPassword, confirmNewPassword } = changePasswordRequestDto;
      if (newPassword !== confirmNewPassword) {
        throw new BadRequestException('Password and confirm password do not match');
      }
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const newPasswordHash = await this.bcryptConfig.hashPassword(newPassword);
      const userUpdated = await this.prisma.user.update({
        where: { email },
        data: { password: newPasswordHash },
      });
      const userEntity = plainToInstance(UserEntity, userUpdated, {
        excludeExtraneousValues: true,
      });
      return { message: 'Change password successfully !', data: userEntity };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
