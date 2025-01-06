import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/migrate.ts"),
      name: "Migrate",
      fileName: "migrate",
      formats: ["es", "cjs", "umd"],
    },
  },
  test: {
    browser: {
      enabled: true,
      name: "chrome",
      provider: "webdriverio",
      // https://webdriver.io
      providerOptions: {},
    },
  },
});
