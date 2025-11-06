import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 'ali',
    description: 'Foydalanuvchining ismi',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Tursunov',
    description: 'Foydalanuvchi familyasi',
  })
  @IsString()
  @IsOptional()
  surname?: string;

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
