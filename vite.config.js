import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/TO-DO-LIST/',  // pridaj tento riadok
  plugins: [react()]
})