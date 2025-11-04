import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { QuestionService } from '@modules/question/question.service';

@Injectable()
export class AnswerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionService: QuestionService,
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    await this.questionService.findOne(createAnswerDto.questionId);

    return this.prisma.answers.create({ data: createAnswerDto });
  }

  findAll() {
    return this.prisma.answers.findMany();
  }

  async findOne(id: number) {
    const answer = await this.prisma.answers.findUnique({ where: { id } });

    if (!answer) {
      throw new NotFoundException("Bunday ID'li javob mavjud emas");
    }

    return answer;
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    await this.findOne(id);

    return this.prisma.answers.update({ where: { id }, data: updateAnswerDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.answers.delete({ where: { id } });
    return true;
  }
}
