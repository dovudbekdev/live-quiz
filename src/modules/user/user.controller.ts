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
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseData } from '@common/utils';
import { Students } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(+id);
    return new ResponseData<null>({
      success: true,
      message: "Student ma'lumoti muvaffaqiyatli o'chirildi",
      statusCode: HttpStatus.OK,
    });
  }
}
