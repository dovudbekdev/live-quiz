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

export class CreateOptionDto {
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

  @ApiProperty({
    type: [CreateOptionDto],
    description: 'Savol variantlari (options)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}
