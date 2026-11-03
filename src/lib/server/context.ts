import { error, redirect } from '@sveltejs/kit';
import { TRPCError } from '@trpc/server';
export function requireRecruiter(locals: App.Locals) {
	if (!locals.user) redirect(303, '/login');
	return locals.user;
}
export function notFound(cause: unknown): never {
	if (cause instanceof TRPCError && (cause.code === 'NOT_FOUND' || cause.code === 'BAD_REQUEST'))
		error(404, { message: 'Diese Seite ist nicht verfügbar oder du hast keinen Zugriff.' });
	throw cause;
}
