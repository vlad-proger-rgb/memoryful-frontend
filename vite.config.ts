import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    // Vditor fetches its parser, i18n and renderers at runtime from `cdn`; serve them ourselves.
    viteStaticCopy({
      targets: [
        { src: 'node_modules/vditor/dist/{js,css}', dest: 'vditor/dist', rename: { stripBase: 3 } },
      ],
    }),
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '^/(auth|days|months|countries|cities|insights|tags|trackables|trackable-types|storage|workspaces|week-digests|ai)/':
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
