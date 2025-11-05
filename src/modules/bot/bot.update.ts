import { Action, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { Context, Markup } from 'telegraf';
import { UserService } from '@modules/user/user.service';
import { BOT_STEP } from '@common/enums';
import { PasswordService } from '@common/services';

interface MyContext extends Context {
  session: { step: string; data: string };
}

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
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
    ctx.session.step = BOT_STEP.ASK_PHONE_NUMBER;
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

    const contact = msg.contact;

    console.log({ contact });

    const foundTeacherByPhoneNumber =
      await this.userService.findOneTeacherWithPhoneNumber(
        contact.phone_number,
      );

    if (!foundTeacherByPhoneNumber) {
      return await ctx.reply("Bu telefon raqam ro'yxatdan o'tmagan");
    }

    ctx.session.step = BOT_STEP.ASK_PASSWORD;

    await ctx.reply('Iltimos parolingizni kiriting');
    // // Agar hozirgi step phone so'rovida bo'lsa yoki siz har doim qabul qilmoqchi bo'lsangiz
    // if (ctx.session.step !== BOT_STEP.ASK_PHONE_NUMBER) {
    //   // ixtiyoriy: noto'g'ri joyda yuborilsa xabar berish
    //   await ctx.reply(
    //     'Iltimos avval /start yoki login qilganingizga ishonch hosil qiling.',
    //   );
    //   return;
    // }

    // const contact = ctx.message;
    // // Ba'zi hollarda contact.user_id mavjud bo'lmasligi mumkin
    // if (contact.user_id && contact.user_id !== ctx.from.id) {
    //   // foydalanuvchi boshqa birovning kontaktini yuborgan bo'lishi mumkin
    //   await ctx.reply(
    //     "Iltimos o'zingizning telefon raqamingizni yuboring (o'zingizni tanlang).",
    //   );
    //   return;
    // }

    // const phone = contact.phone_number; // bu yerda telefon raqami
    // // session yoki DB ga saqlash
    // ctx.session.data = { ...(ctx.session.data || {}), phone };
    // ctx.session.step = BOT_STEP.DONE;

    // // keyboardni olib tashlash
    // await ctx.reply(
    //   `Rahmat! Sizning telefon raqamingiz: ${phone}`,
    //   Markup.removeKeyboard(),
    // );

    // // keyingi ishlar: DB ga saqlash va hokazo
    // // await this.userService.savePhone(ctx.from.id, phone);
  }

  // Agar foydalanuvchi tugma bosmay to'g'ridan-to'g'ri matn sifatida yozsa
  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    const msg = ctx.message;
    const step = ctx.session.step;

    if (step === BOT_STEP.ASK_PASSWORD) {
    }

    console.log('text =>', msg);
    // ctx.session ??= {};

    // if (ctx.session.step === BOT_STEP.ASK_PHONE_NUMBER) {
    //   const text = ctx.message.text.trim();
    //   // oddiy validatsiya: raqam va + bilan boshlanishni tekshirish
    //   const normalized = text.replace(/[\s()-]/g, '');
    //   const phoneRegex = /^\+?\d{7,15}$/; // moslashuvchan regex
    //   if (!phoneRegex.test(normalized)) {
    //     await ctx.reply(
    //       'Noto‘g‘ri format. Iltimos +998901234567 shaklida yuboring yoki kontakt tugmasini bosing.',
    //     );
    //     return;
    //   }

    //   // saqlash
    //   ctx.session.data = { ...(ctx.session.data || {}), phone: normalized };
    //   ctx.session.step = BOT_STEP.DONE;

    //   await ctx.reply(
    //     `Rahmat! Telefon raqamingiz: ${normalized}`,
    //     Markup.removeKeyboard(),
    //   );
    //   // DB ga saqlash kabilar...
    //   return;
    // }

    // boshqa holatlar
    await ctx.reply('Buyruqlar uchun /start yoki login tugmasini bosing.');
  }
}
