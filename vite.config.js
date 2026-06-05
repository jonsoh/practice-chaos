import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The repo is served from https://<user>.github.io/practice-chaos/
// so all asset URLs need that prefix.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/practice-chaos/',
})
