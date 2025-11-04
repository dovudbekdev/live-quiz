import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: "Savol Id'si",
  })
  @IsInt()
  questionId: number;
  answerText: string;
  isCorrect: boolean;
}
