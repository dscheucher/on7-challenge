import { fail, redirect } from '@sveltejs/kit';
import { notFound, requireRecruiter } from './context.ts';
import { requestApi } from './trpc/context.ts';
import { fieldErrors, jobInput } from '../validation.ts';
import type { RequestEvent } from '@sveltejs/kit';

export async function saveJob(event: RequestEvent, id?: string) {
	requireRecruiter(event.locals);
	const values = Object.fromEntries(await event.request.formData());
	const parsed = jobInput.safeParse(values);
	if (!parsed.success) return fail(400, { values, errors: fieldErrors(parsed.error) });
	try {
		if (id) await requestApi(event.locals).jobs.update({ id, data: parsed.data });
		else await requestApi(event.locals).jobs.create(parsed.data);
	} catch (cause) {
		notFound(cause);
	}
	redirect(303, '/recruiter/jobs?saved=1');
}
