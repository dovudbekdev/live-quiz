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
  ForbiddenException,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionWithOptionsDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ResponseData } from '@common/utils';
import { Answers, Questions } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards';
import { CurrentUser } from '@common/decorators';
import { QuizService } from '@modules/quiz/quiz.service';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('question')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly quizService: QuizService,
  ) {}

  // @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionWithOptionsDto,
    @CurrentUser('userId', ParseIntPipe) teacherId: number,
  ) {
    const quiz = await this.quizService.findOne(createQuestionDto.quizId);

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException(
        "Sizda bu viktorina uchun savol biriktirishga huquq yo'q",
      );
    }

    await this.questionService.createQuestionWithOptions(createQuestionDto);

    return new ResponseData<null>({
      success: true,
      message: 'Savol muvaffaqiyatli yaratildi',
      statusCode: HttpStatus.CREATED,
      data: null,
    });
  }

  @Get()
  async findAll() {
    const questions = await this.questionService.findAll();
    return new ResponseData<Questions[]>({
      success: true,
      message: 'Savol',
      statusCode: HttpStatus.OK,
      data: questions,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const question = await this.questionService.findOne(id);
    return new ResponseData<Questions>({
      success: true,
      message: 'Savollar',
      statusCode: HttpStatus.OK,
      data: question,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser('userId', ParseIntPipe) teacherId: number,
  ) {
    if (updateQuestionDto.quizId) {
      const quiz = await this.quizService.findOne(updateQuestionDto.quizId);

      if (quiz.teacherId !== teacherId) {
        throw new ForbiddenException(
          "Sizda bu viktorina savollarining ma'lumotlarini tahrirlash uchun huquq yo'q",
        );
      }
    }

    const updatedQuestion = await this.questionService.update(
      id,
      updateQuestionDto,
    );

    return new ResponseData<Questions>({
      success: true,
      message: "Savol ma'lumotlari muvaffaqiyatli yangilandi",
      statusCode: HttpStatus.OK,
      data: updatedQuestion,
    });
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId', ParseIntPipe) teacherId: number,
  ) {
    const existingQuestion = await this.questionService.findOne(id);

    const quiz = await this.quizService.findOne(existingQuestion.quizId);

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException(
        "Sizda bu viktorina savolini o'chirish uchun huquq yo'q",
      );
    }

    await this.questionService.remove(id);
    return new ResponseData<Questions>({
      success: true,
      message: "Savol muvaffaqiyatli o'chirib yuborildi",
      statusCode: HttpStatus.OK,
    });
  }
}
