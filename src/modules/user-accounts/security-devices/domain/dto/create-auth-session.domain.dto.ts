export class CreateAuthSessionDomainDto {
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
  refreshTokenId: string;
}
