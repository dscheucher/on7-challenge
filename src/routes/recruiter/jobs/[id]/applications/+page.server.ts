import { fail } from '@sveltejs/kit';
import { notFound, requireRecruiter } from '#lib/server/context.ts';
import { requestApi } from '#lib/server/trpc/context.ts';
import { idInput, statusInput } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireRecruiter(locals);
	try {
		return await requestApi(locals).applications.listOwn({ jobId: params.id });
	} catch (cause) {
		notFound(cause);
	}
};
export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		requireRecruiter(locals);
		const values = Object.fromEntries(await request.formData());
		const id = idInput.safeParse(values.applicationId);
		const status = statusInput.safeParse(values.status);
		if (!id.success || !status.success)
			return fail(400, {
				message: 'Bitte wähle eine gültige Bewerbung und einen gültigen Status.'
			});
		try {
			await requestApi(locals).applications.updateStatus({
				jobId: params.id,
				id: id.data,
				status: status.data
			});
			return { saved: true };
		} catch (cause) {
			notFound(cause);
		}
	}
};
