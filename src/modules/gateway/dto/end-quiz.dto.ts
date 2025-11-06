import { IsInt } from 'class-validator';

export class EndQuizDto {
  @IsInt()
  studentId: number;

  @IsInt()
  teacherId: number;
}
