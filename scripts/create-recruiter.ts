import { db, pool } from '../src/lib/server/db/index.ts';
import { createRecruiter } from './accounts.ts';
try {
	const [email, name] = process.argv.slice(2);
	if (!email || !name || !process.env.RECRUITER_PASSWORD)
		throw new Error('Usage: RECRUITER_PASSWORD=… npm run recruiter:create -- email "Name"');
	await createRecruiter(db, { email, name, password: process.env.RECRUITER_PASSWORD });
	console.log(
		'Recruiter-Konto vorhanden und sofort nutzbar. Keine E-Mail-Verifikation erforderlich.'
	);
} finally {
	await pool.end();
}
