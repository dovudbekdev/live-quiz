import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { QuestionModule } from '@modules/question/question.module';
import { TokenService } from '@common/services';

@Module({
  imports: [PrismaModule, QuestionModule],
  controllers: [AnswerController],
  providers: [AnswerService, TokenService],
})
export class AnswerModule {}
