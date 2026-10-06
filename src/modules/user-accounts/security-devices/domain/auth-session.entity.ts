import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateAuthSessionDomainDto } from './dto/create-auth-session.domain.dto';
import { UpdateAuthSessionDomainDto } from './dto/update-auth-session.domain.dto';
import { RotateRefreshTokenError } from './enums/rotate-refresh-token-error.enum';

@Schema({ timestamps: true, collection: 'authSessions' })
export class AuthSession {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: String, required: true })
  refreshTokenId: string;

  static createInstance(dto: CreateAuthSessionDomainDto): AuthSessionDocument {
    const session = new this();

    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.title = dto.title;
    session.ip = dto.ip;
    session.expirationDate = dto.expirationDate;
    session.lastActiveDate = dto.lastActiveDate;
    session.refreshTokenId = dto.refreshTokenId;
    return session as AuthSessionDocument;
  }

  rotateRefreshToken(
    currentRefreshTokenId: string,
    currentDate: Date,
    dto: UpdateAuthSessionDomainDto,
  ): RotateRefreshTokenError | null {
    if (this.refreshTokenId !== currentRefreshTokenId) {
      return RotateRefreshTokenError.RefreshTokenIdMismatch;
    }
    if (this.expirationDate <= currentDate) {
      return RotateRefreshTokenError.SessionExpired;
    }

    this.refreshTokenId = dto.refreshTokenId;
    this.expirationDate = dto.expirationDate;
    this.lastActiveDate = dto.lastActiveDate;

    return null;
  }
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
AuthSessionSchema.loadClass(AuthSession);

export type AuthSessionDocument = HydratedDocument<AuthSession>;
export type AuthSessionModelType = Model<AuthSession> & typeof AuthSession;
