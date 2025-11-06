import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Quiz turi',
    enum: QuizType,
    example: QuizType.INDIVIDUAL,
  })
  @IsEnum(QuizType)
  type: QuizType;

  @ApiProperty({
    type: 'integer',
    example: 600,
    description: 'Quiz davom etish vaqti (secondlarda)',
  })
  @IsInt()
  duration: number;

  @ApiPropertyOptional({
    type: String,
  })
  title?: string;
}
