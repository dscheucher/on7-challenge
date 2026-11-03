<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ChevronRight } from '@lucide/svelte';
	import Button from '#lib/components/Button.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Notice from '#lib/components/Notice.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { formatDate } from '#lib/format.ts';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const status = $derived(page.url.searchParams.get('status'));
	const visible = $derived(data.jobs.filter((job) => !status || job.status === status));
</script>

<svelte:head><title>Meine Stellen · Jobboard</title></svelte:head>
<main id="main" class="container recruiter-main">
	<header class="page-heading">
		<div>
			<h1>Meine Stellen</h1>
			<p class="desktop-copy">Verwalte deine Anzeigen und die dazugehörigen Bewerbungen.</p>
			<p class="mobile-copy">Deine Anzeigen und Bewerbungen im Überblick.</p>
		</div>
		<Button href="/recruiter/jobs/new">Neue Stelle</Button>
	</header>
	{#if page.url.searchParams.has('saved')}<Notice title="Stelle gespeichert" kind="success" />{/if}
	<nav class="tabs" aria-label="Stellenstatus filtern">
		{#each [[null, 'Alle'], ['open', 'Offen'], ['closed', 'Geschlossen']] as [value, label] (label)}<a
				class="tab"
				class:selected={status === value}
				aria-current={status === value ? 'page' : undefined}
				href={resolve('/recruiter/jobs') + (value ? `?status=${value}` : '')}
				>{label}&nbsp;&nbsp;{data.jobs.filter((job) => !value || job.status === value).length}</a
			>{/each}
	</nav>
	{#if visible.length}<div class="panel jobs-table">
			<table>
				<colgroup
					><col /><col style="width:144px" /><col style="width:194px" /><col
						style="width:286px"
					/></colgroup
				><thead><tr><th>Stelle</th><th>Status</th><th>Bewerbungen</th><th>Aktionen</th></tr></thead
				><tbody
					>{#each visible as job (job.id)}<tr
							><td
								><a
									href={resolve('/recruiter/jobs/[id]/applications', { id: job.id })}
									class="job-table-title"
									><strong>{job.title}</strong><span>{formatDate(job.createdAt)}</span></a
								></td
							><td><Badge status={job.status} /></td><td
								><div class="application-count">
									<span>{job.applicationCount} gesamt</span>{#if job.newCount}<strong
											>{job.newCount} neu</strong
										>{/if}
								</div></td
							><td
								><div class="table-actions">
									<a href={resolve('/recruiter/jobs/[id]/applications', { id: job.id })}
										>Bewerbungen</a
									><a href={resolve('/recruiter/jobs/[id]/edit', { id: job.id })}>Bearbeiten</a
									><ChevronRight size={16} />
								</div></td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<div class="mobile-job-list">
			{#each visible as job (job.id)}<article class="panel own-job-card">
					<div class="own-job-card-top">
						<Badge status={job.status} /><time>{formatDate(job.createdAt)}</time>
					</div>
					<h2>{job.title}</h2>
					<p>{job.applicationCount} Bewerbungen, davon {job.newCount} neu</p>
					<div class="form-actions">
						<Button href={resolve('/recruiter/jobs/[id]/applications', { id: job.id })}
							>Bewerbungen</Button
						><Button href={resolve('/recruiter/jobs/[id]/edit', { id: job.id })} variant="secondary"
							>Bearbeiten</Button
						>
					</div>
				</article>{/each}
		</div>
	{:else}<EmptyState
			title={data.jobs.length ? 'Keine Stellen mit diesem Status' : 'Noch keine eigenen Stellen'}
			message={data.jobs.length
				? 'Wähle einen anderen Filter.'
				: 'Lege deine erste Stelle an und erhalte Bewerbungen.'}
			href={data.jobs.length ? undefined : '/recruiter/jobs/new'}
			action="Erste Stelle erstellen"
		/>{/if}
	<p class="helper-text desktop-copy">
		Es werden nur deine eigenen Stellen und Bewerbungen angezeigt.
	</p>
	<p class="helper-text mobile-copy">Angemeldet als {data.user?.email}</p>
</main>

<style>
	.mobile-copy {
		display: none;
	}
	@media (max-width: 767px) {
		.desktop-copy {
			display: none;
		}
		.mobile-copy {
			display: block;
		}
	}
</style>
