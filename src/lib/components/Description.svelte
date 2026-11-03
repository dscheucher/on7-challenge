<script lang="ts">
	let { text }: { text: string } = $props();
	const blocks = $derived(text.split(/\n\s*\n/));
</script>

{#each blocks as block, index (index)}
	{@const lines = block.split('\n')}
	{@const heading = /^##\s+(.+)$/.exec(lines[0])}
	{#if heading}<section class="description-section">
			<h2>{heading[1]}</h2>
			{#if lines.length > 1}<p>{lines.slice(1).join('\n')}</p>{/if}
		</section>
	{:else}<p class:description-intro={index === 0} class="description-paragraph">{block}</p>{/if}
{/each}
