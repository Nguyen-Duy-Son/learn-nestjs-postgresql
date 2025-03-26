import { registerAs } from '@nestjs/config';

export type AppConfig = {
  nodeEnv: string;
  name: string;
  port: number;
  mailFrom: string;
};

// Hàm giúp đăng ký một phần cấu hình của ứng dụng theo một tên nhất định

export default registerAs<AppConfig>('app-config', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'LEARN_NESTJS Server',
  port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
  mailFrom: process.env.MAIL_FROM || 'sondev2k3@gmail.com',
}));
