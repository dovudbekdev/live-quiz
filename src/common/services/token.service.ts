import { JwtService } from '@nestjs/jwt';
import { Tokens, TokenType } from '@common/types';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { IJwtPayload, ITokneConfig } from '@common/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  tokenConfig: ITokneConfig;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: IJwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      // Access token yaratish
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'jwt.accessTokenSecret',
          'secret',
        ),
        expiresIn: this.configService.get('jwt.accessTokenExpiresIn', '30s'),
      }),

      // Refresh token yaratish
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'jwt.refreshTokenSecret',
          'secretPro',
        ),
        expiresIn: this.configService.get('jwt.refreshTokenExpiresIn', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string, type: TokenType): Promise<IJwtPayload> {
    const secret =
      type === 'access'
        ? this.configService.get<string>('jwt.accessTokenSecret')
        : this.configService.get<string>('jwt.refreshTokenSecret', 'secretPro');

    return this.jwtService.verifyAsync(token, { secret });
  }

  // async saveRefreshToken(response: Response, token: string) {
  //   // Tokenni cookie'ga saqlash
  //   response.cookie(this.cookieConfig.cookieRefreshToken, token, {
  //     httpOnly: true,
  //     secure: this.cookieConfig.cookieSecure === 'true',
  //     maxAge: this.cookieConfig.maxAge * 24 * 60 * 60 * 1000,
  //   });
  // }

  // async clearRefreshToken(response: Response) {
  //   response.clearCookie(this.cookieConfig.cookieRefreshToken, {
  //     httpOnly: true,
  //     secure: this.cookieConfig.cookieSecure === 'true',
  //   });
  // }
}
