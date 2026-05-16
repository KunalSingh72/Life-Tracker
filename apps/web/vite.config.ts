import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      "@life-tracker/types": path.resolve(
        __dirname,
        "../../packages/types/src"
      ),

      "@life-tracker/utils": path.resolve(
        __dirname,
        "../../packages/utils/src"
      ),

      "@life-tracker/validation": path.resolve(
        __dirname,
        "../../packages/validation/src"
      ),

      "@life-tracker/config": path.resolve(
        __dirname,
        "../../packages/config/src"
      ),
    },
  },
});