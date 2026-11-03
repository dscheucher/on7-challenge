<script lang="ts">
	import BackLink from '#lib/components/BackLink.svelte';
	import JobForm from '#lib/components/JobForm.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Stelle bearbeiten · Jobboard</title></svelte:head>
<main id="main" class="editor-main">
	<BackLink href="/recruiter/jobs" label="Meine Stellen" />
	<h1 class="editor-title">Stelle bearbeiten</h1>
	<JobForm initial={data.job} values={form?.values} errors={form?.errors} editing />
	<p class="editor-note">Titel, Beschreibung und Status sind erforderlich.</p>
</main>
