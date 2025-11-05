import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { Socket } from 'socket.io';
import { Students } from '@prisma/client';
import { SOCKET } from '@common/enums';

@Injectable()
export class GatewayService {
  constructor(private readonly prisma: PrismaService) {}

  async joinRoom(
    joinRoomDto: JoinRoomDto,
    client: Socket,
  ): Promise<{ student: Students; students: { name: string }[] } | undefined> {
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
      select: { name: true },
    });

    return { student, students };
  }
}
