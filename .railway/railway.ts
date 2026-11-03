import { defineRailway, github, postgres, preserve, project, service, volume } from 'railway/iac';

export default defineRailway(() => {
	const Postgres = postgres('Postgres', { region: 'europe-west4-drams3a' });
	Postgres.networking = { privateNetworkEndpoint: 'postgres' };
	const postgresVolume = volume('postgres-volume', {
		alerts: { usage: { '100': {}, '80': {}, '95': {} } },
		allowOnlineResize: true,
		region: 'europe-west4-drams3a',
		sizeMB: 5000
	});
	const jobboard = service('jobboard', {
		source: github('dscheucher/on7-challenge', { branch: 'main' }),
		build: { builder: 'DOCKERFILE', dockerfilePath: 'Dockerfile' },
		start: 'node build/index.js',
		healthcheck: '/health',
		healthcheckTimeout: 120,
		preDeploy: 'node scripts/migrate.mjs',
		replicas: { 'europe-west4-drams3a': 1 },
		deploy: { restartPolicyType: 'ON_FAILURE', restartPolicyMaxRetries: 3 },
		env: {
			APP_ORIGIN: preserve(),
			BETTER_AUTH_SECRET: preserve(),
			BETTER_AUTH_URL: preserve(),
			DATABASE_URL: Postgres.env.DATABASE_URL,
			HOST: '0.0.0.0',
			PORT: '3000'
		}
	});

	return project('on7-challenge', {
		resources: [jobboard, Postgres, postgresVolume]
	});
});
