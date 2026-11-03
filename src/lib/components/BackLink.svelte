<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	let { href, label }: { href: string; label: string } = $props();
</script>

<a class="back-link" {href}><ArrowLeft size={16} />{label}</a>
