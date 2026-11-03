<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowUpRight } from '@lucide/svelte';
	import Badge from './Badge.svelte';
	import { relativeDate } from '../format.ts';
	let {
		job
	}: { job: { id: string; title: string; description: string; createdAt: Date | string } } =
		$props();
</script>

<a
	href={resolve('/jobs/[id]', { id: job.id })}
	class="job-card"
	aria-label="{job.title} – Stelle ansehen"
>
	<div class="job-card-top"><Badge status="open" /><span>{relativeDate(job.createdAt)}</span></div>
	<h2>{job.title}</h2>
	<p class="job-preview">{job.description.split('\n\n')[0]}</p>
	<span class="job-card-action">Stelle ansehen<ArrowUpRight size={20} /></span>
</a>
