import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { rateLimit } from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './share/configs/app.config';
import { ValidationPipe } from '@nestjs/common/pipes';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: false,
  });

  app.use(rateLimit({ windowMs: 1000, limit: 20 }));

  app.useStaticAssets('static', { prefix: '/static' });

  // Set global prefix for all APIs
  app.setGlobalPrefix('/api/v1');

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const configService = app.get<ConfigService>(ConfigService);
  const appConfig = configService.get<AppConfig>('app-config');

  // Swagger API Document
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Start application
  await app.listen(appConfig.port);
  logger.log(`${appConfig.name} application listening port: ${appConfig.port}`);
  logger.log(
    `${appConfig.name} application API Document: http://localhost:${appConfig.port}/api/v1/docs`
  );
}
bootstrap();
