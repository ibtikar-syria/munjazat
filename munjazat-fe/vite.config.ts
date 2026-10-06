import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const countryStateCity = fileURLToPath(
  new URL('./node_modules/react-country-state-city/dist/esm/index.js', import.meta.url),
)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^react-country-state-city$/,
          replacement: countryStateCity,
        },
      ],
    },
    optimizeDeps: {
      include: ['react-country-state-city'],
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
          timeout: 600_000,
        },
      },
    },
  }
})
