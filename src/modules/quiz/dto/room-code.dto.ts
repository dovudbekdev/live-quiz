import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RoomCodeDto {
  @ApiProperty({
    type: 'string',
    example: '1234',
    description: '4 xonali kod',
  })
  @IsString()
  @IsNotEmpty()
  roomCode: string;
}
