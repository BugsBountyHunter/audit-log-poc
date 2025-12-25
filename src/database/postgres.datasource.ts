import { DataSourceOptions } from 'typeorm';

export const postgresDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/audit_poc',
  synchronize: true,
  migrationsRun: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
});
