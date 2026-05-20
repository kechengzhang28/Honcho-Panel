import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8000";
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(",").map((h) => h.trim())
    : ["localhost", ".local"];

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    define: {
      // @honcho-ai/sdk 在浏览器中引用 process.env，需要 polyfill
      "process.env": JSON.stringify({}),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "0.0.0"),
    },
  };
});
