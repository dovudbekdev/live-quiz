import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from '@common/types';
import { PasswordService } from '@common/services';
import { LoginDto } from './dto/login.dto';
import { TokenService } from '@common/services/index';
import { IJwtPayload } from '@common/interfaces';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Teachers } from '@prisma/client';
import { ForgotPasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  /* ========== 🆕 Register operation ========== */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: Teachers; tokens: Tokens }> {
    const existingUser = await this.prismaService.teachers.findUnique({
      where: { phoneNumber: registerDto.phoneNumber },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Bunday telefon raqamdagi foydalanuvchi allaqchon manjud',
      );
    }

    // Parolni hashlash
    const hashPassword = await this.passwordService.hash(registerDto.password);

    // User yaratish
    const user = await this.prismaService.teachers.create({
      data: { ...registerDto, password: hashPassword },
    });

    // Token yaratish
    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
    });

    return { user, tokens };
  }

  /* ========== 📖 Login operation ========== */
  async login(loginDto: LoginDto): Promise<{ user: Teachers; tokens: Tokens }> {
    const foundUser = await this.prismaService.teachers.findUnique({
      where: { phoneNumber: loginDto.phoneNumber },
    });

    if (!foundUser) {
      throw new UnauthorizedException('username yoki password xato');
    }

    // Parolni tekshirish
    const isMatch = await this.passwordService.compare(
      loginDto.password,
      foundUser.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('username yoki password xato');
    }

    const tokens = await this.tokenService.generateTokens({
      userId: foundUser.id,
    });

    // Database'ga refreshTokenni saqlash
    // const userTokenEntity = this.userTokenRepository.create({
    //   userId: foundUser.id,
    //   refreshToken: tokens.refreshToken,
    // });
    // await this.userTokenRepository.save(userTokenEntity);

    return { user: foundUser, tokens };
  }

  /* ========== Forgot password ========== */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const existingTeacher = await this.prismaService.teachers.findUnique({
      where: { phoneNumber: forgotPasswordDto.phoneNumber },
    });

    if (!existingTeacher) {
      throw new NotFoundException("Bunday telefon raqam ro'yxatdan o'tmagan");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;
  }

  /* ========== ♻️ Reset password ========== */

  /* ==========  Logaut operation ========== */
  // async logaut(currentUser: IJwtPayload): Promise<void> {
  //   const userToken = await this.userTokenRepository.findOneBy({
  //     userId: currentUser.userId,
  //     isValid: true,
  //   });

  //   if (!userToken) {
  //     throw new NotFoundException(
  //       'Foydalanuvchi uchun refresh token topilmadi',
  //     );
  //   }

  //   // Tokenni to'liq o'chirib tashlash
  //   await this.userTokenRepository.remove(userToken);
  // }

  /* ========== ♻️ Refresh token operation ========== */
  // async refreshToken(userId: number, oldToken: string): Promise<Tokens> {
  //   const user = await this.userService.findOne(userId);
  //   const userToken = await this.userTokenRepository.findOneBy({
  //     refreshToken: oldToken,
  //   });

  //   if (!userToken) {
  //     throw new UnauthorizedException('Refresh token yaroqsiz yoki eskirgan');
  //   }

  //   // Yangi access va refresh token yaratish
  //   const payload: IJwtPayload = { userId: user.id, role: user.role };
  //   const { accessToken, refreshToken } =
  //     await this.tokenService.generateTokens(payload);

  //   // Aski tokeni yangilash
  //   userToken.refreshToken = refreshToken;
  //   userToken.isValid = true;

  //   await this.userTokenRepository.save(userToken);

  //   return { accessToken, refreshToken };
  // }
}
