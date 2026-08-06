import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  base: './', // CRÍTICO: Asegura que las rutas sean relativas para Android
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'es2015', // Bajamos la versión para que funcione en móviles antiguos
    modulePreload: false,
    cssCodeSplit: false,
  }
});
