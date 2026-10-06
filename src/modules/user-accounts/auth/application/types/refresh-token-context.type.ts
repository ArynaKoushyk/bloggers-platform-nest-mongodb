export type RefreshTokenContext = {
  userId: string;
  deviceId: string;
  refreshTokenId: string;
  issuedAt: Date;
  expirationDate: Date;
};
