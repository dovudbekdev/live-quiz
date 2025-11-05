import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { QuizService } from '@modules/quiz/quiz.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizService: QuizService,
  ) {}

  async createQuestionWithOptions(createQuestionDto: CreateQuestionDto) {
    await this.quizService.findOne(createQuestionDto.quizId);

    return this.prisma.$transaction(async (tx) => {
      try {
        // Savol yaratish
        const question = await tx.questions.create({
          data: {
            quizId: createQuestionDto.quizId,
            questionText: createQuestionDto.questionText,
          },
        });

        // options (variantlar) dan yangi massiv yasaymiz
        const answerData = createQuestionDto.options.map((option) => ({
          questionId: question.id, // bu joyda yangi questionId biriktiriladi
          answerText: option.answerText, // foydalanuvchidan kelgan matn
          isCorrect: option.isCorrect ?? false, // agar isCorrect yuborilmasa, default false
        }));

        // Variantlarni yaratish
        await tx.answers.createMany({
          data: answerData,
        });

        const foundQuestionWithOptions = await tx.questions.findUnique({
          where: { id: question.id },
          include: {
            answers: true, // answers jadvalidan barcha variantlarni qo‘shamiz
          },
        });

        if (!foundQuestionWithOptions) {
          throw new NotFoundException("Bunday ID'li savol mavjud emas");
        }

        return foundQuestionWithOptions;
      } catch (error) {
        // 🧠 Prisma ma'lumotlar bazasi xatolarini ajratish
        if (error.code === 'P2003') {
          // Foreign key constraint failed (masalan, quizId mavjud emas)
          throw new BadRequestException(
            'Quiz topilmadi yoki bog‘lanish xatosi yuz berdi',
          );
        }

        if (error.code === 'P2002') {
          // Unique constraint violation
          throw new BadRequestException('Bu maʼlumot allaqachon mavjud');
        }

        // Agar boshqa nomaʼlum xato bo‘lsa
        console.error('❌ Prisma transaction error:', error);
        throw new InternalServerErrorException(
          'Savol yaratishda xatolik yuz berdi',
        );
      }
    });
  }

  findAll() {
    return this.prisma.questions.findMany();
  }

  async findOne(id: number) {
    const question = await this.prisma.questions.findUnique({ where: { id } });

    if (!question) {
      throw new NotFoundException("Bunday ID'li savol mavjud emas");
    }

    return question;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    await this.findOne(id);

    return await this.prisma.questions.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.questions.delete({ where: { id } });
    return true;
  }
}
