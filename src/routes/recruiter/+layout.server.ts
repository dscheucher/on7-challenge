import { requireRecruiter } from '#lib/server/context.ts';
export const load = ({ locals }: import('./$types').LayoutServerLoadEvent) => {
	requireRecruiter(locals);
};
