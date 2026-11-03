import { db, pool } from '../src/lib/server/db/index.ts';
import { jobs, applications } from '../src/lib/server/db/schema.ts';
import { createRecruiter } from './accounts.ts';

export const demoJobId = '10000000-0000-4000-8000-000000000001';
export const frontendDescription =
	'Du möchtest digitale Produkte entwickeln, die Menschen gerne nutzen? Bei uns arbeitest du an verständlichen Oberflächen – von der ersten Idee bis zum letzten Detail.\n\nDeine Aufgaben\nDu entwickelst moderne Weboberflächen und setzt Designs gemeinsam mit unserem Produktteam um. Dabei achtest du auf gute Bedienbarkeit, sauberen Code und verlässliche Tests.\n\nDas bringst du mit\nErfahrung mit JavaScript oder TypeScript und einem modernen Frontend-Framework. Du arbeitest eigenständig, stellst Fragen und teilst dein Wissen gerne im Team.\n\nDas erwartet dich\nEin kleines Team mit kurzen Entscheidungswegen, Raum für eigene Ideen und eine Arbeitsweise, in der Qualität und Zusammenarbeit zählen.';
try {
	const lea = await createRecruiter(db, {
		email: 'lea@beispiel.de',
		name: 'Lea',
		password: 'JobboardDemo2026!'
	});
	const tom = await createRecruiter(db, {
		email: 'tom@beispiel.de',
		name: 'Tom',
		password: 'JobboardDemo2026!'
	});
	const data = [
		{
			id: demoJobId,
			recruiterId: lea.id,
			title: 'Frontend Developer',
			description: frontendDescription,
			status: 'open' as const,
			createdAt: new Date('2026-10-27T09:00:00+01:00'),
			updatedAt: new Date('2026-11-03T09:00:00+01:00')
		},
		{
			id: '10000000-0000-4000-8000-000000000002',
			recruiterId: lea.id,
			title: 'Product Designer',
			description:
				'Bringe komplexe Anforderungen in klare Interfaces und begleite Ideen bis zum fertigen Produkt.',
			status: 'open' as const,
			createdAt: new Date('2026-11-02T09:00:00+01:00'),
			updatedAt: new Date('2026-11-02T09:00:00+01:00')
		},
		{
			id: '10000000-0000-4000-8000-000000000003',
			recruiterId: lea.id,
			title: 'Backend Developer',
			description:
				'Entwickle zuverlässige Schnittstellen und die technische Basis für unsere Anwendungen.',
			status: 'open' as const,
			createdAt: new Date('2026-11-01T09:00:00+01:00'),
			updatedAt: new Date('2026-11-01T09:00:00+01:00')
		},
		{
			id: '10000000-0000-4000-8000-000000000004',
			recruiterId: lea.id,
			title: 'Werkstudent Marketing',
			description: 'Unterstütze unser Marketing-Team bei Kampagnen und Inhalten.',
			status: 'closed' as const,
			createdAt: new Date('2026-10-24T09:00:00+02:00'),
			updatedAt: new Date('2026-10-24T09:00:00+02:00')
		},
		{
			id: '10000000-0000-4000-8000-000000000005',
			recruiterId: tom.id,
			title: 'Customer Success Manager',
			description:
				'Begleite unsere Kunden im Alltag und hilf ihnen, mit unseren Produkten erfolgreich zu sein.',
			status: 'open' as const,
			createdAt: new Date('2026-10-31T09:00:00+01:00'),
			updatedAt: new Date('2026-10-31T09:00:00+01:00')
		}
	];
	await db.insert(jobs).values(data).onConflictDoNothing();
	const times = [
		'2026-11-03T09:42:00+01:00',
		'2026-11-03T08:15:00+01:00',
		'2026-11-02T16:30:00+01:00',
		'2026-11-02T14:05:00+01:00',
		'2026-11-02T11:20:00+01:00',
		'2026-11-02T10:40:00+01:00',
		'2026-11-02T09:10:00+01:00',
		'2026-11-01T15:55:00+01:00'
	];
	const names = [
		'Mara Hoffmann',
		'Jonas Weber',
		'Elif Yilmaz',
		'Paul Schneider',
		'Lina Becker',
		'Noah Fischer',
		'Sophie Klein',
		'Ben Wagner'
	];
	const emails = [
		'mara.hoffmann',
		'jonas.weber',
		'elif.yilmaz',
		'paul.schneider',
		'lina.becker',
		'noah.fischer',
		'sophie.klein',
		'ben.wagner'
	];
	const message =
		'Hallo zusammen,\n\neure Stelle als Frontend Developer spricht mich sehr an. Ich entwickle seit drei Jahren Webanwendungen mit TypeScript und React und arbeite besonders gerne an verständlichen, zugänglichen Oberflächen.\n\nZuletzt habe ich gemeinsam mit einem kleinen Produktteam ein Kundenportal von der ersten Idee bis zur Veröffentlichung begleitet. Ich würde meine Erfahrung gerne bei euch einbringen und mehr über eure Projekte erfahren.\n\nViele Grüße\nMara';
	await db
		.insert(applications)
		.values(
			names.map((name, index) => ({
				jobId: demoJobId,
				name,
				email: `${emails[index]}@beispiel.de`,
				message: index === 0 ? message : 'Ich freue mich darauf, euer Team kennenzulernen.',
				status:
					index < 3 ? ('new' as const) : index < 6 ? ('invited' as const) : ('rejected' as const),
				createdAt: new Date(times[index])
			}))
		)
		.onConflictDoNothing();
	for (const [id, total, newCount] of [
		[data[1].id, 5, 1],
		[data[2].id, 2, 1],
		[data[3].id, 3, 0]
	] as const) {
		await db
			.insert(applications)
			.values(
				Array.from({ length: total }, (_, i) => ({
					jobId: id,
					name: `Beispielbewerber ${i + 1}`,
					email: `demo${i}@beispiel.de`,
					message: 'Ich interessiere mich für diese Stelle.',
					status: i < newCount ? ('new' as const) : ('invited' as const)
				}))
			)
			.onConflictDoNothing();
	}
	console.log(
		'Demodaten angelegt. Login: lea@beispiel.de oder tom@beispiel.de. Passwort siehe README.'
	);
} finally {
	await pool.end();
}
