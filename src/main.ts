import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from '@config/index';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configServie = app.get(ConfigService);

  const PORT = configServie.get<number>('app.port', 4000);
  const API_PREFIX = configServie.get<string>('app.apiPrefix', 'api');
  const APP_HOST = configServie.get<string>('app.appHost', 'localhost');

  const URL = `http://${APP_HOST}:${PORT}/${API_PREFIX}`;
  // Cors
  app.enableCors({ origin: '*' });

  // Set api prefix
  app.setGlobalPrefix(API_PREFIX);

  // Class validator
  app.useGlobalPipes(new ValidationPipe());

  // Swagger
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${API_PREFIX}/doc`, app, documentFactory);

  await app.listen(PORT, () => {
    console.log(`Server ${PORT}'da ishga tushdi`);
    console.log(`Swagger url: ${URL}/doc`);
  });
}

bootstrap();
