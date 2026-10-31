import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against a production build (`npm run build` first).
 * Admin tests log in with throwaway credentials that exist only for this
 * local test server — they are not the production admin login.
 */
const PORT = 3123;
export const MOCK_PORT = 3124;
export const MOCK = `http://localhost:${MOCK_PORT}`;
export const TEST_ADMIN = { username: "e2e-admin", password: "e2e-password-local-only" };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Production Vercel Analytics script 404s locally — not a site bug.
  },
  webServer: [
    {
      // Stand-ins for Cloudinary + Resend so uploads and emails run end to end
      command: `node e2e/mock-services.mjs`,
      url: `${MOCK}/__requests`,
      reuseExistingServer: false,
      env: { MOCK_PORT: String(MOCK_PORT) },
    },
    {
      command: `npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ADMIN_USERNAME: TEST_ADMIN.username,
        ADMIN_PASSWORD: TEST_ADMIN.password,
        ADMIN_SESSION_SECRET: "e2e-session-secret-local-only-0123456789abcdef",
        CLOUDINARY_CLOUD_NAME: "e2e-cloud",
        CLOUDINARY_UPLOAD_PRESET: "e2e-preset",
        CLOUDINARY_API_BASE: MOCK,
        RESEND_API_KEY: "re_e2e_local_only",
        RESEND_BASE_URL: MOCK,
      },
    },
  ],
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Phone-sized Chromium with touch (Pixel 7 profile)
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
