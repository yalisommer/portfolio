import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/portfolio/',  // Add this line for GitHub Pages
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shark-tracker': path.resolve(__dirname, 'src/Pages/Shark-Tracker/shark_tracker_frontend/src')
    }
  }
})