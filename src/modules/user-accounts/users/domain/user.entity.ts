import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Model } from 'mongoose';
import type { CreateUserDomainDto } from './dto/create-user.domain.dto';

import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './schemas/password-recovery.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './schemas/email-confirmation.schema';
import type { CreateUnconfirmedUserDomainDto } from './dto/create-unconfirmed-user.domain.dto';
import { ConfirmEmailError } from './enums/confirm-email-error.enum';
import { ResetPasswordError } from './enums/reset-password-error.enum';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true })
  email: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: PasswordRecoverySchema,
    required: true,
  })
  passwordRecovery: PasswordRecovery;

  @Prop({
    type: EmailConfirmationSchema,
    required: true,
  })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createConfirmed(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.emailConfirmation = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
    };
    user.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user as UserDocument;
  }

  static createUnconfirmed(dto: CreateUnconfirmedUserDomainDto): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.emailConfirmation = {
      confirmationCode: dto.confirmationCode,
      expirationDate: dto.confirmationCodeExpirationDate,
      isConfirmed: false,
    };
    user.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user as UserDocument;
  }

  markAsDeleted(): void {
    this.deletedAt = new Date();
  }

  confirmEmail(code: string, currentDate: Date): ConfirmEmailError | null {
    if (this.emailConfirmation.isConfirmed) {
      return ConfirmEmailError.AlreadyConfirmed;
    }

    if (this.emailConfirmation.confirmationCode !== code) {
      return ConfirmEmailError.InvalidCode;
    }

    const expirationDate = this.emailConfirmation.expirationDate;

    if (!expirationDate || expirationDate <= currentDate) {
      return ConfirmEmailError.ExpiredCode;
    }

    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.confirmationCode = null;
    this.emailConfirmation.expirationDate = null;

    return null;
  }

  setConfirmationCode(code: string, expirationDate: Date): boolean {
    if (this.emailConfirmation.isConfirmed) {
      return false;
    }
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = expirationDate;
    return true;
  }

  setRecoveryCode(recoveryCode: string, expirationDate: Date): void {
    this.passwordRecovery.recoveryCode = recoveryCode;
    this.passwordRecovery.expirationDate = expirationDate;
  }

  resetPassword(
    recoveryCode: string,
    passwordHash: string,
    currentDate: Date,
  ): ResetPasswordError | null {
    if (this.passwordRecovery.recoveryCode !== recoveryCode) {
      return ResetPasswordError.InvalidRecoveryCode;
    }

    const expirationDate = this.passwordRecovery.expirationDate;

    if (!expirationDate || expirationDate <= currentDate) {
      return ResetPasswordError.ExpiredRecoveryCode;
    }

    this.passwordHash = passwordHash;
    this.passwordRecovery.recoveryCode = null;
    this.passwordRecovery.expirationDate = null;

    return null;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { login: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deletedAt: null,
    },
  },
);

UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deletedAt: null,
    },
  },
);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User> & {
  readonly id: string;
};
export type UserModelType = Model<User, {}, {}, {}, UserDocument> & typeof User;
