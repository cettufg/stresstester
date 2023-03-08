import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
dotenv.config();

// https://vitejs.dev/config/
console.log(process.env.FRONTEND_PORT)
export default defineConfig({
  server:{
    port:process.env.FRONTEND_PORT
  },
  plugins: [react()],
})
