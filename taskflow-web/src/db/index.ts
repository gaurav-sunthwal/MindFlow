import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Use global singleton to prevent connection leaks in development
const globalForDb = global as unknown as {
  client: postgres.Sql | undefined;
};

export const client = globalForDb.client ?? postgres(connectionString, { 
  prepare: false,
  max: process.env.NODE_ENV === 'development' ? 1 : undefined,
});

if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });
