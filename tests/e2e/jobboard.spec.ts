import {
	test,
	expect,
	login,
	fillApplication,
	registeredRecruiter,
	removeRegisteredRecruiter
} from './fixtures.ts';
import { randomUUID } from 'node:crypto';

test('public list shows open jobs, hides closed jobs, and opens details', async ({
	page,
	fixture
}) => {
	await page.goto('/jobs');
	await expect(page.locator(`a.job-card[href="/jobs/${fixture.job.id}"]`)).toBeVisible();
	await expect(page.locator(`a.job-card[href="/jobs/${fixture.closed.id}"]`)).toHaveCount(0);
	await page.locator(`a.job-card[href="/jobs/${fixture.job.id}"]`).click();
	await expect(page).toHaveURL(`/jobs/${fixture.job.id}`);
	await expect(
		page.getByRole('heading', { name: 'Frontend Developer', exact: true, level: 1 })
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Bewerbung absenden' })).toBeVisible();
});

test('unverified recruiter logs in immediately, keeps session, then logs out', async ({
	page,
	fixture
}) => {
	await page.goto('/recruiter/jobs');
	await expect(page).toHaveURL('/login');
	await page.getByLabel('E-Mail-Adresse').fill(fixture.email);
	await page.getByLabel('Passwort', { exact: true }).fill(fixture.password);
	await page.getByRole('button', { name: 'Passwort anzeigen' }).click();
	await expect(page.getByLabel('Passwort', { exact: true })).toHaveAttribute('type', 'text');
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await expect(page).toHaveURL('/recruiter/jobs');
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Meine Stellen' })).toBeVisible();
	await page.getByRole('button', { name: 'Abmelden' }).click();
	await expect(page).toHaveURL('/login');
	await page.goto('/recruiter/jobs');
	await expect(page).toHaveURL('/login');
});

test('wrong password produces a useful error and keeps the email', async ({ page, fixture }) => {
	await page.goto('/login');
	await page.getByLabel('E-Mail-Adresse').fill(fixture.email);
	await page.getByLabel('Passwort', { exact: true }).fill('wrong-password');
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await expect(page.getByRole('alert')).toContainText('E-Mail-Adresse oder Passwort ist falsch');
	await expect(page.getByLabel('E-Mail-Adresse')).toHaveValue(fixture.email);
});

test('create, edit, close, reopen and filter a job', async ({ page, fixture }) => {
	await login(page, fixture);
	await page.getByRole('link', { name: 'Neue Stelle', exact: true }).click();
	await page.getByLabel('Titel', { exact: true }).fill('QA Engineer');
	await page.getByLabel('Beschreibung', { exact: true }).fill('Teste unsere Anwendungen.');
	await page.getByRole('button', { name: 'Stelle erstellen', exact: true }).click();
	await expect(page.getByRole('status')).toContainText('Stelle gespeichert');
	const own = await fixture.board.ownJobs(fixture.ownerId);
	const job = own.find((item) => item.title === 'QA Engineer');
	expect(job).toBeTruthy();
	await page.goto(`/recruiter/jobs/${job!.id}/edit`);
	await page.getByLabel('Titel', { exact: true }).fill('Senior QA Engineer');
	await page.getByRole('radio', { name: /^Geschlossen/ }).check();
	await page.getByRole('button', { name: 'Änderungen speichern' }).click();
	await page.getByRole('link', { name: /Geschlossen\s+\d/ }).click();
	await expect(
		page.getByText('Senior QA Engineer', { exact: true }).filter({ visible: true })
	).toBeVisible();
	await page.goto(`/jobs/${job!.id}`);
	await expect(
		page.getByRole('heading', { name: 'Diese Stelle ist bereits geschlossen.' })
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Bewerbung absenden' })).toHaveCount(0);
	await page.goto(`/recruiter/jobs/${job!.id}/edit`);
	await page.getByRole('radio', { name: /^Offen/ }).check();
	await page.getByRole('button', { name: 'Änderungen speichern' }).click();
	await page.goto(`/jobs/${job!.id}`);
	await expect(page.getByRole('button', { name: 'Bewerbung absenden' })).toBeVisible();
});

test('job input errors are rendered from the server and cancel does not create a job', async ({
	page,
	fixture
}) => {
	await login(page, fixture);
	await page.goto('/recruiter/jobs/new');
	await page.getByRole('button', { name: 'Stelle erstellen', exact: true }).click();
	await expect(page.getByText('Bitte gib einen Titel ein.')).toBeVisible();
	await expect(page.getByText('Bitte ergänze eine Beschreibung.')).toBeVisible();
	await page.getByLabel('Titel', { exact: true }).fill('Nicht speichern');
	await page.getByRole('link', { name: 'Abbrechen' }).click();
	expect(
		(await fixture.board.ownJobs(fixture.ownerId)).some((item) => item.title === 'Nicht speichern')
	).toBe(false);
});

test('apply without a login, show confirmation and prevent a duplicate case-insensitively', async ({
	page,
	fixture
}) => {
	await page.goto(`/jobs/${fixture.job.id}`);
	await fillApplication(page);
	await page.getByRole('button', { name: 'Bewerbung absenden' }).click();
	await expect(page.getByRole('status')).toContainText('Deine Bewerbung wurde übermittelt.');
	await page.reload();
	await fillApplication(page, 'MARA@EXAMPLE.TEST');
	await page.getByRole('button', { name: 'Bewerbung absenden' }).click();
	await expect(page.getByRole('alert')).toContainText('bereits eine Bewerbung');
	await expect(page.getByLabel('Kurze Nachricht')).toHaveValue(
		'Ich möchte euer Team kennenlernen.'
	);
	expect(
		(await fixture.board.ownApplications(fixture.ownerId, fixture.job.id)).applications
	).toHaveLength(1);
});

test('application server validation catches missing and malformed input', async ({
	page,
	fixture
}) => {
	await page.goto(`/jobs/${fixture.job.id}`);
	await page.getByRole('button', { name: 'Bewerbung absenden' }).click();
	await expect(page.getByText('Bitte gib deinen Namen ein.')).toBeVisible();
	await expect(page.getByText('Bitte ergänze eine kurze Nachricht.')).toBeVisible();
	await page.getByLabel('E-Mail-Adresse').fill('mara@');
	await page.getByRole('button', { name: 'Bewerbung absenden' }).click();
	await expect(page.getByText('Bitte gib eine gültige E-Mail-Adresse ein.')).toBeVisible();
});

test('job closes while applicant is filling the form', async ({ page, fixture }) => {
	await page.goto(`/jobs/${fixture.job.id}`);
	await fillApplication(page);
	await fixture.board.updateJob(fixture.ownerId, fixture.job.id, {
		...fixture.job,
		status: 'closed'
	});
	await page.getByRole('button', { name: 'Bewerbung absenden' }).click();
	await expect(
		page.getByRole('heading', { name: 'Diese Stelle ist bereits geschlossen.' })
	).toBeVisible();
	expect(
		(await fixture.board.ownApplications(fixture.ownerId, fixture.job.id)).applications
	).toHaveLength(0);
});

test('own applications can be read, filtered, invited and rejected persistently', async ({
	page,
	fixture,
	isMobile
}) => {
	await fixture.board.apply(fixture.job.id, {
		name: 'Mara Hoffmann',
		email: 'mara@example.test',
		message: 'Meine ausführliche Bewerbung.'
	});
	await login(page, fixture);
	await page.goto(`/recruiter/jobs/${fixture.job.id}/applications`);
	if (isMobile) await page.getByRole('link', { name: /Mara Hoffmann/ }).click();
	await expect(page.getByText('Meine ausführliche Bewerbung.', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Eingeladen', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Eingeladen', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(page.getByText('Status gespeichert.', { exact: true })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('button', { name: 'Eingeladen', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.getByRole('button', { name: 'Abgelehnt', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Abgelehnt', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	if (isMobile) {
		await page.getByRole('link', { name: 'Bewerbungen', exact: true }).click();
		await page.getByRole('combobox', { name: 'Bewerbungsstatus filtern' }).selectOption('new');
	} else await page.getByRole('link', { name: /^Neu\s/ }).click();
	await expect(
		page.getByRole('heading', { name: 'Keine Bewerbungen mit diesem Status' })
	).toBeVisible();
});

test('foreign jobs and applications stay inaccessible through direct URLs', async ({
	page,
	fixture
}) => {
	await fixture.board.apply(fixture.foreign.id, {
		name: 'Privater Bewerber',
		email: 'private@example.test',
		message: 'Diese Nachricht ist vertraulich.'
	});
	await login(page, fixture);
	await expect(page.getByText('Fremde Stelle', { exact: true })).toHaveCount(0);
	for (const path of [
		`/recruiter/jobs/${fixture.foreign.id}/edit`,
		`/recruiter/jobs/${fixture.foreign.id}/applications`
	]) {
		const response = await page.goto(path);
		expect(response?.status()).toBe(404);
		await expect(page.getByRole('heading', { name: 'Seite nicht verfügbar' })).toBeVisible();
		await expect(page.getByText('Diese Nachricht ist vertraulich.')).toHaveCount(0);
	}
});

test('empty applications and mobile layout stay usable without horizontal scrolling', async ({
	page,
	fixture
}) => {
	await login(page, fixture);
	await page.goto(`/recruiter/jobs/${fixture.job.id}/applications`);
	await expect(page.getByRole('heading', { name: 'Noch keine Bewerbungen' })).toBeVisible();
	for (const route of [
		'/jobs',
		'/recruiter/jobs',
		'/recruiter/jobs/new',
		`/jobs/${fixture.job.id}`
	]) {
		await page.goto(route);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
		).toBe(true);
	}
});

test('a failed request keeps form input and can be retried', async ({ page, fixture }) => {
	await page.goto(`/jobs/${fixture.job.id}`);
	await fillApplication(page);
	await page.route(`**/jobs/${fixture.job.id}`, (route) =>
		route.request().method() === 'POST' ? route.abort('failed') : route.continue()
	);
	await page.getByRole('button', { name: 'Bewerbung absenden' }).click();
	await expect(page.getByRole('alert')).toContainText('Deine Eingaben bleiben erhalten');
	await expect(page.getByLabel('Kurze Nachricht')).toHaveValue(
		'Ich möchte euer Team kennenlernen.'
	);
	await page.unrouteAll({ behavior: 'wait' });
	await page.getByRole('button', { name: 'Erneut senden' }).click();
	await expect(page.getByRole('status')).toContainText('Deine Bewerbung wurde übermittelt.');
});

test('register through the login page without verification and stay signed in', async ({
	page
}) => {
	const email = `registration-${randomUUID()}@example.test`;
	const password = 'RegistrationTest2026!';
	try {
		await page.goto('/login');
		await page.getByRole('link', { name: 'Registrieren', exact: true }).click();
		await expect(page).toHaveURL('/register');
		await page.getByLabel('Name', { exact: true }).fill('Neue Recruiterin');
		await page.getByLabel('E-Mail-Adresse').fill(email.toUpperCase());
		await page.getByLabel('Passwort', { exact: true }).fill(password);
		await page.getByRole('button', { name: 'Passwort anzeigen' }).click();
		await expect(page.getByLabel('Passwort', { exact: true })).toHaveAttribute('type', 'text');
		await page.getByRole('button', { name: 'Konto erstellen', exact: true }).click();
		await expect(page).toHaveURL('/recruiter/jobs');
		await expect(page.getByRole('heading', { name: 'Noch keine eigenen Stellen' })).toBeVisible();
		expect((await registeredRecruiter(email))?.emailVerified).toBe(false);
		await page.reload();
		await expect(page.getByRole('heading', { name: 'Meine Stellen', exact: true })).toBeVisible();
		await page.goto('/register');
		await expect(page).toHaveURL('/recruiter/jobs');
		await page.getByRole('link', { name: 'Neue Stelle', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Neue Stelle', exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'Abmelden' }).click();
		await page.getByLabel('E-Mail-Adresse').fill(email);
		await page.getByLabel('Passwort', { exact: true }).fill(password);
		await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
		await expect(page).toHaveURL('/recruiter/jobs');
	} finally {
		await removeRegisteredRecruiter(email);
	}
});

test('registration validates fields on the server and never echoes passwords', async ({ page }) => {
	await page.goto('/register');
	await page.getByLabel('E-Mail-Adresse').fill('invalid@');
	await page.getByLabel('Passwort', { exact: true }).fill('short');
	const result = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/register'
	);
	await page.getByRole('button', { name: 'Konto erstellen', exact: true }).click();
	expect(await (await result).text()).not.toContain('short');
	await expect(page.getByText('Bitte gib deinen Namen ein.')).toBeVisible();
	await expect(page.getByText('Bitte gib eine gültige E-Mail-Adresse ein.')).toBeVisible();
	await expect(page.getByText('Das Passwort muss mindestens 8 Zeichen lang sein.')).toBeVisible();
	await expect(page.getByLabel('E-Mail-Adresse')).toHaveValue('invalid@');
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('registration rejects duplicate accounts and keeps the existing password', async ({
	page,
	fixture
}) => {
	await page.goto('/register');
	await page.getByLabel('Name', { exact: true }).fill('Doppeltes Konto');
	await page.getByLabel('E-Mail-Adresse').fill(fixture.email.toUpperCase());
	await page.getByLabel('Passwort', { exact: true }).fill('DifferentPassword2026!');
	await page.getByRole('button', { name: 'Konto erstellen', exact: true }).click();
	await expect(page.getByRole('alert')).toContainText('bereits ein Konto');
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Doppeltes Konto');
	await page.getByRole('link', { name: 'Anmelden', exact: true }).click();
	await login(page, fixture);
});

test('registration also works without client-side JavaScript', async ({ browser, baseURL }) => {
	const email = `registration-native-${randomUUID()}@example.test`;
	const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
	try {
		const page = await context.newPage();
		await page.goto('/register');
		await page.getByLabel('Name', { exact: true }).fill('Native Recruiter');
		await page.getByLabel('E-Mail-Adresse').fill(email);
		await page.getByLabel('Passwort', { exact: true }).fill('RegistrationTest2026!');
		await page.getByRole('button', { name: 'Konto erstellen', exact: true }).click();
		await expect(page).toHaveURL('/recruiter/jobs');
		expect((await registeredRecruiter(email))?.emailVerified).toBe(false);
	} finally {
		await context.close();
		await removeRegisteredRecruiter(email);
	}
});

test('description formatting uses explicit headings for every job title', async ({
	page,
	fixture
}) => {
	await fixture.board.updateJob(fixture.ownerId, fixture.job.id, {
		title: 'Platform Engineer',
		status: 'open',
		description:
			'Erste Zeile\nZweite Zeile\n\n## Deine Aufgaben\nZuverlässige Dienste entwickeln.\n\n<script>window.__jobboardXss=true</script>'
	});
	await page.goto(`/jobs/${fixture.job.id}`);
	await expect(page.getByRole('heading', { name: 'Platform Engineer', level: 1 })).toBeVisible();
	await expect(page.locator('.description-paragraph').first()).toHaveText(
		'Erste Zeile\nZweite Zeile'
	);
	await expect(page.getByRole('heading', { name: 'Erste Zeile' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Deine Aufgaben', level: 2 })).toBeVisible();
	await expect(
		page.getByText('<script>window.__jobboardXss=true</script>', { exact: true })
	).toBeVisible();
	expect(await page.evaluate(() => Reflect.has(window, '__jobboardXss'))).toBe(false);
});
