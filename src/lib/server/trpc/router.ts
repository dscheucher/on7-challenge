import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import { createJobboard, JobboardError } from '../jobboard.ts';
import { applicationInput, idInput, jobInput, statusInput } from '../../validation.ts';

export type Context = { user: { id: string } | null; board: ReturnType<typeof createJobboard> };
const t = initTRPC.context<Context>().create({ transformer: superjson });
const publicProcedure = t.procedure;
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bitte melde dich an.' });
	return next({ ctx: { ...ctx, user: ctx.user } });
});
async function domain<T>(operation: () => Promise<T>): Promise<T> {
	try {
		return await operation();
	} catch (cause) {
		if (cause instanceof JobboardError) {
			const code = cause.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'CONFLICT';
			const message =
				cause.code === 'NOT_FOUND'
					? 'Diese Seite ist nicht verfügbar oder du hast keinen Zugriff.'
					: cause.code === 'CLOSED'
						? 'Diese Stelle ist bereits geschlossen.'
						: 'Mit dieser E-Mail-Adresse wurde bereits eine Bewerbung für diese Stelle eingereicht.';
			throw new TRPCError({ code, message, cause });
		}
		throw cause;
	}
}
export const appRouter = t.router({
	jobs: t.router({
		listPublic: publicProcedure.query(({ ctx }) => ctx.board.publicJobs()),
		getPublic: publicProcedure
			.input(z.object({ id: idInput }))
			.query(({ ctx, input }) => domain(() => ctx.board.publicJob(input.id))),
		listOwn: protectedProcedure.query(({ ctx }) => ctx.board.ownJobs(ctx.user.id)),
		getOwn: protectedProcedure
			.input(z.object({ id: idInput }))
			.query(({ ctx, input }) => domain(() => ctx.board.ownedJob(ctx.user.id, input.id))),
		create: protectedProcedure
			.input(jobInput)
			.mutation(({ ctx, input }) => ctx.board.createJob(ctx.user.id, input)),
		update: protectedProcedure
			.input(z.object({ id: idInput, data: jobInput }))
			.mutation(({ ctx, input }) =>
				domain(() => ctx.board.updateJob(ctx.user.id, input.id, input.data))
			)
	}),
	applications: t.router({
		create: publicProcedure
			.input(z.object({ jobId: idInput, data: applicationInput }))
			.mutation(({ ctx, input }) => domain(() => ctx.board.apply(input.jobId, input.data))),
		listOwn: protectedProcedure
			.input(z.object({ jobId: idInput }))
			.query(({ ctx, input }) => domain(() => ctx.board.ownApplications(ctx.user.id, input.jobId))),
		updateStatus: protectedProcedure
			.input(z.object({ jobId: idInput, id: idInput, status: statusInput }))
			.mutation(({ ctx, input }) =>
				domain(() => ctx.board.updateApplication(ctx.user.id, input.jobId, input.id, input.status))
			)
	})
});
export type AppRouter = typeof appRouter;
