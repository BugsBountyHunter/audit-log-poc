import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGO_DB } from '@database/database.constants';
import { AuditLog } from '@common/types/audit-log.type';

@Injectable()
export class AuditLogRepository {
  constructor(@Inject(MONGO_DB) private readonly db: Db) {}

  async insert(log: AuditLog): Promise<void> {
    const collection = this.db.collection<AuditLog>('audit_logs');
    await collection.insertOne(log);
  }

  async findAll(limit = 100): Promise<AuditLog[]> {
    return this.db
      .collection<AuditLog>('audit_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async findByEntity(entity: string, limit = 100): Promise<AuditLog[]> {
    return this.db
      .collection<AuditLog>('audit_logs')
      .find({ entity })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}
