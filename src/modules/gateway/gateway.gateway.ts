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
import { Results } from '@prisma/client';

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

    console.log('disconnect foundUser', foundStudent);
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

      // ✅ Har doim xonaga qo‘shish
      client.join(joinRoomDto.roomCode);

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

        console.log('student updatel list =>', students);
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

    // 🧠 Agar bu teacher tomonidan yuborilgan bo‘lsa:
    if (endQuizDto.teacherId) {
      let bestResult: null | Results = null;
      let attempts = 0;
      const maxAttempts = 5;

      // 🧠 Studentlar sonini aniqlaymiz
      const totalStudents = await this.prisma.students.count({
        where: { quizId: endQuizDto.quizId, isActive: true },
      });

      while (!bestResult && attempts < maxAttempts) {
        // 🔹 Hozircha natija yozgan studentlar
        const results = await this.prisma.results.findMany({
          where: { quizId: endQuizDto.quizId, deleted: false },
          include: { student: true },
          orderBy: [{ score: 'desc' }, { finishedAt: 'asc' }],
        });

        const finishedCount = results.length - 1;
        console.log(`📊 ${finishedCount}/${totalStudents} student yakunladi`);

        // 🔹 Agar hali hamma tugatmagan bo‘lsa — kutamiz
        if (finishedCount < totalStudents) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 3000));
          continue;
        }

        // 🔹 Hamma tugatgan bo‘lsa — bestResultni olamiz
        bestResult = results[0];
      }

      if (!bestResult) {
        client.emit(SOCKET.ERROR, {
          message: 'Hamma talaba testni yakunlamadi, iltimos kuting.',
        });
        return;
      }

      console.log({ bestResult });
      // 🔽 Shu yerda sizdagi mavjud natijani yuborish qismi davom etadi
    }

    // 🟩 Student END_QUIZ qismi sizdagi kabi qoladi
    if (endQuizDto.studentId) {
      const endQuizData = await this.gatewayService.endQuiz(
        { studentId: endQuizDto.studentId!, quizId: endQuizDto.quizId },
        client,
      );

      if (!endQuizData) {
        client.emit(SOCKET.ERROR, { message: `Quiz data topilmadi` });
        return;
      }

      const { studentResult, student, bestResult } = endQuizData;

      console.log('EndQuiz tugadi');

      this.server
        .to(student.quiz.roomCode)
        .emit(SOCKET.RESULT, { studentResult, bestResult });
    }
  }
}
