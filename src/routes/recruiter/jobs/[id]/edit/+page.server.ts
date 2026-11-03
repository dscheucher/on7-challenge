import { notFound, requireRecruiter } from '#lib/server/context.ts';
import { requestApi } from '#lib/server/trpc/context.ts';
import { saveJob } from '#lib/server/job-action.ts';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals, params }) => {
	requireRecruiter(locals);
	try {
		return { job: await requestApi(locals).jobs.getOwn({ id: params.id }) };
	} catch (cause) {
		notFound(cause);
	}
};
export const actions: Actions = { default: (event) => saveJob(event, event.params.id) };
