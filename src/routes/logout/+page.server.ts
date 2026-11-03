import { redirect } from '@sveltejs/kit';
import { getAuth } from '#lib/server/auth.ts';
export const actions = {
	default: async ({ request }: import('./$types').RequestEvent) => {
		await getAuth().api.signOut({ headers: request.headers });
		redirect(303, '/login');
	}
};
