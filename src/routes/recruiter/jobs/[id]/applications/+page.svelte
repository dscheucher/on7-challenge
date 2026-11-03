<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Check, ChevronDown } from '@lucide/svelte';
	import BackLink from '#lib/components/BackLink.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Notice from '#lib/components/Notice.svelte';
	import { formatDate, formatTime, applicationDate } from '#lib/format.ts';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let pending = $state(false),
		networkError = $state(false);
	const status = $derived(page.url.searchParams.get('status'));
	const selection = $derived(page.url.searchParams.get('application'));
	const filtered = $derived(data.applications.filter((item) => !status || item.status === status));
	const selected = $derived(filtered.find((item) => item.id === selection) ?? filtered[0]);
	const url = (id?: string, filter: string | null = status) => {
		const params = new SvelteURLSearchParams();
		if (id) params.set('application', id);
		if (filter) params.set('status', filter);
		return `/recruiter/jobs/${data.job.id}/applications${params.size ? '?' + params : ''}` as const;
	};
	const filters = [
		[null, 'Alle'],
		['new', 'Neu'],
		['invited', 'Eingeladen'],
		['rejected', 'Abgelehnt']
	] as const;
</script>

<svelte:head><title>Bewerbungen für {data.job.title} · Jobboard</title></svelte:head>
<main id="main" class="container applications-main" class:has-selection={!!selection}>
	<div class="desktop-back"><BackLink href="/recruiter/jobs" label="Meine Stellen" /></div>
	<div class="mobile-back"><BackLink href={url(undefined)} label="Bewerbungen" /></div>
	<header class="page-heading applications-heading">
		<div>
			<h1>{data.job.title}</h1>
			<p>{data.applications.length} Bewerbungen auf deine Stelle</p>
		</div>
		<Badge status={data.job.status} />
	</header>
	{#if selection}<div class="mobile-context">
			<h1>{data.job.title}</h1>
			<Badge status={data.job.status} />
		</div>{/if}
	<nav class="tabs" aria-label="Bewerbungsstatus filtern">
		{#each filters as [value, label] (label)}<a
				class="tab"
				class:selected={status === value}
				href={url(undefined, value)}
				aria-current={status === value ? 'page' : undefined}
				>{label}&nbsp;&nbsp;{data.applications.filter((item) => !value || item.status === value)
					.length}</a
			>{/each}
	</nav>
	<div class="mobile-filter">
		<label for="application-filter">Bewerbungsstatus filtern</label>
		<div class="select-control">
			<select
				id="application-filter"
				value={status ?? ''}
				onchange={(event) => goto(url(undefined, event.currentTarget.value || null))}
				>{#each filters as [value, label] (label)}<option value={value ?? ''}
						>{label === 'Alle' ? 'Alle Bewerbungen' : label} ({data.applications.filter(
							(item) => !value || item.status === value
						).length})</option
					>{/each}</select
			><ChevronDown size={18} />
		</div>
	</div>
	{#if filtered.length}<div class="panel applications-panel">
			<nav class="applicant-list" aria-label="Bewerbungen">
				{#each filtered as item (item.id)}<a
						class="applicant-row"
						class:selected={item.id === selected?.id}
						href={url(item.id)}
						aria-current={item.id === selected?.id ? 'true' : undefined}
						><div class="applicant-row-top">
							<strong>{item.name}</strong><Badge status={item.status} />
						</div>
						<span class="applicant-email">{item.email}</span><span class="applicant-date"
							>{applicationDate(item.createdAt)}</span
						></a
					>{/each}
			</nav>
			{#if selected}<article class="application-detail">
					<header class="applicant-profile">
						<h2>{selected.name}</h2>
						<a href="mailto:{selected.email}">{selected.email}</a>
						<p>
							Eingegangen am {formatDate(selected.createdAt)} um {formatTime(selected.createdAt)}
						</p>
					</header>
					<section class="application-message">
						<h3>Bewerbungsnachricht</h3>
						<p>{selected.message}</p>
					</section>
					<section class="application-status">
						<h3>Bewerbungsstatus</h3>
						<form
							method="POST"
							use:enhance={() => {
								pending = true;
								networkError = false;
								return async ({ result, update }) => {
									pending = false;
									if (result.type === 'error') {
										networkError = true;
										return;
									}
									await update({ reset: false });
								};
							}}
						>
							<input type="hidden" name="applicationId" value={selected.id} />
							<div class="application-status-options">
								{#each [['new', 'Neu'], ['invited', 'Eingeladen'], ['rejected', 'Abgelehnt']] as [value, label] (value)}<button
										type="submit"
										name="status"
										{value}
										disabled={pending}
										class="status-button"
										class:selected={selected.status === value}
										aria-pressed={selected.status === value}
										>{#if selected.status === value}<Check size={16} />{/if}{label}</button
									>{/each}
							</div>
						</form>
						<p aria-live="polite">
							{pending
								? 'Wird gespeichert …'
								: form?.saved
									? 'Status gespeichert.'
									: 'Änderungen werden direkt gespeichert.'}
						</p>
						{#if form?.message || networkError}<Notice
								kind="error"
								title="Status nicht gespeichert"
								message={networkError
									? 'Bitte versuche es erneut. Der bisherige Status bleibt bestehen.'
									: form?.message}
							/>{/if}
					</section>
				</article>{/if}
		</div>
	{:else}<EmptyState
			title={data.applications.length
				? 'Keine Bewerbungen mit diesem Status'
				: 'Noch keine Bewerbungen'}
			message={data.applications.length
				? 'Wähle einen anderen Filter.'
				: 'Für diese Stelle sind noch keine Bewerbungen eingegangen.'}
		/>{/if}
	{#if filtered.length && !selection}<p class="mobile-app-hint">
			Wähle eine Bewerbung, um die Nachricht zu lesen und den Status zu ändern.
		</p>{/if}
</main>
