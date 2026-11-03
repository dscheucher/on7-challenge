export const load = ({ locals }: import('./$types').LayoutServerLoadEvent) => ({
	user: locals.user ? { name: locals.user.name, email: locals.user.email } : null
});
