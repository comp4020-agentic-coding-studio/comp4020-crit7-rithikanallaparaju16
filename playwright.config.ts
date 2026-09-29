import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

const port = 4399;

// Real-browser checks of what jsdom can't see: layout, visibility, scrolling.
// Runs the built server (like spec/) on a throwaway database, in installed Chrome.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, channel: "chrome" },
  webServer: {
    command: "node dist/server/entry.mjs",
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    env: {
      HOST: "127.0.0.1",
      PORT: String(port),
      DATABASE_PATH: join(mkdtempSync(join(tmpdir(), "e2e-db-")), "test.db"),
    },
  },
});
