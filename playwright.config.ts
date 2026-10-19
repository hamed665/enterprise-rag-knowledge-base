import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './browser-tests', forbidOnly: !!process.env.CI, reporter: 'list', use: { baseURL: 'http://127.0.0.1:3195' }, webServer: { command: 'pnpm start --port 3195', url: 'http://127.0.0.1:3195', timeout: 30000 } })
