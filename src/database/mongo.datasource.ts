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
      console.log('✅ MongoDB connected:', mongoUrl);
      return client;
    },
  },
  {
    provide: MONGO_DB,
    useFactory: (client: MongoClient): Db => {
      const db = client.db('audit_logs');
      console.log('📊 Using MongoDB database: audit_logs');
      return db;
    },
    inject: [MONGO_CLIENT],
  },
];
