import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mongoProviders } from '@database/mongo.datasource';
import { postgresDataSourceOptions } from '@database/postgres.datasource';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...postgresDataSourceOptions(),
      }),
    }),
  ],
  providers: [...mongoProviders],
  exports: [TypeOrmModule, ...mongoProviders],
})
export class DatabaseModule {}
