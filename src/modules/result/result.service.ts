import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

    // Quzini boshlagan vaqtini aniqlash uchun
    const quiz = await this.prisma.quizzes.findUnique({
      where: { id: student.quizId },
    });

    if (!quiz) {
      throw new NotFoundException("Bunday ID'li quiz mavjud emas");
    }

    const foundResult = await this.prisma.results.findUnique({
      where: { studentId: student.id },
    });
    if (foundResult) {
      throw new ConflictException(
        `Bunday studentID (${student.id}) li result allaqachon mavjud`,
      );
    }

    //  Natijani Results jadvaliga saqlash
    const result = await this.prisma.results.create({
      data: {
        studentId: student.id,
        quizId: quiz.id,
        totalCorrect: totalCorrect,
        totalQuestion: totalQuestions,
        score: new Prisma.Decimal(score),
        deleted: false,
        startedAt: quiz.startTime || new Date(),
        finishedAt: new Date(),
      },
    });

    return result;
  }

  findAll() {
    return this.prisma.results.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} result`;
  }

  update(id: number, updateResultDto: UpdateResultDto) {
    return `This action updates a #${id} result`;
  }

  remove(id: number) {
    return this.prisma.results.delete({ where: { id } });
  }
}
