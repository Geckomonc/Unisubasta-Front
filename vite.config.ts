import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, process.cwd(), '')
  const backend = envVars.VITE_API_URL || 'https://codefact.udea.edu.co/unisubastas'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        // Proxy de desarrollo para evitar CORS.
        // En el código se usa `/api/...`; aquí se reenvía a `${backend}/api/...`.
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
        },
        // El backend también expone el endpoint de imágenes en /api/products/images/:id
        // (ya cubierto por la regla anterior).
      },
    },
  }
})
