import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { generateCode } from '@common/utils/generate-code.lib';
import { identity } from 'rxjs';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto & { teacherId: number }) {
    if (createQuizDto.title) {
      const existingQuiz = await this.prisma.quizzes.findUnique({
        where: { title: createQuizDto.title },
      });

      if (existingQuiz) {
        throw new NotFoundException(
          `${createQuizDto.title} bunday nomdagi Vikorina allaqachon mavjud`,
        );
      }
    }

    const roomCode = generateCode();
    return this.prisma.quizzes.create({ data: { ...createQuizDto, roomCode } });
  }

  findAll(userId: number) {
    return this.prisma.quizzes.findMany({ where: { id: userId } });
  }

  async findOne(id: number) {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { id },
      include: {
        questions: {
          include: { answers: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Bunday viktorina mavjud emas');
    }
    return quiz;
  }

  // update(id: number, updateQuizDto: UpdateQuizDto) {
  //   return `This action updates a #${id} quiz`;
  // }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.quizzes.delete({ where: { id } });
    return true;
  }
}
