import { saveJob } from '#lib/server/job-action.ts';
export const actions = { default: (event: import('./$types').RequestEvent) => saveJob(event) };
