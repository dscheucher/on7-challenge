import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from './server/trpc/router.ts';
export const createApiClient = (baseUrl = '') =>
	createTRPCClient<AppRouter>({
		links: [httpBatchLink({ url: `${baseUrl}/api/trpc`, transformer: superjson })]
	});
