import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '#lib/server/trpc/router.ts';
import { createContext } from '#lib/server/trpc/context.ts';
import type { RequestHandler } from './$types';
const handler: RequestHandler = ({ request, locals }) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req: request,
		router: appRouter,
		createContext: () => createContext(locals)
	});
export { handler as GET, handler as POST };
