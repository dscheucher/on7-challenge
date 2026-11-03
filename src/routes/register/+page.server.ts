import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { getAuth } from '#lib/server/auth.ts';
import { fieldErrors, registrationInput } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/recruiter/jobs');
};
export const actions: Actions = {
	default: async ({ request }) => {
		const input = Object.fromEntries(await request.formData());
		// Passwords never enter action data or server-rendered HTML.
		const values = {
			name: typeof input.name === 'string' ? input.name : '',
			email: typeof input.email === 'string' ? input.email : ''
		};
		const parsed = registrationInput.safeParse(input);
		if (!parsed.success) return fail(400, { values, errors: fieldErrors(parsed.error) });
		try {
			await getAuth().api.signUpEmail({ body: parsed.data, headers: request.headers });
		} catch (cause) {
			if (cause instanceof APIError) {
				if (cause.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL')
					return fail(409, {
						values,
						message: 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Bitte melde dich an.'
					});
				return fail(cause.statusCode === 429 ? 429 : 400, {
					values,
					message:
						cause.statusCode === 429
							? 'Zu viele Versuche. Bitte versuche es später erneut.'
							: 'Das Konto konnte nicht erstellt werden. Bitte prüfe deine Eingaben.'
				});
			}
			throw cause;
		}
		redirect(303, '/recruiter/jobs');
	}
};
