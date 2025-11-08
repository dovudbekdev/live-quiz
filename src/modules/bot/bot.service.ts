import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Results, Students } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class BotService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(telegramId: string, message: string) {
    const existingTeacher = await this.prisma.teachers.findFirst({
      where: { telegramId },
    });

    if (!existingTeacher) {
      throw new NotFoundException(
        "Bunday telegrmaId'li foydalanuvchi mavjud emas",
      );
    }

    const botSendMessageUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

    // Bot orqali url'ni foydalanuvchiga yuborish
    await axios.post(botSendMessageUrl, {
      chat_id: existingTeacher.telegramId,
      text: message,
      parse_mode: 'HTML',
    });

    return true;
  }

  resultMessage(student: Students, result: Results) {
    const startTime = new Date(result.startedAt);
    const endTime = new Date(result.finishedAt);

    // ✅ Har ikkisini millisekundga aylantiramiz
    const diffMs = endTime.getTime() - startTime.getTime();

    // Uni daqiqa va soniyaga o‘tkazamiz
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    const durationText =
      minutes > 0 ? `${minutes} daqiqa ${seconds} soniya` : `${seconds} soniya`;
    return `
📊 <b>Test natijasi</b>

👤 <b>Foydalanuvchi:</b> ${student.name}
🆔 <b>ID:</b> ${student.id}

📝 <b>Umumiy savollar:</b> ${result.totalQuestion}
✅ <b>To‘g‘ri javoblar:</b> ${result.totalCorrect}
📈 <b>Ball:</b> ${result.score}%

🕒 <b>Boshlangan vaqt:</b> ${new Date(result.startedAt).toLocaleString('uz-UZ')}
🏁 <b>Tugagan vaqt:</b> ${new Date(result.finishedAt).toLocaleString('uz-UZ')}
⏱️ <b>Davomiyligi:</b> ${durationText}

${
  Number(result.score) >= 90
    ? '🏆 Ajoyib natija! Siz juda zo‘rsiz! 🔥'
    : Number(result.score) >= 70
      ? '👏 Yaxshi natija! Shu zaylda davom eting 💪'
      : Number(result.score) >= 50
        ? '🙂 Yomon emas, lekin biroz ko‘proq mashq qiling 📚'
        : '😔 Natija pastroq chiqdi. Keyingi safar albatta muvaffaqiyat qozonasiz!'
}
`;
  }
}
