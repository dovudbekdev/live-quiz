import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    type: 'string',
    example: 'teacher1234',
    description: 'Foydalanuvchining ayni damdagi paroli',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    type: 'string',
    example: 'new1234',
    description: 'Foydalanuvchining yangi paroli',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
