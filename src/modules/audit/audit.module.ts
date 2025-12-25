import { Global, Module } from '@nestjs/common';
import { AuditService } from '@modules/audit/audit.service';
import { AuditSubscriber } from '@domain/subscribers/audit.subscriber';
import { AuditController } from '@modules/audit/audit.controller';

@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditSubscriber],
  exports: [AuditService, AuditSubscriber],
})
export class AuditModule {}
