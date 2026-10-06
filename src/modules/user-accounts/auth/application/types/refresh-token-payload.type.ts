export type RefreshTokenPayload = {
  sub: string;
  deviceId: string;
  jti: string;
  iat: number;
  exp: number;
};
