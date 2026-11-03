import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

export function createDatabase(url: string) {
	const pool = new pg.Pool({ connectionString: url, max: 10 });
	return { db: drizzle(pool, { schema }), pool };
}
export type Database = ReturnType<typeof createDatabase>['db'];
const connection = createDatabase(
	process.env.DATABASE_URL ?? 'postgres://jobboard:local-development-only@localhost:55434/jobboard'
);
export const db = connection.db;
export const pool = connection.pool;
