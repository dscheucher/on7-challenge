const date = new Intl.DateTimeFormat('de-DE', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'Europe/Madrid'
});
const time = new Intl.DateTimeFormat('de-DE', {
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Europe/Madrid'
});
export const formatDate = (value: Date | string) => date.format(new Date(value));
export const formatTime = (value: Date | string) => time.format(new Date(value));
export function relativeDate(value: Date | string) {
	const nowDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
	const thenDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(
		new Date(value)
	);
	const days = Math.round((Date.parse(nowDay) - Date.parse(thenDay)) / 86400000);
	return days === 0
		? 'Heute veröffentlicht'
		: days === 1
			? 'Gestern veröffentlicht'
			: days > 1 && days < 14
				? `Vor ${days} Tagen`
				: formatDate(value);
}

export function applicationDate(value: Date | string) {
	const day = (date: Date) =>
		new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(date);
	const days = Math.round(
		(Date.parse(day(new Date())) - Date.parse(day(new Date(value)))) / 86400000
	);
	const label =
		days === 0
			? 'Heute'
			: days === 1
				? 'Gestern'
				: new Intl.DateTimeFormat('de-DE', {
						day: 'numeric',
						month: 'long',
						timeZone: 'Europe/Madrid'
					}).format(new Date(value));
	return label + ', ' + formatTime(value);
}
