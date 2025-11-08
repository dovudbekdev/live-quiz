import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';
import { SOCKET } from '@common/enums';
import { JoinRoomDto } from './dto/join-room.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { StudentAnswerDto } from './dto/student-answer.dto';
import { EndQuizDto } from './dto/end-quiz.dto';
import { BotService } from '@modules/bot/bot.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
  ) {}

  // ✅ SOCKET ULANGANDA
  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  // ✅ SOCKET UZILGANDA
  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);

    // eski socket_id orqali studentni topamiz
    const foundStudent = await this.prisma.students.findFirst({
      where: { socketId: client.id },
    });

    if (!foundStudent) return;

    await this.prisma.students.updateMany({
      where: { socketId: client.id },
      data: { isActive: false },
    });
  }

  // 🟩 STUDENT RECONNECT BO‘LGANDA (refreshdan keyin)
  @SubscribeMessage(SOCKET.RECONNECT_STUDENT)
  async reconnectStudent(
    @MessageBody()
    data: {
      studentId: number;
      roomCode: string | undefined;
      quizId: number | undefined;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Reconnect handle');
      if (data.roomCode && data.quizId) {
        // studentni xonasiga qaytaramiz
        const students = await this.prisma.students.findMany({
          where: { quizId: data.quizId, isActive: true },
        });
        client.join(data.roomCode);

        this.server
          .to(data.roomCode)
          .emit(SOCKET.STUDENT_LIST_UPDATE, { students });

        client.emit(SOCKET.RECONNECTED, {
          message: 'Siz qayta ulanishingiz muvaffaqiyatli amalga oshirildi!',
          student: 'Teacher',
        });
        return;
      }

      const student = await this.prisma.students.findUnique({
        where: { id: data.studentId },
        include: { quiz: true },
      });

      if (!student) {
        return client.emit(SOCKET.ERROR, {
          message: 'Student topilmadi, qayta tizimga kiring.',
        });
      }

      // socket_id va isActive holatini yangilaymiz
      await this.prisma.students.update({
        where: { id: student.id },
        data: {
          socketId: client.id,
          isActive: true,
        },
      });

      // studentni xonasiga qaytaramiz
      client.join(student.quiz.roomCode);

      console.log(
        `Student (${student.name}) reconnected with socket ${client.id}`,
      );

      // o‘sha xonadagi teacher va boshqa studentlarga xabar berish
      const students = await this.prisma.students.findMany({
        where: { quizId: student.quizId, isActive: true },
      });

      this.server
        .to(student.quiz.roomCode)
        .emit(SOCKET.STUDENT_LIST_UPDATE, { students });

      client.emit(SOCKET.RECONNECTED, {
        message: 'Siz qayta ulanishingiz muvaffaqiyatli amalga oshirildi!',
        student,
      });
    } catch (error) {
      console.log('Reconnect error:', error);
      client.emit(SOCKET.ERROR, { message: error.message });
    }
  }

  @SubscribeMessage(SOCKET.JOIN_ROOM)
  async joinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Join room handle', { joinRoomDto });

      const studentData = await this.gatewayService.joinRoom(
        joinRoomDto,
        client,
      );
      console.log({ studentData });

      // ✅ Har doim xonaga qo‘shish
      client.join(joinRoomDto.roomCode);
      console.log(
        `✅ ${joinRoomDto.type} joined room: ${joinRoomDto.roomCode}`,
      );

      // Teacher bo‘lsa, shunchaki tasdiqlovchi xabar yuborish kifoya
      if (joinRoomDto.type === 'teacher') {
        client.emit(SOCKET.JOINED_ROOM, {
          message: 'Teacher roomga qo‘shildi',
        });
        return;
      }

      // Student bo‘lsa, student listni yangilaymiz
      if (studentData) {
        const { student, students, teacher } = studentData;
        this.server
          .to(joinRoomDto.roomCode)
          .emit(SOCKET.STUDENT_LIST_UPDATE, { students, teacher });

        client.emit(SOCKET.JOINED_ROOM, {
          message: 'Xonaga muvaffaqiyatli qo‘shildingiz',
          student: student,
        });
      } else {
        client.emit(SOCKET.ERROR, {
          message: 'studentData mavjud emas',
        });
      }
    } catch (error) {
      console.log('socket error', error);
      client.emit(SOCKET.ERROR, {
        message: error.message || error,
      });
    }
  }

  // // 🧩 O'quvchilarni xonalarga qo‘shish
  // @SubscribeMessage(SOCKET.JOIN_ROOM)
  // async joinRoom(
  //   @MessageBody() joinRoomDto: JoinRoomDto,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   try {
  //     console.log('Join room handle', { joinRoomDto });

  //     const studentData = await this.gatewayService.joinRoom(
  //       joinRoomDto,
  //       client,
  //     );

  //     console.log({ studentData });

  //     if (!studentData) {
  //       client.emit(SOCKET.ERROR, { message: 'studentData mavjud emas' });
  //       return;
  //     }

  //     const { student, students, teacher } = studentData;

  //     // Client'ni xonaga qo‘shamiz
  //     client.join(joinRoomDto.roomCode);

  //     // Barcha foydalanuvchilarga yangilangan ro‘yxatni yuboramiz
  //     this.server
  //       .to(joinRoomDto.roomCode)
  //       .emit(SOCKET.STUDENT_LIST_UPDATE, { students, teacher });

  //     // 🟩 Student ID ni clientga yuboramiz (localStorage uchun)
  //     client.emit(SOCKET.JOINED_ROOM, {
  //       message: 'Xonaga muvaffaqiyatli qo‘shildingiz',
  //       student,
  //     });
  //   } catch (error) {
  //     console.log('socket error', error);
  //     client.emit(SOCKET.ERROR, {
  //       message: error.message ? error.message : error,
  //     });
  //   }
  // }

  // O‘qituvchi yoki tizim tomonidan quiz boshlanishi
  @SubscribeMessage(SOCKET.START_QUIZ)
  async startQuiz(@ConnectedSocket() client: Socket) {
    console.log('Start Quiz handle');
    try {
      const quiz = await this.gatewayService.startQuiz(client);

      if (!quiz) {
        console.log('quiz =>', { quiz });
        return;
      }

      this.server.to(quiz.roomCode).emit(SOCKET.QUIZ_LIST, { quiz });
    } catch (error) {
      console.log('socket error:', error);
      client.emit(SOCKET.ERROR, {
        message: error.message ? error.message : error,
      });
    }
  }

  // Foydalanuvchi savolga javob berishni boshlash
  @SubscribeMessage(SOCKET.ANSWER)
  async studentAnswer(
    @MessageBody() studentAnswerDto: StudentAnswerDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Answer handle', { studentAnswerDto });
      const studentAnswerData = await this.gatewayService.studentAnswer(
        studentAnswerDto,
        client,
      );

      if (!studentAnswerData) return;

      const { student, answer } = studentAnswerData;

      this.server
        .to(student.socketId)
        .emit(SOCKET.ANSWER_IS_CORRECT, { isCorrect: answer.isCorrect });
    } catch (error) {
      console.log('Socker error: ', error);
      client.emit(SOCKET.ERROR, {
        message: error.message ? error.message : error,
      });
    }
  }

  // Quizni yakunlash
  @SubscribeMessage(SOCKET.END_QUIZ)
  async endQuiz(
    @MessageBody() endQuizDto: EndQuizDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('End quiz handle', { endQuizDto });

    if (endQuizDto.teacherId) {
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
          message: `Eng yuqori natija topilmadi`,
        });
        return;
      }

      const student = await this.prisma.students.findUnique({
        where: { id: bestResult.studentId },
        include: { quiz: true },
      });

      if (!student) {
        client.emit(SOCKET.ERROR, {
          message: `Student topilmadi`,
        });
        return;
      }
      const message = this.botService.resultMessage(student, bestResult);

      const foundTeacher = await this.prisma.teachers.findUnique({
        where: { id: endQuizDto.teacherId },
      });

      if (!foundTeacher) {
        client.emit(SOCKET.ERROR, {
          message: `Teacher topilmadi`,
        });
        return;
      }

      if (!foundTeacher?.telegramId) {
        client.emit(SOCKET.ERROR, {
          message: `${foundTeacher?.name} iltioms natijalarni sizga yubora olishimiz uchun bot'ga start bosing`,
        });
        return;
      }

      if (!bestResult) {
        client.emit(SOCKET.ERROR, {
          message: `Eng yuqori natija to'plagan o'quvchi mavjud emas`,
        });
        return;
      }

      await this.botService.sendMessage(foundTeacher.telegramId, message);

      this.server.to(student.quiz.roomCode).emit(SOCKET.RESULT, { bestResult });
      return;
    }

    const endQuizData = await this.gatewayService.endQuiz(
      { studentId: endQuizDto.studentId! },
      client,
    );

    if (!endQuizData) return;

    const { studentResult, student, bestResult } = endQuizData;

    this.server
      .to(student.quiz.roomCode)
      .emit(SOCKET.RESULT, { studentResult, bestResult });
  }
}
