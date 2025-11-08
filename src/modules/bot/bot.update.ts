import { Action, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { Context, Markup } from 'telegraf';
import { UserService } from '@modules/user/user.service';
import { BOT_STEP } from '@common/enums';
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
    await ctx.reply(
      `👋 Assalomu alaykum, ${ctx.from?.first_name || 'hurmatli foydalanuvchi'}!\n\n` +
        `📚 Siz *Live Quiz* o‘qituvchilar uchun mo‘ljallangan rasmiy botdasiz.\n` +
        `🏆 Ushbu bot orqali siz test yakunlari va g‘oliblar haqidagi ma’lumotlarni to‘g‘ridan-to‘g‘ri shu yerda olasiz.\n\n` +
        `Iltimos, quyidagi amallardan birini tanlang 👇`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback("📝 Ro'yxatdan o'tish", 'register')],
          [Markup.button.callback('🔐 Tizimga kirish', 'login')],
        ]),
      },
    );
  }

  @Action('login')
  async onLogin(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    ctx.session.step = BOT_STEP.LOGIN;
    ctx.session.aks = BOT_STEP.ASK_PHONE_NUMBER;

    await ctx.reply(
      `📱 Iltimos, telefon raqamingizni yuboring.\n\n` +
        `Buning uchun pastdagi *"Telefon raqam"* tugmasini bosing 👇`,
      Markup.keyboard([[Markup.button.contactRequest('📲 Telefon raqam')]])
        .resize()
        .oneTime(),
    );
  }

  @Action('register')
  async onRegister(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    ctx.session.step = BOT_STEP.REGISTER;

    await ctx.reply(
      `📝 Yangi ro‘yxatdan o‘tish jarayonini boshlaymiz!\n\n` +
        `Iltimos, telefon raqamingizni yuboring 📱`,
      Markup.keyboard([[Markup.button.contactRequest('📲 Telefon raqam')]])
        .resize()
        .oneTime(),
    );
  }

  @On('contact')
  async onContact(@Ctx() ctx: MyContext) {
    const msg = ctx.message as any;
    const step = ctx.session.step;
    const contact = msg.contact;

    ctx.session.phoneNumber = contact.phone_number;

    const foundTeacher = await this.userService.findOneTeacherWithPhoneNumber(
      `+${contact.phone_number}`,
    );

    if (step === BOT_STEP.LOGIN) {
      if (!foundTeacher) {
        return await ctx.reply(
          `❌ Bu telefon raqam bizning bazada topilmadi.\n\n` +
            `Iltimos, avval *Ro‘yxatdan o‘tish* jarayonini bajaring.`,
          Markup.inlineKeyboard([
            [Markup.button.callback("📝 Ro'yxatdan o'tish", 'register')],
          ]),
        );
      }

      await this.userService.updateTeacher(foundTeacher.id, {
        telegramId: ctx.from?.id,
      });

      return await ctx.reply(
        `✅ Muvaffaqiyatli tizimga kirdingiz, ${foundTeacher.name || 'O‘qituvchi'}!\n\n` +
          `Endi test natijalari va xabarnomalar shu yerga yuboriladi 📩`,
      );
    }

    if (step === BOT_STEP.REGISTER) {
      ctx.session.aks = BOT_STEP.ASK_PASSWORD;

      return await ctx.reply(
        `🔑 Endi esa parol o‘ylab toping.\n\n` +
          `Bu parol orqali keyinchalik tizimga kira olasiz.`,
      );
    }
  }

  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    const msg = ctx.message as any;
    const step = ctx.session.step;
    const ask = ctx.session.aks;

    if (ask === BOT_STEP.ASK_PASSWORD && step === BOT_STEP.REGISTER) {
      await this.authService.register({
        name: ctx.from?.first_name,
        phoneNumber: `+${ctx.session.phoneNumber}`,
        password: msg.text,
        telegramId: ctx.from?.id,
      });

      return await ctx.reply(
        `🎉 Tabriklaymiz! Siz muvaffaqiyatli ro‘yxatdan o‘tdingiz.\n\n` +
          `Endi test natijalari va yangiliklar shu bot orqali yuboriladi 📬`,
      );
    }

    await ctx.reply(
      `🤔 Kechirasiz, bu buyruqni tushunmadim.\n\n` +
        `Iltimos, kerakli tugmani bosing yoki /start buyrug‘ini yuboring.`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Bosh sahifa', 'start')],
      ]),
    );
  }
}
