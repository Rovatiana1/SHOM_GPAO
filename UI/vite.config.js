// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement selon le mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.VITE_PREFIXE_URL || '/',
    server: {
      port: 9090,
      open: true,
      fs: {
        strict: false,
      },
    },
    build: {
      outDir: `build-${mode}`, // ← build-dev, build-test, build-prod
      emptyOutDir: true,
    },
  }
})
