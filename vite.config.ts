import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createHtmlPlugin({
      template:
        process.env.VITE_SITE_NAME === 'vizshun'
          ? 'index-alt.html'
          : 'index.html',
    }),
    eslintPlugin({
      failOnError: true,
      failOnWarning: false,
    }),
  ],
})
