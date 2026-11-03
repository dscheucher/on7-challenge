import { sql } from 'drizzle-orm';
import { pgTable, pgEnum, uuid, text, timestamp, index, unique, check } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.ts';
export * from './auth-schema.ts';

export const jobStatus = pgEnum('job_status', ['open', 'closed']);
export const applicationStatus = pgEnum('application_status', ['new', 'invited', 'rejected']);

export const jobs = pgTable(
	'jobs',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		recruiterId: text('recruiter_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		description: text('description').notNull(),
		status: jobStatus('status').default('open').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('jobs_recruiter_idx').on(table.recruiterId),
		index('jobs_public_idx').on(table.status, table.createdAt),
		check('jobs_title_length', sql`char_length(btrim(${table.title})) between 1 and 160`),
		check(
			'jobs_description_length',
			sql`char_length(btrim(${table.description})) between 1 and 20000`
		)
	]
);

export const applications = pgTable(
	'applications',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		jobId: uuid('job_id')
			.notNull()
			.references(() => jobs.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		email: text('email').notNull(),
		message: text('message').notNull(),
		status: applicationStatus('status').default('new').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('applications_job_email_unique').on(table.jobId, table.email),
		index('applications_job_created_idx').on(table.jobId, table.createdAt),
		check('applications_email_normalized', sql`${table.email} = lower(btrim(${table.email}))`),
		check('applications_name_length', sql`char_length(btrim(${table.name})) between 1 and 120`),
		check('applications_email_length', sql`char_length(${table.email}) between 3 and 254`),
		check(
			'applications_message_length',
			sql`char_length(btrim(${table.message})) between 1 and 2000`
		)
	]
);
