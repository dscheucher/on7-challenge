<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';
	let {
		autocomplete = 'current-password',
		error
	}: { autocomplete?: 'current-password' | 'new-password'; error?: string } = $props();
	let visible = $state(false);
</script>

<div class="field">
	<label for="password">Passwort</label>
	<div class="password-control">
		<input
			id="password"
			name="password"
			type={visible ? 'text' : 'password'}
			{autocomplete}
			required
			maxlength={128}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? 'password-error' : undefined}
		/>
		<button
			type="button"
			aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
			onclick={() => (visible = !visible)}
			>{#if visible}<EyeOff size={20} />{:else}<Eye size={20} />{/if}</button
		>
	</div>
	{#if error}<p class="field-error" id="password-error">{error}</p>{/if}
</div>
