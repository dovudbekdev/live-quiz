import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '+998906931454',
    description: 'Foydalanuvchining telefon raqami',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'techer1234',
    description: 'Foydalanuvchining paroli',
  })
  @IsString()
  password: string;
}
