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

  resultMessage(result: Results & { student: Students }) {
    const startTime = new Date(result.startedAt);
    const endTime = new Date(result.finishedAt);

    const diffMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    const durationText =
      minutes > 0 ? `${minutes} daqiqa ${seconds} soniya` : `${seconds} soniya`;

    const praiseText =
      Number(result.score) >= 90
        ? '🏆 <b>Ajoyib natija!</b> Ushbu talaba haqiqatan ham mukammal ishlagan! 🔥'
        : Number(result.score) >= 70
          ? '👏 <b>Yaxshi natija!</b> Juda barqaror ishlagan, zo‘r natija! 💪'
          : Number(result.score) >= 50
            ? '🙂 <b>O‘rtacha natija,</b> lekin potensiali kuchli! 📚'
            : '😔 <b>Bu safar unchalik emas,</b> ammo keyingi safar albatta yaxshiroq bo‘ladi! 🚀';

    return `
🎓 <b>Eng yuqori natijali talaba</b>

👤 <b>Ism:</b> ${result.student.name}
🆔 <b>ID:</b> ${result.student.id}

📈 <b>Umumiy ball:</b> ${result.score}%
✅ <b>To‘g‘ri javoblar:</b> ${result.totalCorrect}/${result.totalQuestion}

🕒 <b>Boshlangan:</b> ${startTime.toLocaleString('uz-UZ')}
🏁 <b>Tugagan:</b> ${endTime.toLocaleString('uz-UZ')}
⏱️ <b>Davomiyligi:</b> ${durationText}

${praiseText}
`;
  }
}
