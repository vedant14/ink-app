import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true,
    hmr: {
      clientPort: 443, // For secure (https) ngrok tunnels
    }, allowedHosts: [
      '.ngrok-free.app'
    ]
  },
  ssr: {
    external: ["@napi-rs/canvas"],
  },
  build: {
    rollupOptions: {
      external: ["@napi-rs/canvas", "path", "fs", "os", "util", "stream", "url", "https", "http", "child_process"],
    },
  },
});
