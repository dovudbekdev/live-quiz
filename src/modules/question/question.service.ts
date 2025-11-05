import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionWithOptionsDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { QuizService } from '@modules/quiz/quiz.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizService: QuizService,
  ) {}

  async createQuestionWithOptions(
    createQuestionDto: CreateQuestionWithOptionsDto,
  ) {
    await this.quizService.findOne(createQuestionDto.quizId);

    return this.prisma.$transaction(async (tx) => {
      try {
        // Quiz'ga title qo'shish
        await tx.quizzes.update({
          where: { id: createQuestionDto.quizId },
          data: { title: createQuestionDto.title },
        });

        for (let question of createQuestionDto.questions) {
          const createdQuestion = await tx.questions.create({
            data: {
              quizId: createQuestionDto.quizId,
              questionText: question.questionText,
            },
          });

          const answerData = question.options.map((option) => ({
            questionId: createdQuestion.id,
            answerText: option.answerText,
            isCorrect: option.isCorrect ?? false,
          }));

          // Variantlarni yaratish
          await tx.answers.createMany({
            data: answerData,
          });
        }

        return true;
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
    return this.prisma.questions.findMany({ include: { answers: true } });
  }

  async findOne(id: number) {
    const question = await this.prisma.questions.findUnique({
      where: { id },
      include: { answers: true },
    });

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
