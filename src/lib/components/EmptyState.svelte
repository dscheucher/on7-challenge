<script lang="ts">
	import { Inbox } from '@lucide/svelte';
	import Button from './Button.svelte';
	let {
		title,
		message,
		href,
		action
	}: { title: string; message: string; href?: string; action?: string } = $props();
</script>

<div class="empty-state">
	<Inbox size={32} />
	<h2>{title}</h2>
	<p>{message}</p>
	{#if href && action}<Button {href}>{action}</Button>{/if}
</div>
