import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { Socket } from 'socket.io';
import { Students, Quizzes, Answers, Results, Teachers } from '@prisma/client';
import { SOCKET } from '@common/enums';
import { StudentAnswerDto } from './dto/student-answer.dto';
import { QuizService } from '@modules/quiz/quiz.service';
import { EndQuizDto, StrictEndQuizDto } from './dto/end-quiz.dto';
import { ResultService } from '@modules/result/result.service';
import { BotService } from '@modules/bot/bot.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizService: QuizService,
    private readonly resultService: ResultService,
    private readonly botService: BotService,
  ) {}

  async joinRoom(
    joinRoomDto: JoinRoomDto,
    client: Socket,
  ): Promise<
    | {
        student: Students | null;
        students: Students[];
        teacher: Teachers;
        quiz: Quizzes;
      }
    | undefined
  > {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { roomCode: joinRoomDto.roomCode },
    });

    if (!quiz || !quiz.isActive) {
      client.emit(SOCKET.ERROR, { message: 'Xona topilmadi yoki faol emas' });
      return;
    }

    let student: null | Students = null;
    if (joinRoomDto.type !== 'teacher') {
      student = await this.prisma.students.create({
        data: {
          quizId: quiz.id,
          name: joinRoomDto.name,
          socketId: client.id,
        },
      });
    }

    // Xonadagi barcha studentlar ro'yxatini olish
    const students = await this.prisma.students.findMany({
      where: {
        quizId: quiz.id,
        isActive: true,
      },
    });

    const teacher = await this.prisma.teachers.findUnique({
      where: { id: quiz.teacherId },
    });

    if (!teacher) {
      client.emit(SOCKET.ERROR, { message: 'Teacher topilmadi' });
      return;
    }

    return { student, students, teacher, quiz };
  }

  async startQuiz(client: Socket): Promise<Quizzes | undefined> {
    try {
      const socketId = client.id;

      const foundStudent = await this.prisma.students.findFirst({
        where: { socketId },
        include: { quiz: true },
      });

      if (!foundStudent) {
        client.emit(SOCKET.ERROR, {
          message: `socket_id=${socketId} bunday socket ID'li foydalanuvchi topilmadi`,
        });
        return;
      }

      const quizze = await this.quizService.startQuiz(foundStudent.quizId);
      // const quizze = await this.prisma.quizzes.findFirst({
      //   where: { id: foundStudent?.quiz.id },
      //   include: {
      //     teacher: true,
      //     questions: {
      //       include: {
      //         answers: true,
      //       },
      //     },
      //   },
      // });

      // if (!quizze) {
      //   client.emit(SOCKET.ERROR, {
      //     message: "O'quvchiga biriktirilgan vikorina (quiz) mavjud emas",
      //   });
      //   return;
      // }

      return quizze;
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(SOCKET.ERROR, {
          message: "O'quvchiga biriktirilgan vikorina (quiz) mavjud emas",
        });
      } else {
        client.emit(SOCKET.ERROR, {
          message: `${error}`,
        });
      }
    }
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

  async endQuiz(
    endQuizDto: { studentId: number },
    client: Socket,
  ): Promise<
    | {
        studentResult: Results;
        student: Students & { quiz: Quizzes };
        bestResult: Results;
      }
    | undefined
  > {
    try {
      const result = await this.resultService.create(endQuizDto);
      const student = await this.prisma.students.findUnique({
        where: { id: endQuizDto.studentId },
        include: { quiz: true },
      });

      if (!student) {
        client.emit(SOCKET.ERROR, {
          message: `Student topilmadi`,
        });
        return;
      }

      if (!student.quiz) {
        client.emit(SOCKET.ERROR, {
          message: `Studentning quizi topilmadi`,
        });
        return;
      }

      // const message = this.botService.resultMessage(student, result);

      // const foundTeacher = await this.prisma.teachers.findUnique({
      //   where: { id: endQuizDto.teacherId },
      // });

      // if (!foundTeacher) {
      //   client.emit(SOCKET.ERROR, {
      //     message: `Teacher topilmadi`,
      //   });
      //   return;
      // }

      // if (!foundTeacher?.telegramId) {
      //   client.emit(SOCKET.ERROR, {
      //     message: `${foundTeacher?.name} iltioms natijalarni sizga yubora olishimiz uchun bot'ga start bosing`,
      //   });
      //   return;
      // }

      const bestResult = await this.prisma.results.findFirst({
        orderBy: [
          { score: 'desc' }, // 1️⃣ Eng katta ball bo‘yicha
          { finishedAt: 'asc' }, // 2️⃣ Agar ball teng bo‘lsa, eng erta tugatgan
        ],
        include: {
          student: true, // 3️⃣ Student ma’lumotlarini ham qo‘shamiz
        },
      });

      if (!bestResult) {
        client.emit(SOCKET.ERROR, {
          message: `Eng yuqori natija to'plagan o'quvchi mavjud emas`,
        });
        return;
      }

      // await this.botService.sendMessage(foundTeacher.telegramId, message);

      return {
        studentResult: result,
        student,
        bestResult: bestResult,
      };
    } catch (error) {
      client.emit(SOCKET.ERROR, {
        message: error,
      });
    }
  }
}
