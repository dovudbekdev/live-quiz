import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Quiz turi',
    enum: QuizType,
    example: QuizType.INDIVIDUAL,
  })
  @IsEnum(QuizType)
  type: QuizType;

  @ApiPropertyOptional({
    type: String,
  })
  title?: string;
}
