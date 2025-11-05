import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { UserModule } from '@modules/user/user.module';
import { session } from 'telegraf';
import { PasswordService } from '@common/services';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
      middlewares: [session()],
    }),
    UserModule,
  ],
  providers: [BotUpdate, BotService, PasswordService],
})
export class BotModule {}
