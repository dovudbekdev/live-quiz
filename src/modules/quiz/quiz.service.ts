import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { generateCode } from '@common/utils/generate-code.lib';
import { RoomCodeDto } from './dto/room-code.dto';

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

  async startQuiz(quizId: number) {
    const start = new Date();

    const quiz = await this.prisma.quizzes.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException("Bunday ID'li quiz mavjud emas");
    }

    const end = new Date(start.getTime() + quiz.duration * 1000);

    return this.prisma.quizzes.update({
      where: { id: quizId },
      data: {
        isActive: true,
        startTime: start,
        endTime: end,
      },
      include: {
        teacher: true,
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.quizzes.findMany({
      where: { id: userId },
      include: {
        teacher: true,
      },
    });
  }

  async findOne(id: number) {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { id },
      include: {
        teacher: true,
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

  async findOneQuizByRoomCode(roomCodeDto: RoomCodeDto) {
    const existingQuiz = await this.prisma.quizzes.findUnique({
      where: { roomCode: roomCodeDto.roomCode },
      include: { teacher: true },
    });

    if (!existingQuiz || !existingQuiz.isActive) {
      throw new BadRequestException('Quiz active emas yoki mavjud emas');
    }

    return existingQuiz;
  }

  async activateQuiz(id: number, userId: number) {
    // Activlashtirayotgan teacher'ga quiz tegishlimi yo'qmi aniqlab olish
    const existingQuiz = await this.findOne(id);

    if (existingQuiz.teacherId !== userId) {
      throw new ForbiddenException(
        "Bu viktorina (quiz)'ni activlashtirish uchun sizda ruxsat yo'q",
      );
    }

    await this.prisma.quizzes.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
    return true;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.quizzes.delete({ where: { id } });
    return true;
  }
}
