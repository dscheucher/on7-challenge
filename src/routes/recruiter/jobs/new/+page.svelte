<script lang="ts">
	import BackLink from '#lib/components/BackLink.svelte';
	import JobForm from '#lib/components/JobForm.svelte';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<svelte:head><title>Neue Stelle · Jobboard</title></svelte:head>
<main id="main" class="editor-main">
	<BackLink href="/recruiter/jobs" label="Meine Stellen" />
	<h1 class="editor-title">Neue Stelle</h1>
	<JobForm values={form?.values} errors={form?.errors} />
	<p class="editor-note">Titel, Beschreibung und Status sind erforderlich.</p>
</main>
