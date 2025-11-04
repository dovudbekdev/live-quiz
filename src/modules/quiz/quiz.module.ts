import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { TokenService } from '@common/services';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController],
  providers: [QuizService, TokenService],
  exports: [QuizService],
})
export class QuizModule {}
