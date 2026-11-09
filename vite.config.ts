import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@astryxdesign')) return 'astryx'
          if (id.includes('node_modules/lucide-react')) return 'icons'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/'))
            return 'react'
        },
      },
    },
  },
})
