import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({
    type: 'number',
    example: 1,
    description: "Testni yechgan student ID'si",
  })
  @IsInt()
  @IsNotEmpty()
  studentId: number;
}
