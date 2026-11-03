import { requestApi } from '#lib/server/trpc/context.ts';
export const load = async ({ locals }: import('./$types').PageServerLoadEvent) => ({
	jobs: await requestApi(locals).jobs.listPublic()
});
