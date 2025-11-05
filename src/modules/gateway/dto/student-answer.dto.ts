import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class StudentAnswerDto {
  @IsInt()
  answerId: number;

  @IsInt()
  questionId: number;

  @IsString()
  @IsNotEmpty()
  roomCode: string;
}
