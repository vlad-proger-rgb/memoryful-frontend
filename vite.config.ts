import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '^/(auth|days|months|countries|cities|insights|suggestions|tags|trackables|trackable-types|storage|workspaces|ai)/':
        {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      // The local MinIO bucket, so default workspace assets are same-origin in dev. Without
      // this they resolve to localhost:9000, which on a phone is the phone itself.
      '^/memoryful/': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
