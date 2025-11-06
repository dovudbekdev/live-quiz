import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    type: 'string',
    example: '+998906931454',
    description:
      'Parolni yangilash uchun shu telefon raqam egasiga token yuboriladi',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
