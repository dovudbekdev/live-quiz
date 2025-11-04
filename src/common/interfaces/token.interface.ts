export interface IJwtPayload {
  userId: number;
}

export interface ITokneConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
}
