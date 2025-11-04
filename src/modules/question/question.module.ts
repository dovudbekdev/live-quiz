import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { TokenService } from '@common/services';

@Module({
  imports: [PrismaModule, QuizModule],
  controllers: [QuestionController],
  providers: [QuestionService, TokenService],
  exports: [QuestionService],
})
export class QuestionModule {}
