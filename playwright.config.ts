import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:5179', viewport: { height: 900, width: 1440 } },
  webServer: { command: 'npx vite --port 5179 --strictPort', reuseExistingServer: true, url: 'http://localhost:5179' },
});
