<script lang="ts">
	let { text }: { text: string } = $props();
	const blocks = $derived(text.split(/\n\s*\n/));
</script>

{#each blocks as block, index (index)}
	{@const lines = block.split('\n')}
	{#if lines.length > 1}<section class="description-section">
			<h2>{lines[0].replace(/^##\s*/, '')}</h2>
			<p>{lines.slice(1).join('\n')}</p>
		</section>
	{:else}<p class:description-intro={index === 0} class="description-paragraph">{block}</p>{/if}
{/each}
