import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// estoy configurando el servidor de desarrollo para que proxy las solicitudes a la API del backend, esto es necesario para evitar problemas de CORS y para que el cliente pueda comunicarse con el servidor sin problemas durante el desarrollo
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        credentials: true,
      },
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        credentials: true,
      },
    },
  },
})