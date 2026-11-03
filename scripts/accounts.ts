import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import type { Database } from '../src/lib/server/db/index.ts';
import { account, user } from '../src/lib/server/db/auth-schema.ts';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export async function createRecruiter(
	db: Database,
	input: { email: string; name: string; password: string }
) {
	const data = z
		.object({
			email: z.string().trim().toLowerCase().email(),
			name: z.string().trim().min(1).max(120),
			password: z.string().min(8).max(128)
		})
		.parse(input);
	const id = randomUUID();
	const password = await hashPassword(data.password);
	return db.transaction(async (tx) => {
		const [existing] = await tx
			.select({ id: user.id })
			.from(user)
			.where(eq(user.email, data.email));
		if (existing) return existing;
		await tx.insert(user).values({ id, email: data.email, name: data.name, emailVerified: false });
		await tx
			.insert(account)
			.values({ id: randomUUID(), userId: id, accountId: id, providerId: 'credential', password });
		return { id };
	});
}
