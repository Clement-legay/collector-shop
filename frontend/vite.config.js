import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        port: 8080,
        proxy: {
            '/api/articles': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/articles/, '/articles')
            },
            '/api/users': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/users/, '/users')
            },
            '/api/payments': {
                target: 'http://localhost:3003',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/payments/, '/payments')
            },
            '/api/fraud': {
                target: 'http://localhost:3004',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/fraud/, '/fraud')
            }
        }
    }
})
