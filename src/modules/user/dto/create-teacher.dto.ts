import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsOptional()
  telegramId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
