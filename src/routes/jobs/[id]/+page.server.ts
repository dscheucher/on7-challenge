import { fail } from '@sveltejs/kit';
import { notFound } from '#lib/server/context.ts';
import { requestApi } from '#lib/server/trpc/context.ts';
import { TRPCError } from '@trpc/server';
import { applicationInput, fieldErrors } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		return { job: await requestApi(locals).jobs.getPublic({ id: params.id }) };
	} catch (cause) {
		notFound(cause);
	}
};
export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const values = Object.fromEntries(await request.formData());
		const result = applicationInput.safeParse(values);
		if (!result.success) return fail(400, { values, errors: fieldErrors(result.error) });
		try {
			await requestApi(locals).applications.create({ jobId: params.id, data: result.data });
			return { success: true, email: result.data.email };
		} catch (cause) {
			if (cause instanceof TRPCError && cause.code === 'CONFLICT')
				return fail(409, {
					values,
					closed: cause.message === 'Diese Stelle ist bereits geschlossen.',
					message: cause.message
				});
			notFound(cause);
		}
	}
};
