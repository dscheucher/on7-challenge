<script lang="ts">
	import { enhance } from '$app/forms';
	import { CircleCheck } from '@lucide/svelte';
	import BackLink from '#lib/components/BackLink.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Field from '#lib/components/Field.svelte';
	import Button from '#lib/components/Button.svelte';
	import Notice from '#lib/components/Notice.svelte';
	import Description from '#lib/components/Description.svelte';
	import { formatDate } from '#lib/format.ts';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let pending = $state(false);
	let networkError = $state(false);
	const values = $derived(form && 'values' in form ? form.values : undefined);
	const errors = $derived(form && 'errors' in form ? form.errors : undefined);
	const closed = $derived(
		data.job.status === 'closed' || (form && 'closed' in form && form.closed)
	);
</script>

<svelte:head><title>{data.job.title} · Jobboard</title></svelte:head>
<main id="main" class="container detail-main">
	<BackLink href="/jobs" label="Alle Stellen" />
	<div class="detail-columns">
		<article class="job-description">
			<header class="job-heading">
				<Badge status={closed ? 'closed' : 'open'} />
				<h1>{data.job.title}</h1>
				<p class="published">Veröffentlicht am {formatDate(data.job.createdAt)}</p>
			</header>
			<Description text={data.job.description} />
		</article>
		{#if form && 'success' in form && form.success}<section
				class="panel application-success"
				role="status"
			>
				<CircleCheck size={36} />
				<h2>Deine Bewerbung wurde übermittelt.</h2>
				<p>Für {data.job.title}. Eine Rückmeldung erhältst du unter {form.email}.</p>
				<Button href="/jobs" variant="secondary">Weitere Stellen ansehen</Button>
			</section>
		{:else if closed}<section class="panel application-success">
				<Badge status="closed" />
				<h2>Diese Stelle ist bereits geschlossen.</h2>
				<p>Für diese Stelle sind keine neuen Bewerbungen mehr möglich.</p>
				<Button href="/jobs" variant="secondary">Offene Stellen ansehen</Button>
			</section>
		{:else}<form
				method="POST"
				class="panel apply-form"
				novalidate
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
				<div class="form-heading">
					<h2>Jetzt bewerben</h2>
					<p>Direkt und ohne Konto. Alle Felder sind erforderlich.</p>
				</div>
				{#if form && 'message' in form && form.message}<Notice
						kind="error"
						title="Bewerbung nicht gesendet"
						message={form.message}
					/>{/if}
				{#if networkError}<Notice
						kind="error"
						title="Bewerbung nicht gesendet"
						message="Die Verbindung ist unterbrochen. Deine Eingaben bleiben erhalten. Versuche es erneut."
					/>{/if}
				<Field
					name="name"
					label="Name"
					placeholder="Vor- und Nachname"
					autocomplete="name"
					value={String(values?.name ?? '')}
					error={errors?.name}
					maxlength={120}
				/>
				<Field
					name="email"
					label="E-Mail-Adresse"
					type="email"
					placeholder="name@beispiel.de"
					autocomplete="email"
					value={String(values?.email ?? '')}
					error={errors?.email}
					maxlength={254}
				/>
				<Field
					name="message"
					label="Kurze Nachricht"
					placeholder="Was sollten wir über dich wissen?"
					multiline
					height={160}
					value={String(values?.message ?? '')}
					error={errors?.message}
					maxlength={2000}
				/>
				<button type="submit" class="button primary full submit-button" disabled={pending}
					>{pending
						? 'Wird gesendet …'
						: networkError
							? 'Erneut senden'
							: 'Bewerbung absenden'}</button
				>
				<p class="form-note">Eine Rückmeldung erhältst du per E-Mail.</p>
			</form>{/if}
	</div>
</main>
