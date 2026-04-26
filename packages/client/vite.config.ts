import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH || '/',
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
  // server: {
  //   proxy: {
  //     '/graphql': {
  //       target: 'http://localhost:3000',
  //     },
  //     // Only proxy the API endpoint, not the SPA route `/chat/:name`
  //     '/chat/send': {
  //       target: 'http://localhost:3000',
  //     },
  //   },
  // },

  ...(mode === 'development'
    ? {
        server: {
          proxy: {
            '/graphql': {
              target: 'http://localhost:3000',
            },
            '/chat/send': {
              target: 'http://localhost:3000',
            },
          },
        },
      }
    : {}),
}))
