import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordService } from '@common/services';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  findAll() {
    return this.prisma.students.findMany();
  }

  async profile(id: number) {
    const user = await this.prisma.teachers.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("Bunday ID'li teacher mavjud emas");
    }

    return user;
  }

  async findOne(id: number) {
    const student = await this.prisma.students.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundException("Bunday ID'li student mavjud emas");
    }
    return student;
  }

  findOneTeacherWithPhoneNumber(phoneNumber: string) {
    return this.prisma.teachers.findUnique({
      where: { phoneNumber },
    });
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const existingUser = await this.profile(id);

    const isMatch = await this.passwordService.compare(
      dto.currentPassword,
      existingUser.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Parol xato');
    }

    const hashPassword = await this.passwordService.hash(dto.newPassword);

    await this.prisma.teachers.update({
      where: { id },
      data: { password: hashPassword },
    });

    return true;
  }

  async updateTeacher(id: number, updateTeacherDto: UpdateTeacherDto) {
    await this.profile(id);

    return await this.prisma.teachers.update({
      where: { id },
      data: updateTeacherDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.students.delete({ where: { id } });
    return true;
  }
}
