import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV,
  appName: process.env.APP_NAME,
  port: Number(process.env.PORT),
}));
