<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		children,
		href,
		variant = 'primary',
		type = 'button',
		disabled = false,
		full = false
	}: {
		children: Snippet;
		href?: string;
		variant?: 'primary' | 'secondary';
		type?: 'button' | 'submit';
		disabled?: boolean;
		full?: boolean;
	} = $props();
</script>

{#if href}<a class="button {variant}" class:full {href}>{@render children()}</a>{:else}<button
		class="button {variant}"
		class:full
		{type}
		{disabled}>{@render children()}</button
	>{/if}
