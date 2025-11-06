import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayGateway } from './gateway.gateway';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { QuizService } from '@modules/quiz/quiz.service';
import { ResultService } from '@modules/result/result.service';
import { BotService } from '@modules/bot/bot.service';

@Module({
  imports: [PrismaModule],
  providers: [
    GatewayGateway,
    GatewayService,
    QuizService,
    ResultService,
    BotService,
  ],
})
export class GatewayModule {}
