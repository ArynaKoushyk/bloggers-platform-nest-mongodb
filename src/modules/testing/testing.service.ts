import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { DomainExceptionCode } from '../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../core/exceptions/domain.exception';

@Injectable()
export class TestingService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async deleteAllData(): Promise<void> {
    const database = this.connection.db;

    if (!database) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        errorsMessages: [
          { field: null, message: 'Database connection is not initialized' },
        ],
      });
    }

    const collections = await database.collections();

    await Promise.all(
      collections
        .filter(({ collectionName }) => !collectionName.startsWith('system.'))
        .map((collection) => collection.deleteMany({})),
    );
  }
}
