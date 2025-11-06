import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ type: 'string', description: "URL'dan ajratib olingan token" })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    type: 'string',
    example: 'newPassword',
    description: 'Foydalanuvchining yangi paroli',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
