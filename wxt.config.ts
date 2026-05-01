import { defineConfig } from "wxt";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  manifest: {
    name: "__MSG_appName__",
    description: "__MSG_appDesc__",
    default_locale: "zh_CN",
    version: "0.0.3",
    permissions: ["storage", "bookmarks", "favicon"],
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
      512: "icons/icon-512.png",
    },
    action: {
      default_title: "__MSG_appTitle__",
    },
    web_accessible_resources: [
      {
        resources: ["_favicon/*"],
        matches: ["<all_urls>"],
      },
    ],
  },
  vite: () => ({
    plugins: [vue(), vuetify({ autoImport: true })],
  }),
});
