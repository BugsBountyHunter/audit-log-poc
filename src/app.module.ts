import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClsModule, ClsMiddleware } from 'nestjs-cls';
import { DomainModule } from '@domain/domain.module';
import { AuditModule } from '@modules/audit/audit.module';
import { TodoModule } from '@modules/todo/todo.module';
import { ClsAuthMiddleware } from '@common/middleware/cls-auth.middleware';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';

@Module({
  imports: [
    ClsModule.forRoot({ global: true }),
    DomainModule,
    AuditModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ClsMiddleware, ClsAuthMiddleware).forRoutes('*');
  }
}
