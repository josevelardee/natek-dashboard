
import path from "path"
import tailwindcss from '@tailwindcss/vite' // <-- Importación correcta
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/natek-dashboard/", // 👈 importante para GitHub Pages
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})