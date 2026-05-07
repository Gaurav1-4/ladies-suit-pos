import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: http://0.0.0.0:${port}/api/v1`);
  } catch (error) {
    console.error('❌ Error during application bootstrap', error);
    process.exit(1);
  }
}
bootstrap();
