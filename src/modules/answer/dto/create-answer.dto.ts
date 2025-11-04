import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: "Savol Id'si",
  })
  @IsInt()
  questionId: number;

  @ApiProperty({
    type: String,
    example: 'Dasturlash tili',
    description: 'Savol',
  })
  @IsString()
  answerText: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    default: false,
    description: "true yoki fals, true bo'lsa bu javob to'g'ri bo'ladi",
  })
  isCorrect: boolean;
}
