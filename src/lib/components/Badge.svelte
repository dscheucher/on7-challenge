<script lang="ts">
	let { status }: { status: 'open' | 'closed' | 'new' | 'invited' | 'rejected' } = $props();
	const labels = {
		open: 'Offen',
		closed: 'Geschlossen',
		new: 'Neu',
		invited: 'Eingeladen',
		rejected: 'Abgelehnt'
	};
</script>

<span class="badge {status}"><span class="status-dot"></span>{labels[status]}</span>
