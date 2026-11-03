import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { createDatabase } from '../../src/lib/server/db/index.ts';
import { applications, jobs, user } from '../../src/lib/server/db/schema.ts';
import { createJobboard } from '../../src/lib/server/jobboard.ts';
import { appRouter } from '../../src/lib/server/trpc/router.ts';

const url = process.env.TEST_DATABASE_URL;
if (!url)
	throw new Error('TEST_DATABASE_URL must point to a migrated, real PostgreSQL test database.');
const { db, pool } = createDatabase(url);
const board = createJobboard(db);
const owner = randomUUID(),
	other = randomUUID();
const api = appRouter.createCaller({ user: { id: owner }, board });
const stranger = appRouter.createCaller({ user: { id: other }, board });
const anonymous = appRouter.createCaller({ user: null, board });
const applicant = {
	name: 'Mara Hoffmann',
	email: 'mara@example.test',
	message: 'Ich interessiere mich für diese Stelle.'
};
const newJob = (status: 'open' | 'closed' = 'open') =>
	api.jobs.create({
		title: 'Frontend Developer',
		description: 'Eine sinnvolle Beschreibung.',
		status
	});

describe('tRPC + Drizzle against real PostgreSQL', () => {
	before(async () => {
		await db.execute(sql`select version()`);
		await db.insert(user).values([
			{ id: owner, name: 'Owner', email: `${owner}@example.test` },
			{ id: other, name: 'Other', email: `${other}@example.test` }
		]);
	});
	after(async () => {
		await db.delete(user).where(eq(user.id, owner));
		await db.delete(user).where(eq(user.id, other));
		await pool.end();
	});
	it('lists only open jobs and exposes no recruiter credentials', async () => {
		const open = await newJob(),
			closed = await newJob('closed');
		const result = await anonymous.jobs.listPublic();
		assert.ok(result.some((job) => job.id === open.id));
		assert.ok(!result.some((job) => job.id === closed.id));
		assert.ok(!('recruiterId' in result[0]));
	});
	it('accepts applications without an account and defaults to new', async () => {
		const job = await newJob();
		const result = await anonymous.applications.create({ jobId: job.id, data: applicant });
		const own = await api.applications.listOwn({ jobId: job.id });
		assert.equal(own.applications[0].id, result.id);
		assert.equal(own.applications[0].status, 'new');
	});
	it('normalizes email, rejects duplicates and permits the same email on another job', async () => {
		const job = await newJob();
		await anonymous.applications.create({
			jobId: job.id,
			data: { ...applicant, email: ' Mara@Example.Test ' }
		});
		await assert.rejects(
			anonymous.applications.create({
				jobId: job.id,
				data: { ...applicant, email: 'mara@example.test' }
			}),
			{ code: 'CONFLICT' }
		);
		const another = await newJob();
		await anonymous.applications.create({ jobId: another.id, data: applicant });
		const result = await api.applications.listOwn({ jobId: job.id });
		assert.equal(result.applications.length, 1);
		assert.equal(result.applications[0].email, 'mara@example.test');
	});
	it('allows exactly one of eight simultaneous applications with the same email', async () => {
		const job = await newJob();
		const results = await Promise.allSettled(
			Array.from({ length: 8 }, () =>
				anonymous.applications.create({ jobId: job.id, data: applicant })
			)
		);
		assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
		for (const result of results)
			if (result.status === 'rejected') assert.equal(result.reason.code, 'CONFLICT');
		assert.equal((await api.applications.listOwn({ jobId: job.id })).applications.length, 1);
	});
	it('rejects closed jobs on the server', async () => {
		const job = await newJob('closed');
		await assert.rejects(anonymous.applications.create({ jobId: job.id, data: applicant }), {
			code: 'CONFLICT',
			message: 'Diese Stelle ist bereits geschlossen.'
		});
		assert.equal((await api.applications.listOwn({ jobId: job.id })).applications.length, 0);
	});
	it('waits for a concurrent close to commit, then rejects the application', async () => {
		const job = await newJob();
		const connection = await pool.connect();
		try {
			await connection.query('begin');
			await connection.query('update jobs set status = $1 where id = $2', ['closed', job.id]);
			const attempt = anonymous.applications.create({ jobId: job.id, data: applicant });
			// Attach the assertion immediately, so a fast rejection is never unhandled.
			const rejected = assert.rejects(attempt, { code: 'CONFLICT' });
			let waiting = false;
			for (let i = 0; i < 100; i++) {
				const result = await pool.query(
					"select 1 from pg_stat_activity where datname = current_database() and wait_event_type = 'Lock' and query like '%for update%'"
				);
				if (result.rowCount) {
					waiting = true;
					break;
				}
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
			assert.ok(waiting, 'Application must wait for the job row lock');
			await connection.query('commit');
			await rejected;
			assert.equal((await api.applications.listOwn({ jobId: job.id })).applications.length, 0);
		} finally {
			await connection.query('rollback');
			connection.release();
		}
	});
	it('requires authentication for all recruiter procedures', async () => {
		await assert.rejects(anonymous.jobs.listOwn(), { code: 'UNAUTHORIZED' });
		await assert.rejects(
			anonymous.jobs.create({ title: 'Test', description: 'Test', status: 'open' }),
			{ code: 'UNAUTHORIZED' }
		);
	});
	it('denies reading or modifying another recruiter’s jobs and applications', async () => {
		const job = await newJob();
		const application = await anonymous.applications.create({ jobId: job.id, data: applicant });
		assert.ok(!(await stranger.jobs.listOwn()).some((item) => item.id === job.id));
		await assert.rejects(stranger.applications.listOwn({ jobId: job.id }), { code: 'NOT_FOUND' });
		await assert.rejects(stranger.jobs.getOwn({ id: job.id }), { code: 'NOT_FOUND' });
		await assert.rejects(
			stranger.jobs.update({
				id: job.id,
				data: { title: 'Hacked', description: 'Hacked', status: 'closed' }
			}),
			{ code: 'NOT_FOUND' }
		);
		await assert.rejects(
			stranger.applications.updateStatus({ jobId: job.id, id: application.id, status: 'rejected' }),
			{ code: 'NOT_FOUND' }
		);
		const ownOtherJob = await stranger.jobs.create({
			title: 'Other',
			description: 'Other',
			status: 'open'
		});
		await assert.rejects(
			stranger.applications.updateStatus({
				jobId: ownOtherJob.id,
				id: application.id,
				status: 'rejected'
			}),
			{ code: 'NOT_FOUND' }
		);
		assert.equal((await api.applications.listOwn({ jobId: job.id })).applications[0].status, 'new');
	});
	it('persists invited and rejected states', async () => {
		const job = await newJob();
		const application = await anonymous.applications.create({ jobId: job.id, data: applicant });
		for (const status of ['invited', 'rejected', 'new'] as const) {
			await api.applications.updateStatus({ jobId: job.id, id: application.id, status });
			assert.equal(
				(await api.applications.listOwn({ jobId: job.id })).applications[0].status,
				status
			);
		}
	});
	it('rejects invalid server inputs without writing data', async () => {
		const job = await newJob();
		await assert.rejects(
			anonymous.applications.create({
				jobId: job.id,
				data: { ...applicant, email: 'not-an-email' }
			}),
			{ code: 'BAD_REQUEST' }
		);
		await assert.rejects(
			anonymous.applications.create({ jobId: job.id, data: { ...applicant, message: ' ' } }),
			{ code: 'BAD_REQUEST' }
		);
		await assert.rejects(api.jobs.create({ title: ' ', description: 'Test', status: 'open' }), {
			code: 'BAD_REQUEST'
		});
		await assert.rejects(api.jobs.create({ title: 'Test', description: ' ', status: 'open' }), {
			code: 'BAD_REQUEST'
		});
		assert.equal((await api.applications.listOwn({ jobId: job.id })).applications.length, 0);
	});
	it('enforces constraints even when bypassing the service layer', async () => {
		const job = await newJob();
		await assert.rejects(
			db.insert(applications).values({ ...applicant, jobId: job.id, email: 'UPPER@example.test' })
		);
		await db.insert(applications).values({ ...applicant, jobId: job.id });
		await assert.rejects(db.insert(applications).values({ ...applicant, jobId: job.id }));
		await assert.rejects(db.insert(applications).values({ ...applicant, jobId: randomUUID() }));
		await assert.rejects(
			db.insert(jobs).values({ recruiterId: owner, title: ' ', description: 'Test' })
		);
	});
});
