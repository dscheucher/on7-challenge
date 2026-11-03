<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/Button.svelte';
</script>

<svelte:head><title>Seite nicht verfügbar · Jobboard</title></svelte:head>
<main id="main" class="container error-page">
	<h1>Seite nicht verfügbar</h1>
	<p>{page.error?.message ?? 'Bitte versuche es später erneut.'}</p>
	<Button href={page.url.pathname.startsWith('/recruiter') ? '/recruiter/jobs' : '/jobs'}
		>Zur Übersicht</Button
	>
</main>
