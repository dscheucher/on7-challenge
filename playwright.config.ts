import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';
export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		timezoneId: 'Europe/Madrid',
		locale: 'de-DE'
	},
	projects: [
		{
			name: 'desktop',
			testMatch: 'e2e/**/*.spec.ts',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1100 } }
		},
		{
			name: 'mobile',
			testMatch: 'e2e/**/*.spec.ts',
			use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }
		}
	],
	webServer: {
		command: 'npm run build && npm run start',
		url: `${baseURL}/health`,
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: { PORT: '4173', HOST: '127.0.0.1' }
	}
});
