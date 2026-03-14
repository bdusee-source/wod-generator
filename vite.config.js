import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/crossfit/', // uncomment voor GitHub Pages (repo subfolder)
    build: {
      outDir: 'dist',
    },
    server: {
      proxy: {
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const key = env.ANTHROPIC_API_KEY || ''
              if (!key) {
                console.warn('[proxy] Waarschuwing: ANTHROPIC_API_KEY is niet ingesteld in .env')
              }
              proxyReq.setHeader('x-api-key', key)
              proxyReq.setHeader('anthropic-version', '2023-06-01')
              // Verwijder origin header — Anthropic accepteert geen browser origins
              proxyReq.removeHeader('origin')
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Log non-200 responses voor debugging
              if (proxyRes.statusCode !== 200) {
                console.error(`[proxy] Anthropic API antwoordde met ${proxyRes.statusCode}`)
              }
            })
            proxy.on('error', (err) => {
              console.error('[proxy] Proxy fout:', err.message)
            })
          },
        },
      },
    },
  }
})
