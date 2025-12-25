import { MongoClient, Db } from 'mongodb';
import { MONGO_CLIENT, MONGO_DB } from '@database/database.constants';
import { Provider } from '@nestjs/common';

const mongoUrl =
  process.env.MONGO_URL ?? 'mongodb://localhost:27017/audit_logs';

export const mongoProviders: Provider[] = [
  {
    provide: MONGO_CLIENT,
    useFactory: async (): Promise<MongoClient> => {
      const client = new MongoClient(mongoUrl);
      await client.connect();
      return client;
    },
  },
  {
    provide: MONGO_DB,
    useFactory: (client: MongoClient): Db => client.db(),
    inject: [MONGO_CLIENT],
  },
];
