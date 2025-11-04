import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createQuestionDto: CreateQuestionDto) {
    await this.quizService.findOne(createQuestionDto.quizId);
    return this.prisma.questions.create({ data: createQuestionDto });
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
