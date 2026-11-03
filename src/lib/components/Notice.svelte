<script lang="ts">
	import { CircleCheck, CircleAlert, Info } from '@lucide/svelte';
	let {
		title,
		message,
		kind = 'info'
	}: { title: string; message?: string; kind?: 'info' | 'success' | 'error' } = $props();
</script>

<div class="notice {kind}" role={kind === 'error' ? 'alert' : 'status'}>
	{#if kind === 'success'}<CircleCheck size={20} />{:else if kind === 'error'}<CircleAlert
			size={20}
		/>{:else}<Info size={20} />{/if}
	<div>
		<strong>{title}</strong>{#if message}<p>{message}</p>{/if}
	</div>
</div>
