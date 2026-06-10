import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Actions (Pages deploy) the site is served from
// https://<user>.github.io/practice-chaos/, so assets need that prefix.
// Locally (dev, preview, other hosts) we serve from root.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_ACTIONS ? '/practice-chaos/' : '/'
})
