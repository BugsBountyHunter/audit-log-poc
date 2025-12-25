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
    const entityName = event.metadata.name;
    const entityId = this.getEntityId(event.metadata, event.entity);
    await this.auditService.recordCreate(entityName, entityId, event.entity);
  }

  async afterUpdate(event: UpdateEvent<unknown>): Promise<void> {
    const entityName = event.metadata.name;
    const entityId = this.getEntityId(
      event.metadata,
      event.entity ?? event.databaseEntity,
    );
    await this.auditService.recordUpdate(
      entityName,
      entityId,
      event.databaseEntity,
      event.entity,
    );
  }

  async afterRemove(event: RemoveEvent<unknown>): Promise<void> {
    const entityName = event.metadata.name;
    const entityId = this.getEntityId(event.metadata, event.databaseEntity);
    await this.auditService.recordRemove(
      entityName,
      entityId,
      event.databaseEntity,
    );
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
