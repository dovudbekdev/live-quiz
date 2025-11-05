import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { Socket } from 'socket.io';
import { Students, Quizzes, Answers } from '@prisma/client';
import { SOCKET } from '@common/enums';
import { StudentAnswerDto } from './dto/student-answer.dto';

@Injectable()
export class GatewayService {
  constructor(private readonly prisma: PrismaService) {}

  async joinRoom(
    joinRoomDto: JoinRoomDto,
    client: Socket,
  ): Promise<{ student: Students; students: Students[] } | undefined> {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { roomCode: joinRoomDto.roomCode },
    });

    if (!quiz || !quiz.isActive) {
      client.emit(SOCKET.ERROR, { message: 'Xona topilmadi yoki faol emas' });
      return;
    }

    const student = await this.prisma.students.create({
      data: {
        quizId: quiz.id,
        name: joinRoomDto.name,
        socketId: client.id,
      },
    });

    // Xonadagi barcha studentlar ro'yxatini olish
    const students = await this.prisma.students.findMany({
      where: {
        quizId: quiz.id,
      },
    });

    return { student, students };
  }

  async startQuiz(client: Socket): Promise<Quizzes | undefined> {
    const socketId = client.id;

    const foundStudent = await this.prisma.students.findFirst({
      where: { socketId },
      include: { quiz: true },
    });

    const quizze = await this.prisma.quizzes.findFirst({
      where: { id: foundStudent?.quiz.id },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quizze) {
      client.emit(SOCKET.ERROR, {
        message: "O'quvchiga biriktirilgan vikorina (quiz) mavjud emas",
      });
      return;
    }

    return quizze;
  }

  async studentAnswer(
    studentAnswerDto: StudentAnswerDto,
    client: Socket,
  ): Promise<
    { student: Students & { quiz: Quizzes }; answer: Answers } | undefined
  > {
    const socketId = client.id;

    const foundStudent = await this.prisma.students.findFirst({
      where: { socketId },
      include: { quiz: true },
    });

    if (!foundStudent) {
      client.emit(SOCKET.ERROR, {
        message: `${socketId} bunday socket ID'li foydalanuvchi mavjud emas`,
      });
      return;
    }

    const answer = await this.prisma.answers.findUnique({
      where: { id: studentAnswerDto.answerId },
    });

    if (!answer) {
      client.emit(SOCKET.ERROR, {
        message: `${studentAnswerDto.answerId} bunday ID' answer mavjud emas`,
      });
      return;
    }

    await this.prisma.studentAnswers.create({
      data: {
        answerId: studentAnswerDto.answerId,
        studentId: foundStudent.id,
        questionId: studentAnswerDto.questionId,
      },
    });

    return { student: foundStudent, answer };
  }
}
