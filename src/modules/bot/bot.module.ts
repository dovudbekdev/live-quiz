import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { UserModule } from '@modules/user/user.module';
import { session } from 'telegraf';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@modules/prisma/prisma.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
      middlewares: [session()],
    }),
    UserModule,
    AuthModule,
    PrismaModule,
  ],
  providers: [BotUpdate, BotService],
})
export class BotModule {}
