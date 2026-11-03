<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { LogOut } from '@lucide/svelte';
	import Button from './Button.svelte';
	let { user }: { user: { name: string; email: string } | null } = $props();
	const recruiter = $derived(page.url.pathname.startsWith('/recruiter'));
	const login = $derived(['/login', '/register'].includes(page.url.pathname));
</script>

<header class="site-header" class:recruiter-header={recruiter}>
	<nav class="container nav-inner" aria-label="Hauptnavigation">
		<div class="brand-group">
			<a class="wordmark" href={resolve('/jobs')}>Jobboard</a>{#if recruiter}<span
					class="recruiting-label">Recruiting</span
				><a class="active own-jobs-link" href={resolve('/recruiter/jobs')}>Meine Stellen</a>{/if}
		</div>
		{#if recruiter}<div class="account-nav">
				<span class="account-email">{user?.email}</span>
				<form method="POST" action="/logout">
					<button type="submit" class="logout-button">Abmelden<LogOut size={18} /></button>
				</form>
			</div>
		{:else if !login}<div class="public-nav">
				<a class="active jobs-nav-link" href={resolve('/jobs')}>Offene Stellen</a><Button
					href="/login"
					variant="secondary">Recruiter-Login</Button
				>
			</div>{/if}
	</nav>
</header>
