<script lang="ts">
	import JobCard from '#lib/components/JobCard.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head
	><title>Offene Stellen · Jobboard</title><meta
		name="description"
		content="Entdecke offene Stellen und bewirb dich direkt – ohne Registrierung."
	/></svelte:head
>
<main id="main" class="container public-main">
	<section class="intro">
		<h1>Dein nächster Job<br /> beginnt hier.</h1>
		<p class="desktop-intro">
			Entdecke offene Stellen und bewirb dich direkt – ohne Registrierung.
		</p>
		<p class="mobile-intro">Offene Stellen entdecken und direkt bewerben. Ohne Registrierung.</p>
	</section>
	<div class="list-heading">
		<h2>Offene Stellen</h2>
		<span>{data.jobs.length} {data.jobs.length === 1 ? 'Stelle' : 'Stellen'}</span>
	</div>
	{#if data.jobs.length}<div class="job-grid">
			{#each data.jobs as job (job.id)}<JobCard {job} />{/each}
		</div>{:else}<EmptyState
			title="Keine offenen Stellen"
			message="Aktuell sind keine offenen Stellen verfügbar. Schau später noch einmal vorbei."
		/>{/if}
</main>

<style>
	.mobile-intro {
		display: none;
	}
	@media (max-width: 767px) {
		.desktop-intro {
			display: none;
		}
		.mobile-intro {
			display: block;
		}
	}
</style>
