import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { CurrentUserContext } from '@modules/audit/audit.service';

@Injectable()
export class ClsAuthMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(_req: Request, _res: Response, next: NextFunction): void {
    // Mock user context for testing
    const userContext: CurrentUserContext = {
      id: 'user-123',
      roles: ['admin', 'user'],
      email: 'test@example.com',
    };

    this.cls.set('user', userContext);
    next();
  }
}
