import { and, count, desc, eq, sql } from 'drizzle-orm';
import type { Database } from './db/index.ts';
import { applications, jobs } from './db/schema.ts';
import { applicationInput, idInput, jobInput, statusInput } from '../validation.ts';

export class JobboardError extends Error {
	constructor(public code: 'NOT_FOUND' | 'CLOSED' | 'DUPLICATE') {
		super(code);
	}
}

export function createJobboard(db: Database) {
	async function ownedJob(recruiterId: string, jobId: string) {
		if (!idInput.safeParse(jobId).success) throw new JobboardError('NOT_FOUND');
		const [job] = await db
			.select()
			.from(jobs)
			.where(and(eq(jobs.id, jobId), eq(jobs.recruiterId, recruiterId)));
		if (!job) throw new JobboardError('NOT_FOUND');
		return job;
	}
	return {
		ownedJob,
		async publicJobs() {
			return db
				.select({
					id: jobs.id,
					title: jobs.title,
					description: jobs.description,
					createdAt: jobs.createdAt
				})
				.from(jobs)
				.where(eq(jobs.status, 'open'))
				.orderBy(desc(jobs.updatedAt), desc(jobs.id));
		},
		async publicJob(id: string) {
			if (!idInput.safeParse(id).success) throw new JobboardError('NOT_FOUND');
			const [job] = await db
				.select({
					id: jobs.id,
					title: jobs.title,
					description: jobs.description,
					status: jobs.status,
					createdAt: jobs.createdAt
				})
				.from(jobs)
				.where(eq(jobs.id, id));
			if (!job) throw new JobboardError('NOT_FOUND');
			return job;
		},
		async ownJobs(recruiterId: string) {
			return db
				.select({
					id: jobs.id,
					title: jobs.title,
					status: jobs.status,
					createdAt: jobs.createdAt,
					applicationCount: count(applications.id),
					newCount:
						sql<number>`count(${applications.id}) filter (where ${applications.status} = 'new')`.mapWith(
							Number
						)
				})
				.from(jobs)
				.leftJoin(applications, eq(applications.jobId, jobs.id))
				.where(eq(jobs.recruiterId, recruiterId))
				.groupBy(jobs.id)
				.orderBy(desc(jobs.updatedAt), desc(jobs.id));
		},
		async createJob(recruiterId: string, input: unknown) {
			const data = jobInput.parse(input);
			const [job] = await db
				.insert(jobs)
				.values({ ...data, recruiterId })
				.returning();
			return job;
		},
		async updateJob(recruiterId: string, id: string, input: unknown) {
			const data = jobInput.parse(input);
			if (!idInput.safeParse(id).success) throw new JobboardError('NOT_FOUND');
			const [job] = await db
				.update(jobs)
				.set({ ...data, updatedAt: new Date() })
				.where(and(eq(jobs.id, id), eq(jobs.recruiterId, recruiterId)))
				.returning();
			if (!job) throw new JobboardError('NOT_FOUND');
			return job;
		},
		async apply(jobId: string, input: unknown) {
			const data = applicationInput.parse(input);
			if (!idInput.safeParse(jobId).success) throw new JobboardError('NOT_FOUND');
			return db.transaction(async (tx) => {
				// Closing a job and applying acquire the same PostgreSQL row lock.
				// Whichever commits first defines whether this application is accepted.
				const [job] = await tx
					.select({ status: jobs.status })
					.from(jobs)
					.where(eq(jobs.id, jobId))
					.for('update');
				if (!job) throw new JobboardError('NOT_FOUND');
				if (job.status !== 'open') throw new JobboardError('CLOSED');
				const [application] = await tx
					.insert(applications)
					.values({ ...data, jobId })
					.onConflictDoNothing({ target: [applications.jobId, applications.email] })
					.returning({ id: applications.id });
				if (!application) throw new JobboardError('DUPLICATE');
				return application;
			});
		},
		async ownApplications(recruiterId: string, jobId: string) {
			const job = await ownedJob(recruiterId, jobId);
			const items = await db
				.select()
				.from(applications)
				.where(eq(applications.jobId, job.id))
				.orderBy(desc(applications.createdAt), desc(applications.id));
			return { job, applications: items };
		},
		async updateApplication(
			recruiterId: string,
			jobId: string,
			applicationId: string,
			status: unknown
		) {
			const nextStatus = statusInput.parse(status);
			if (!idInput.safeParse(jobId).success || !idInput.safeParse(applicationId).success)
				throw new JobboardError('NOT_FOUND');
			const [updated] = await db
				.update(applications)
				.set({ status: nextStatus, updatedAt: new Date() })
				.where(
					and(
						eq(applications.id, applicationId),
						eq(applications.jobId, jobId),
						sql`exists (select 1 from ${jobs} where ${jobs.id} = ${applications.jobId} and ${jobs.recruiterId} = ${recruiterId})`
					)
				)
				.returning({ id: applications.id, status: applications.status });
			if (!updated) throw new JobboardError('NOT_FOUND');
			return updated;
		}
	};
}
