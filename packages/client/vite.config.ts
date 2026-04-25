import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/views',
    }),
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
      },
      '/pusher': {
        target: 'http://localhost:3000',
      },
      // Only proxy the API endpoint, not the client route `/chat`.
      '/chat/message': {
        target: 'http://localhost:3000',
      },
    },
  },
})
