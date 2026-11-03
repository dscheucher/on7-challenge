import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from './db/index.ts';
import * as schema from './db/auth-schema.ts';

function createAuth() {
	if (!process.env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is required.');
	return betterAuth({
		appName: 'Jobboard',
		baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4173',
		secret: process.env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'pg', schema }),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			autoSignIn: true,
			minPasswordLength: 8,
			maxPasswordLength: 128
		},
		plugins: [sveltekitCookies(getRequestEvent)]
	});
}
let instance: ReturnType<typeof createAuth> | undefined;
export const getAuth = () => (instance ??= createAuth());
