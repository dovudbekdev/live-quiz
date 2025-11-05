import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.students.findMany();
  }

  async findOne(id: number) {
    const student = await this.prisma.students.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundException("Bunday ID'li student mavjud emas");
    }
    return student;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.students.delete({ where: { id } });
    return true;
  }
}
