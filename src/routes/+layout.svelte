<script lang="ts">
	import '@fontsource-variable/manrope';
	import '#lib/styles/tokens.css';
	import '#lib/styles/app.css';
	import Header from '#lib/components/Header.svelte';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#F5F7FB" />
</svelte:head>

<div class="site-shell" class:detail-shell={page.url.pathname.startsWith('/jobs/')}>
	<a class="skip-link" href="#main">Zum Inhalt</a>
	<Header user={data.user} />
	{@render children()}
	{#if page.url.pathname.startsWith('/jobs')}<footer class="site-footer">
			<div class="container">
				<strong>Jobboard</strong><span>Offene Stellen. Direkte Bewerbung.</span>
			</div>
		</footer>{/if}
</div>
