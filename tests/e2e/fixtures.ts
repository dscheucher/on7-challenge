import { test as base, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createDatabase } from '../../src/lib/server/db/index.ts';
import { user } from '../../src/lib/server/db/schema.ts';
import { createJobboard } from '../../src/lib/server/jobboard.ts';
import { createRecruiter } from '../../scripts/accounts.ts';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for browser fixtures.');
const { db, pool } = createDatabase(process.env.DATABASE_URL);
const board = createJobboard(db);
const password = 'BrowserTest2026!';
type Fixture = {
	ownerId: string;
	otherId: string;
	email: string;
	password: string;
	job: Awaited<ReturnType<typeof board.createJob>>;
	closed: Awaited<ReturnType<typeof board.createJob>>;
	foreign: Awaited<ReturnType<typeof board.createJob>>;
	board: typeof board;
};
export const test = base.extend<{ fixture: Fixture }>({
	fixture: async ({ browserName }, use) => {
		void browserName;
		const email = `owner-${randomUUID()}@example.test`;
		const owner = await createRecruiter(db, { email, name: 'Recruiter', password });
		const other = await createRecruiter(db, {
			email: `other-${randomUUID()}@example.test`,
			name: 'Other',
			password
		});
		try {
			const job = await board.createJob(owner.id, {
				title: 'Frontend Developer',
				description: 'Entwickle digitale Produkte in einem kleinen Team.',
				status: 'open'
			});
			const closed = await board.createJob(owner.id, {
				title: 'Geschlossene Teststelle',
				description: 'Keine Bewerbungen mehr möglich.',
				status: 'closed'
			});
			const foreign = await board.createJob(other.id, {
				title: 'Fremde Stelle',
				description: 'Nicht für diesen Recruiter.',
				status: 'open'
			});
			await use({
				ownerId: owner.id,
				otherId: other.id,
				email,
				password,
				job,
				closed,
				foreign,
				board
			});
		} finally {
			await db.delete(user).where(eq(user.id, owner.id));
			await db.delete(user).where(eq(user.id, other.id));
		}
	}
});
test.afterAll(async () => {
	await pool.end();
});
export { expect };
export async function registeredRecruiter(email: string) {
	const [result] = await db
		.select({ id: user.id, emailVerified: user.emailVerified })
		.from(user)
		.where(eq(user.email, email));
	return result;
}
export async function removeRegisteredRecruiter(email: string) {
	await db.delete(user).where(eq(user.email, email));
}
export async function login(page: Page, fixture: Fixture) {
	await page.goto('/login');
	await page.getByLabel('E-Mail-Adresse').fill(fixture.email);
	await page.getByLabel('Passwort', { exact: true }).fill(fixture.password);
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await expect(page).toHaveURL(/\/recruiter\/jobs$/);
}
export async function fillApplication(page: Page, email = 'mara@example.test') {
	await page.getByLabel('Name', { exact: true }).fill('Mara Hoffmann');
	await page.getByLabel('E-Mail-Adresse').fill(email);
	await page.getByLabel('Kurze Nachricht').fill('Ich möchte euer Team kennenlernen.');
}
