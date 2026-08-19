import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    base: "/",
    build: {
      sourcemap: isDev,
      minify: !isDev,
      target: "es2020",
      chunkSizeWarningLimit: 2500, // Monaco is a large single chunk by design
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 5173,
      strictPort: false,
    },
    preview: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 4173,
    },
  };
});