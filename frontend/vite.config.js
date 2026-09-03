import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://127.0.0.1:8000',
      '/predict': 'http://127.0.0.1:8000',
      '/claims': 'http://127.0.0.1:8000',
      '/payers': 'http://127.0.0.1:8000',
      '/outcomes': 'http://127.0.0.1:8000',
      '/metrics': 'http://127.0.0.1:8000',
      '/simulate': 'http://127.0.0.1:8000'
    }
  }
})
