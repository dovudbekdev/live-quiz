import { Action, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { Context, Markup } from 'telegraf';
import { UserService } from '@modules/user/user.service';
import { BOT_STEP } from '@common/enums';
import { PasswordService } from '@common/services';
import { AuthService } from '@modules/auth/auth.service';

interface MyContext extends Context {
  session: {
    step: string;
    aks: string;
    phoneNumber: string;
    password: string;
  };
}

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Start()
  async start(@Ctx() ctx: MyContext) {
    const user = ctx.from;

    // const existingUser = await this.userService.findOneTeacherWithPhoneNumber()

    await ctx.reply(
      'Salom 👋! Bu Live Quiz o‘qituvchilar uchun yordamchi bot.\n' +
        'G‘oliblar haqidagi xabarlar shu yerga yuboriladi 📩',
      Markup.inlineKeyboard([
        [Markup.button.callback("Ro'yxatdan o'tish", 'register')],
        [Markup.button.callback('Login', 'login')],
      ]),
    );
  }

  @Action('login')
  async onLogin(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    ctx.session.step = BOT_STEP.LOGIN;
    ctx.session.aks = BOT_STEP.ASK_PHONE_NUMBER;
    await ctx.reply(
      'Iltimos telefon raqamingizni kiriting',
      Markup.keyboard([[Markup.button.contactRequest('Telfon raqam')]])
        .resize()
        .oneTime(),
    );
  }

  @Action('register')
  async onRegister(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    ctx.session.step = BOT_STEP.REGISTER;
    await ctx.reply(
      'Iltimos telefon raqamingizni kiriting',
      Markup.keyboard([[Markup.button.contactRequest('Telfon raqam')]])
        .resize()
        .oneTime(),
    );
  }

  // Agar foydalanuvchi kontakt tugmasi orqali yuborgan bo'lsa
  @On('contact')
  async onContact(@Ctx() ctx: MyContext) {
    const msg = ctx.message as any;
    const step = ctx.session.step;
    const contact = msg.contact;

    const foundTeacherByPhoneNumber =
      await this.userService.findOneTeacherWithPhoneNumber(
        contact.phone_number,
      );

    ctx.session.phoneNumber = contact.phone_number;

    if (step === BOT_STEP.LOGIN) {
      if (!foundTeacherByPhoneNumber) {
        return await ctx.reply("Bu telefon raqam ro'yxatdan o'tmagan");
      }

      await this.userService.updateTeacher(foundTeacherByPhoneNumber.id, {
        telegramId: ctx.from?.id,
      });

      await ctx.reply('Tizimga muvaffaqiyatli kirdingiz');
      return;
    }

    if (step === BOT_STEP.REGISTER) {
      ctx.session.aks = BOT_STEP.ASK_PASSWORD;
      await ctx.reply("Iltimos parol o'ylab toping");
      return;
    }
  }

  // Agar foydalanuvchi tugma bosmay to'g'ridan-to'g'ri matn sifatida yozsa
  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    const msg = ctx.message as any;
    const step = ctx.session.step;
    const ask = ctx.session.aks;

    if (ask === BOT_STEP.ASK_PASSWORD && step === BOT_STEP.REGISTER) {
      console.log('userData =>', ctx.session);
      console.log('password', msg.text);
      await this.authService.register({
        phoneNumber: ctx.session.phoneNumber,
        password: msg.text,
      });

      await ctx.reply("Tabriklayman siz muvaffaqiyatli ro'yxatdan o'tdingiz");
      return;
    }

    await ctx.reply('Aniqlanmagan buyruq');
  }
}
