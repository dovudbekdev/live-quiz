import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Live Quiz')
  .setDescription('Live Quiz uchun swagger dokumentatsiya')
  .addBearerAuth()
  .build();
