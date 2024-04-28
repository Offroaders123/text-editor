//// @ts-nocheck

// import { defineConfig } from "vite";

export default {
  base: "./",
  build: {
    target: "esnext"
  },
  server: {
    port: 5500,
    strictPort: true
  },
  preview: {
    port: 5500,
    strictPort: true
  }
};