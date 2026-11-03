<script lang="ts">
	import { Circle, CircleDot } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import Field from './Field.svelte';
	import Button from './Button.svelte';
	import Notice from './Notice.svelte';
	let {
		initial = {},
		values,
		errors,
		editing = false
	}: {
		initial?: { title?: string; description?: string; status?: 'open' | 'closed' };
		values?: Record<string, FormDataEntryValue>;
		errors?: Record<string, string>;
		editing?: boolean;
	} = $props();
	let status = $state(untrack(() => String(values?.status ?? initial.status ?? 'open')));
	let pending = $state(false),
		networkError = $state(false);
</script>

<form
	method="POST"
	class="panel job-form"
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
	{#if networkError}<Notice
			kind="error"
			title="Stelle nicht gespeichert"
			message="Bitte versuche es erneut. Deine Eingaben bleiben erhalten."
		/>{/if}
	<Field
		name="title"
		label="Titel"
		placeholder="z. B. Frontend Developer"
		value={String(values?.title ?? initial.title ?? '')}
		error={errors?.title}
		maxlength={160}
	/>
	<Field
		name="description"
		label="Beschreibung"
		placeholder="Beschreibe Aufgaben, Anforderungen und was euer Team bietet."
		multiline
		height={240}
		value={String(values?.description ?? initial.description ?? '')}
		error={errors?.description}
		maxlength={20000}
	/>
	<fieldset class="status-field">
		<legend>Status</legend>
		<div class="status-options">
			{#each [['open', 'Offen', 'Öffentlich sichtbar. Bewerbungen möglich.'], ['closed', 'Geschlossen', 'Nicht öffentlich. Keine neuen Bewerbungen.']] as [value, label, description] (value)}<label
					class="status-choice"
					class:selected={status === value}
					><span class="status-choice-top"
						><strong>{label}</strong><span class="status-radio"
							><input
								type="radio"
								name="status"
								{value}
								bind:group={status}
							/>{#if status === value}<CircleDot size={18} />{:else}<Circle size={18} />{/if}</span
						></span
					>
					<p>{description}</p></label
				>{/each}
		</div>
		{#if errors?.status}<p class="field-error">{errors.status}</p>{/if}
	</fieldset>
	<div class="form-actions">
		<Button type="submit" disabled={pending}
			>{pending
				? 'Wird gespeichert …'
				: editing
					? 'Änderungen speichern'
					: 'Stelle erstellen'}</Button
		><Button href="/recruiter/jobs" variant="secondary">Abbrechen</Button>
	</div>
</form>
