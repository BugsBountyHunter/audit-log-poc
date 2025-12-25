import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityMetadata,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditService } from '@modules/audit/audit.service';

@EventSubscriber()
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Object;
  }

  async afterInsert(event: InsertEvent<unknown>): Promise<void> {
    try {
      const entityName = event.metadata.name;
      const entityId = this.getEntityId(event.metadata, event.entity);
      console.log('🔔 Audit: INSERT', entityName, entityId);
      await this.auditService.recordCreate(
        entityName,
        entityId,
        event.entity,
      );
      console.log('✅ Audit log saved for', entityName);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('❌ Error recording audit:', errorMessage);
    }
  }

  async afterUpdate(event: UpdateEvent<unknown>): Promise<void> {
    try {
      const entityName = event.metadata.name;
      const entityId = this.getEntityId(
        event.metadata,
        event.entity ?? event.databaseEntity,
      );
      console.log('🔔 Audit: UPDATE', entityName, entityId);
      await this.auditService.recordUpdate(
        entityName,
        entityId,
        event.databaseEntity,
        event.entity,
      );
      console.log('✅ Audit log saved for', entityName);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('❌ Error recording audit:', errorMessage);
    }
  }

  async afterRemove(event: RemoveEvent<unknown>): Promise<void> {
    try {
      const entityName = event.metadata.name;
      const entityId = this.getEntityId(event.metadata, event.databaseEntity);
      console.log('🔔 Audit: REMOVE', entityName, entityId);
      await this.auditService.recordRemove(
        entityName,
        entityId,
        event.databaseEntity,
      );
      console.log('✅ Audit log saved for', entityName);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('❌ Error recording audit:', errorMessage);
    }
  }

  private getEntityId(
    metadata: EntityMetadata,
    entity?: unknown,
  ): string | undefined {
    if (!entity) {
      return undefined;
    }
    const idMap = metadata.getEntityIdMap(entity as Record<string, unknown>);
    if (!idMap) {
      return undefined;
    }
    return Object.values(idMap)
      .map((value) => `${value}`)
      .join(':');
  }
}
