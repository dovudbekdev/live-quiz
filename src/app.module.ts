import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig, jwtConfig } from '@config/index';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { QuizModule } from './modules/quiz/quiz.module';
import { QuestionModule } from './modules/question/question.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { BotModule } from './modules/bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
    }),
    JwtModule.register({ global: true }),
    AuthModule,
    QuizModule,
    QuestionModule,
    UserModule,
    // AnswerModule,
    PrismaModule,
    GatewayModule,
    BotModule,
  ],
})
export class AppModule {}
