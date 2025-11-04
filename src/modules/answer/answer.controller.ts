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
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ResponseData } from '@common/utils';
import { Answers } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  async create(@Body() createAnswerDto: CreateAnswerDto) {
    const answer = await this.answerService.create(createAnswerDto);
    return new ResponseData<Answers>({
      success: true,
      message: 'Javob muvaffaqiyatli yaratildi',
      statusCode: HttpStatus.CREATED,
      data: answer,
    });
  }

  @Get()
  async findAll() {
    const answers = await this.answerService.findAll();
    return new ResponseData<Answers[]>({
      success: true,
      message: 'Javoblar',
      statusCode: HttpStatus.OK,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const answer = await this.answerService.findOne(id);
    return new ResponseData<Answers>({
      success: true,
      message: 'Javob',
      statusCode: HttpStatus.OK,
      data: answer,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    const updatedAnswer = await this.answerService.update(id, updateAnswerDto);
    return new ResponseData<Answers>({
      success: true,
      message: 'Javob muvaffaqiyatli yangilandi',
      statusCode: HttpStatus.OK,
      data: updatedAnswer,
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.answerService.remove(id);
    return new ResponseData<Answers>({
      success: true,
      message: "Javob muvaffaqiyatli o'chirildi",
      statusCode: HttpStatus.OK,
    });
  }
}
