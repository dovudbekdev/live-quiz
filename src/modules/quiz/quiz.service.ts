import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { generateCode } from '@common/utils/generate-code.lib';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto & { teacherId: number }) {
    const roomCode = generateCode();
    return this.prisma.quizzes.create({ data: { ...createQuizDto, roomCode } });
  }

  findAll(userId: number) {
    return this.prisma.quizzes.findMany({ where: { id: userId } });
  }

  async findOne(id: number) {
    const quiz = await this.prisma.quizzes.findUnique({ where: { id } });

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
