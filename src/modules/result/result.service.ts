import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResultDto: CreateResultDto) {
    // 1️⃣ Studentni topamiz
    const student = await this.prisma.students.findUnique({
      where: { id: createResultDto.studentId },
      include: { quiz: true },
    });

    if (!student) {
      throw new NotFoundException('Student topilmadi');
    }

    // Shu quizdagi jami savollar soni
    const totalQuestions = await this.prisma.questions.count({
      where: { quizId: student.quizId },
    });

    // Studentning barcha javoblari (question_id va answer_id)
    const studentAnswers = await this.prisma.studentAnswers.findMany({
      where: { studentId: student.id },
      include: { answer: true }, // Answers jadvalidagi is_correct qiymatini olish uchun
    });

    // To‘g‘ri javoblar sonini hisoblash
    const totalCorrect = studentAnswers.filter(
      (ans) => ans.answer.isCorrect === true,
    ).length;

    // Ballni hisoblash (foizlarda)
    const score = ((totalCorrect / totalQuestions) * 100).toFixed(2);

    //  Natijani Results jadvaliga saqlash
    const result = await this.prisma.results.create({
      data: {
        studentId: student.id,
        totalCorrect: totalCorrect,
        totalQuestion: totalQuestions,
        score: Number(score),
      },
    });

    return result;
  }

  findAll() {
    return `This action returns all result`;
  }

  findOne(id: number) {
    return `This action returns a #${id} result`;
  }

  update(id: number, updateResultDto: UpdateResultDto) {
    return `This action updates a #${id} result`;
  }

  remove(id: number) {
    return `This action removes a #${id} result`;
  }
}
