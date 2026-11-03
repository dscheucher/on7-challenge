<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/components/Field.svelte';
	import PasswordField from '#lib/components/PasswordField.svelte';
	import Notice from '#lib/components/Notice.svelte';
	import BackLink from '#lib/components/BackLink.svelte';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
	let pending = $state(false),
		networkError = $state(false);
	const errors = $derived(form && 'errors' in form ? form.errors : undefined);
</script>

<svelte:head><title>Recruiter-Registrierung · Jobboard</title></svelte:head>
<main id="main" class="login-main">
	<form
		method="POST"
		class="panel login-form"
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
			<h1>Recruiter-Registrierung</h1>
			<p>Erstelle ein Konto und verwalte deine Stellen.</p>
		</div>
		{#if (form && 'message' in form && form.message) || networkError}<Notice
				kind="error"
				title="Registrierung nicht möglich"
				message={networkError
					? 'Die Verbindung ist unterbrochen. Bitte versuche es erneut.'
					: form && 'message' in form
						? form.message
						: undefined}
			/>{/if}
		<Field
			name="name"
			label="Name"
			placeholder="Vor- und Nachname"
			value={form?.values.name ?? ''}
			autocomplete="name"
			maxlength={120}
			error={errors?.name}
		/>
		<Field
			name="email"
			label="E-Mail-Adresse"
			type="email"
			placeholder="name@beispiel.de"
			value={form?.values.email ?? ''}
			autocomplete="email"
			maxlength={254}
			error={errors?.email}
		/>
		<PasswordField autocomplete="new-password" error={errors?.password} />
		<button type="submit" class="button primary full submit-button" disabled={pending}
			>{pending ? 'Konto wird erstellt …' : 'Konto erstellen'}</button
		>
		<p class="auth-switch">Schon ein Konto? <a href="/login">Anmelden</a></p>
	</form>
	<div class="desktop-login-back">
		<BackLink href="/jobs" label="Zur öffentlichen Stellenübersicht" />
	</div>
	<div class="mobile-login-back"><BackLink href="/jobs" label="Zur Stellenübersicht" /></div>
</main>
