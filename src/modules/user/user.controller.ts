import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseData } from '@common/utils';
import { Students, Teachers } from '@prisma/client';
import { AuthGuard } from '@common/guards';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser('userId', ParseIntPipe) userId: number) {
    const userProfile = await this.userService.profile(userId);
    return new ResponseData<Teachers>({
      success: true,
      message: "Foydalanuvchining profile ma'lumotlari",
      statusCode: HttpStatus.OK,
      data: userProfile,
    });
  }

  @Get()
  async findAll() {
    const students = await this.userService.findAll();
    return new ResponseData<Students[]>({
      success: true,
      message: "Studentlar ma'lumotlari",
      statusCode: HttpStatus.OK,
      data: students,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const student = await this.userService.findOne(+id);
    return new ResponseData<Students>({
      success: true,
      message: "Student ma'lumoti",
      statusCode: HttpStatus.OK,
      data: student,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser('userId', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(id, dto);
    return new ResponseData<null>({
      success: true,
      message: 'Parol muvaffaqiyatli yangilandi',
      statusCode: HttpStatus.OK,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('delete')
  async deleteAccount(@CurrentUser('userId', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return new ResponseData<null>({
      success: true,
      message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli o'chirildi",
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return new ResponseData<null>({
      success: true,
      message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli o'chirildi",
      statusCode: HttpStatus.OK,
    });
  }
}
