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
  ) {}

  async handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected: ', client.id);
    const socketId = client.id; // ✅ to‘g‘risi shu

    await this.prisma.students.delete({
      where: { socketId }, // ✅ bu yerda ham to‘g‘ri
    });
    // socket_id bo‘yicha studentni topib o‘chirish yoki holatini yangilash mumkin
  }

  // O'quvchilarni xonalarga qo'shish
  @SubscribeMessage(SOCKET.JOIN_ROOM)
  async joinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log({ joinRoomDto });

      const studentData = await this.gatewayService.joinRoom(
        joinRoomDto,
        client,
      );
      if (!studentData) {
        return;
      }
      const { student, students } = studentData;

      // Client'ni xonaga qo'shamiz
      client.join(joinRoomDto.roomCode);

      // Barcha foydalanuvchilarga yangilangan ro'yxatni yuboramiz
      this.server
        .to(joinRoomDto.roomCode)
        .emit(SOCKET.STUDENT_LIST_UPDATE, { students });

      client.emit(SOCKET.JOINED_ROOM, {
        message: 'Xonaga muvaffaqiyatli qo‘shildingiz',
        student,
      });
    } catch (error) {
      console.log('socket error', error);
      client.emit(SOCKET.ERROR, {
        message: error.message ? error.message : error,
      });
    }
  }

  // 🔹 O‘qituvchi yoki tizim tomonidan quiz boshlanishi
  @SubscribeMessage(SOCKET.START_QUIZ)
  async startQuiz(@ConnectedSocket() client: Socket) {
    try {
      const quiz = await this.gatewayService.startQuiz(client);

      if (!quiz) return;

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
      const studentAnswerData = await this.gatewayService.studentAnswer(
        studentAnswerDto,
        client,
      );

      if (!studentAnswerData) return;

      const { student, answer } = studentAnswerData;

      this.server
        .to(student.quiz.roomCode)
        .emit(SOCKET.ANSWER_IS_CORRECT, { isCorrect: answer.isCorrect });
    } catch (error) {
      console.log('Socker error: ', error);
      client.emit(SOCKET.ERROR, {
        message: error.message ? error.message : error,
      });
    }
  }
}
