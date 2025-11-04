import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResponseData } from '@common/utils/index';
import { LoginDto } from './dto/login.dto';
import { TokenService } from '@common/services';
import { Teachers } from '../../../generated/prisma/client';
// import { RefreshTokenGuard } from '@common/guards';
// import { CurrentUser } from '@common/decorators';
import { AuthenticationRequest, IJwtPayload } from '@common/interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseData<Teachers>> {
    const { user, tokens } = await this.authService.register(registerDto);
    return new ResponseData<Teachers>({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli ro'yhatdan o'tdi",
      statusCode: HttpStatus.CREATED,
      data: user,
      tokens,
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseData<Teachers>> {
    const { user, tokens } = await this.authService.login(loginDto);

    // RefreshTokenni cookie
    // await this.tokenService.saveRefreshToken(response, tokens.refreshToken);

    // Redisga tokenni saqlash
    // await this.redisService.save(user.id, tokens.refreshToken);

    // const redisToken = await this.redisService.get(user.id);
    // console.log({ redisToken });

    // await this.redisService.deleteAll();

    // const redisToken1 = await this.redisService.get(user.id);
    // console.log({ redisToken1 });

    // Response qaytarish
    return new ResponseData<Teachers>({
      success: true,
      message: 'Foydalanuvchi tizimga muvaffaqiyatli kirdi',
      statusCode: HttpStatus.OK,
      data: user,
      tokens,
    });
  }

  // @Post('logout')
  // @UseGuards(RefreshTokenGuard)
  // async logout(
  //   @Res({ passthrough: true }) response: Response,
  //   @CurrentUser() currentUser: IJwtPayload,
  // ): Promise<ResponseData<User>> {
  //   await this.authService.logaut(currentUser);
  //   await this.tokenService.clearRefreshToken(response);

  //   return new ResponseData<User>({
  //     success: true,
  //     statusCode: HttpStatus.OK,
  //     message: 'Tizimdan muvaffaqiyatli chiqdingiz',
  //   });
  // }

  // @Post('refresh')
  // @UseGuards(RefreshTokenGuard)
  // async refreshTokens(
  //   @Req() request: AuthenticationRequest,
  //   @Res({ passthrough: true }) response: Response,
  //   @CurrentUser() currentUser: IJwtPayload,
  // ): Promise<ResponseData<User>> {
  //   const tokens = await this.authService.refreshToken(
  //     currentUser.userId,
  //     request.refreshToken,
  //   );

  //   // Refresh tokenni cookie'ga saqlash
  //   await this.tokenService.saveRefreshToken(response, tokens.refreshToken);

  //   return new ResponseData<User>({
  //     success: true,
  //     message: 'Yangi access va refresh token olindi',
  //     statusCode: HttpStatus.OK,
  //     tokens,
  //   });
  // }
}
