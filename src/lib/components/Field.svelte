<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	let {
		name,
		label,
		value = '',
		placeholder = '',
		error,
		multiline = false,
		type = 'text',
		autocomplete,
		maxlength,
		height = 136,
		required = true
	}: {
		name: string;
		label: string;
		value?: string;
		placeholder?: string;
		error?: string;
		multiline?: boolean;
		type?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		maxlength?: number;
		height?: number;
		required?: boolean;
	} = $props();
</script>

<div class="field">
	<label for={name}>{label}</label>
	{#if multiline}<textarea
			id={name}
			{name}
			{placeholder}
			{maxlength}
			{required}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${name}-error` : undefined}
			style:height="{height}px">{value}</textarea
		>
	{:else}<input
			id={name}
			{name}
			{type}
			{value}
			{placeholder}
			{autocomplete}
			{maxlength}
			{required}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${name}-error` : undefined}
		/>{/if}
	{#if error}<p class="field-error" id="{name}-error">{error}</p>{/if}
</div>
