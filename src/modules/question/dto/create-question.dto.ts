import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: "Viktorina ID'si",
  })
  @IsInt()
  quizId: number;

  @ApiProperty({
    type: String,
    example: 'Node.js nima ?',
    description: 'Savol',
  })
  questionText: string;
}
