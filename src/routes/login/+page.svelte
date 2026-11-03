<script lang="ts">
	import { enhance } from '$app/forms';
	import { Eye, EyeOff } from '@lucide/svelte';
	import Field from '#lib/components/Field.svelte';
	import Notice from '#lib/components/Notice.svelte';
	import BackLink from '#lib/components/BackLink.svelte';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
	let showPassword = $state(false),
		pending = $state(false),
		networkError = $state(false);
</script>

<svelte:head><title>Recruiter-Login · Jobboard</title></svelte:head>
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
			<h1>Recruiter-Login</h1>
			<p>Verwalte deine Stellen und Bewerbungen.</p>
		</div>
		{#if form?.message || networkError}<Notice
				kind="error"
				title="Anmeldung nicht möglich"
				message={networkError
					? 'Die Verbindung ist unterbrochen. Bitte versuche es erneut.'
					: form?.message}
			/>{/if}
		<Field
			name="email"
			label="E-Mail-Adresse"
			type="email"
			placeholder="name@beispiel.de"
			value={form?.email ?? ''}
			autocomplete="username"
		/>
		<div class="field">
			<label for="password">Passwort</label>
			<div class="password-control">
				<input
					id="password"
					name="password"
					type={showPassword ? 'text' : 'password'}
					autocomplete="current-password"
					required
					maxlength={128}
				/><button
					type="button"
					aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
					onclick={() => (showPassword = !showPassword)}
					>{#if showPassword}<EyeOff size={20} />{:else}<Eye size={20} />{/if}</button
				>
			</div>
		</div>
		<button type="submit" class="button primary full submit-button" disabled={pending}
			>{pending ? 'Wird angemeldet …' : 'Anmelden'}</button
		>
	</form>
	<div class="desktop-login-back">
		<BackLink href="/jobs" label="Zur öffentlichen Stellenübersicht" />
	</div>
	<div class="mobile-login-back"><BackLink href="/jobs" label="Zur Stellenübersicht" /></div>
</main>
