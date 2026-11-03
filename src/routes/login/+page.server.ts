import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { getAuth } from '#lib/server/auth.ts';
import { loginInput } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/recruiter/jobs');
};
export const actions: Actions = {
	default: async ({ request }) => {
		const values = Object.fromEntries(await request.formData());
		const data = loginInput.safeParse(values);
		if (!data.success)
			return fail(400, {
				email: String(values.email ?? ''),
				message: 'Bitte gib eine gültige E-Mail-Adresse und dein Passwort ein.'
			});
		try {
			await getAuth().api.signInEmail({ body: data.data, headers: request.headers });
		} catch (cause) {
			if (cause instanceof APIError)
				return fail(cause.statusCode === 429 ? 429 : 400, {
					email: data.data.email,
					message:
						cause.statusCode === 429
							? 'Zu viele Anmeldeversuche. Bitte versuche es später erneut.'
							: 'E-Mail-Adresse oder Passwort ist falsch. Prüfe deine Eingaben.'
				});
			throw cause;
		}
		redirect(303, '/recruiter/jobs');
	}
};
