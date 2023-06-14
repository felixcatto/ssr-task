import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { loadEnv } from './devUtils.js';

loadEnv();

const config = defineConfig({
  publicDir: 'server/public',
  build: { outDir: 'dist/public' },
  server: { port: Number(process.env.DEV_SERVER_PORT) },
  plugins: [react()],
});

export default config;
