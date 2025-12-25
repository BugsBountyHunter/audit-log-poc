import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from '@modules/audit/audit.service';
import { AuditLog } from '@common/types/audit-log.type';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getAllLogs(@Query('limit') limit?: string): Promise<AuditLog[]> {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.auditService.getAll(limitNum);
  }

  @Get('entity/:entity')
  async getLogsByEntity(
    @Param('entity') entity: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.auditService.getByEntity(entity, limitNum);
  }
}
