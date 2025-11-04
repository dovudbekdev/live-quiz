import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from '@config/index';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = 'api';

  const configServie = app.get(ConfigService);
  const PORT = configServie.get<number>('app.port', 4000);

  // Cors
  app.enableCors({ origin: '*' });

  // Set api prefix
  app.setGlobalPrefix(apiPrefix);

  // Class validator
  app.useGlobalPipes(new ValidationPipe());

  // Swagger
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/doc`, app, documentFactory);

  await app.listen(PORT, () => {
    console.log(`Server ${PORT}'da ishga tushdi`);
    console.log(`Swagger url: http://localhost:${PORT}/${apiPrefix}/doc`);
  });
}

bootstrap();
