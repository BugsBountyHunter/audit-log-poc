export type AuditAction = 'create' | 'update' | 'remove';

export interface AuditLog {
  action: AuditAction;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
