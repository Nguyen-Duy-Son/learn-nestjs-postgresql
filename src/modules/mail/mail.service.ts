import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { OtpPurpose, OtpType } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {}

  async sendVerificationEmail(to: string, subject: string, token: string): Promise<void> {
    try {
      const from = this.configService.get<string>('USER_EMAIL');
      const apiUrl = this.configService.get<string>('API_URL');

      if (!from || !apiUrl) {
        throw new Error('Server misconfiguration');
      }

      const verificationLink = `${apiUrl}/auth/verify-email?token=${token}`;

      await this.mailerService.sendMail({
        to,
        from,
        subject,
        template: 'welcome',
        context: { email: to, verificationLink }, // Truyền thêm email
      });
    } catch (error) {
      throw new Error(`Error sending email: ${error}`);
    }
  }

  // Hàm tạo OTP ngẫu nhiên 6 số
  async generateOtpCode(): Promise<{ otpCode: string; expiresAt: number }> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP 6 số
    const expiresAt = new Date().getTime() + 1000 * 60 * 1; // Thời gian hết hạn sau 1 phút
    return { otpCode, expiresAt };
  }

  async sendOtpEmail(email: string, typeOtp: OtpType, purposeOtp: OtpPurpose): Promise<void> {
    try {
      const { otpCode, expiresAt } = await this.generateOtpCode();

      // Thời gian tạo OTP tính bằng h, phút, giây
      const createdAt = new Date();
      const deletedAt = new Date(expiresAt);
      await this.prismaService.otp.create({
        data: {
          email,
          otpCode,
          typeOtp,
          purposeOtp,
          createdAt,
          deletedAt,
          expiresAt,
        },
      });
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your OTP Code',
        template: 'otp', // Template otp.hbs
        context: { otpCode },
      });
    } catch (error) {
      throw new Error(`Error sending email: ${error}`);
    }
  }
}
