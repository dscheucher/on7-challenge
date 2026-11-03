import { z } from 'zod';

export const jobInput = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Bitte gib einen Titel ein.')
		.max(160, 'Der Titel darf höchstens 160 Zeichen lang sein.'),
	description: z
		.string()
		.trim()
		.min(1, 'Bitte ergänze eine Beschreibung.')
		.max(20000, 'Die Beschreibung ist zu lang.'),
	status: z.enum(['open', 'closed'], { error: 'Bitte wähle einen gültigen Status.' })
});
export const applicationInput = z.object({
	name: z.string().trim().min(1, 'Bitte gib deinen Namen ein.').max(120, 'Der Name ist zu lang.'),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.max(254)
		.email('Bitte gib eine gültige E-Mail-Adresse ein.'),
	message: z
		.string()
		.trim()
		.min(1, 'Bitte ergänze eine kurze Nachricht.')
		.max(2000, 'Die Nachricht darf höchstens 2.000 Zeichen lang sein.')
});
export const statusInput = z.enum(['new', 'invited', 'rejected']);
export const idInput = z.uuid();
export const loginInput = z.object({
	email: z.string().trim().toLowerCase().email(),
	password: z.string().min(1).max(128)
});
export const registrationInput = z.object({
	name: z.string().trim().min(1, 'Bitte gib deinen Namen ein.').max(120, 'Der Name ist zu lang.'),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.max(254, 'Die E-Mail-Adresse ist zu lang.')
		.email('Bitte gib eine gültige E-Mail-Adresse ein.'),
	password: z
		.string()
		.min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
		.max(128, 'Das Passwort darf höchstens 128 Zeichen lang sein.')
});
export function fieldErrors(error: z.ZodError) {
	return Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]));
}
