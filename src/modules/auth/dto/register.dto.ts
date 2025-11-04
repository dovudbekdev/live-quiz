import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ali', description: 'Foydalanuvchining ismi' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Tursunov',
    description: 'Foydalanuvchi familyasi',
  })
  @IsString()
  surname: string;

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
