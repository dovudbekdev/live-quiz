import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PasswordService, TokenService } from '@common/services';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, PasswordService, TokenService],
})
export class UserModule {}
