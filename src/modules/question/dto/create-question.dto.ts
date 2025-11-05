import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OptionDto {
  @ApiProperty({ example: 'Dasturlash tili', description: 'Variant matni' })
  @IsString()
  @IsNotEmpty()
  answerText: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isCorrect: boolean;
}

export class QuestionDto {
  @ApiProperty({
    type: String,
    example: 'Node.js nima ?',
    description: 'Savol',
  })
  questionText: string;

  @ApiProperty({
    type: [OptionDto],
    description: 'Savol variantlari (options)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}

export class CreateQuestionWithOptionsDto {
  @ApiProperty({
    type: 'string',
    example: "Node.js bo'yicha savollar",
    description: 'Quiz title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: 'integer',
    example: 1,
    description: "Viktorina ID'si",
  })
  @IsInt()
  quizId: number;

  @ApiProperty({
    type: [QuestionDto],
    description: 'Variant savollari (questions)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
