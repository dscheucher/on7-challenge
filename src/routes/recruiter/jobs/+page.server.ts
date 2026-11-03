import { requireRecruiter } from '#lib/server/context.ts';
import { requestApi } from '#lib/server/trpc/context.ts';
export const load = async ({ locals }: import('./$types').PageServerLoadEvent) => {
	requireRecruiter(locals);
	return { jobs: await requestApi(locals).jobs.listOwn() };
};
