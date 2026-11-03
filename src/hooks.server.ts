import { building } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { getAuth } from '#lib/server/auth.ts';

export const handle: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);
	const auth = getAuth();
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;
	const response = await svelteKitHandler({ event, resolve, auth, building });
	if (event.url.pathname.startsWith('/recruiter') || event.locals.user)
		response.headers.set('Cache-Control', 'private, no-store');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	return response;
};
