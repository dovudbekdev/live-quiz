import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CurrentUser } from '@common/decorators';
import { IJwtPayload } from '@common/interfaces';
import { ResponseData } from '@common/utils';
import { Quizzes } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards';
import { PrismaService } from '@modules/prisma/prisma.service';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly prismaService: PrismaService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const quiz = await this.quizService.create({
      ...createQuizDto,
      teacherId: currentUser.userId,
    });
    return new ResponseData<Quizzes>({
      success: true,
      message: 'Viktorina muvaffaqiyatli yaratildi',
      statusCode: HttpStatus.CREATED,
      data: quiz,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@CurrentUser('userId', ParseIntPipe) userId: number) {
    const quizzes = await this.quizService.findAll(+userId);
    return new ResponseData<Quizzes[]>({
      success: true,
      message: "Viktorina ma'lumotlari",
      statusCode: HttpStatus.OK,
      data: quizzes,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId', ParseIntPipe) userId: number,
  ) {
    const quiz = await this.quizService.findOne(id);

    if (quiz.teacherId !== userId) {
      throw new ForbiddenException(
        "Sizda bu viktorina ma'lumotlarini ko'rishga ruxsat yo'q",
      );
    }
    return new ResponseData<Quizzes>({
      success: true,
      message: "Viktorina ma'lumoti",
      statusCode: HttpStatus.OK,
      data: quiz,
    });
  }

  @Get(':roomCode')
  async findOneQuizByRoomCode(@Param('roomCode') roomCode: string) {
    const quiz = await this.quizService.findOneQuizByRoomCode(roomCode);
    return new ResponseData<Quizzes>({
      success: true,
      message: "Quiz ma'lumotlari",
      statusCode: HttpStatus.OK,
      data: quiz,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('activate/:id')
  async activateQuiz(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId', ParseIntPipe) userId: number,
  ) {
    await this.quizService.activateQuiz(id, userId);
    return new ResponseData<null>({
      success: true,
      message: 'Viktorina (quiz) activlashtirildi',
      statusCode: HttpStatus.OK,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId', ParseIntPipe) userId: number,
  ) {
    const foundQuiz = await this.quizService.findOne(id);

    if (foundQuiz.teacherId !== userId) {
      throw new ForbiddenException(
        "Sizda bu viktorinani o'chirishga ruxsat yo'q",
      );
    }

    await this.quizService.remove(id);
    return new ResponseData<null>({
      success: true,
      message: "Viktorina muvaffaqiyatli o'chirildi",
      statusCode: HttpStatus.OK,
    });
  }
}
