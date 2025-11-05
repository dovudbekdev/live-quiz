import { Ctx, Start, Update } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      'Salom 👋! Bu Live Quiz o‘qituvchilar uchun yordamchi bot.\n' +
        'G‘oliblar haqidagi xabarlar shu yerga yuboriladi 📩',
    );
  }
}
