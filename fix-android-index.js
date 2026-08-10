import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Sincronizar archivos compilados dist/ hacia el proyecto nativo de Android
try {
  console.log('📲 Sincronizando archivos compilados con Android...');
  execSync('npx cap copy android', { stdio: 'inherit' });
} catch (e) {
  console.error('Error al sincronizar con Capacitor:', e);
}

// 2. Corregir index.html para Android WebView nativo
const androidIndex = path.resolve('android/app/src/main/assets/public/index.html');
if (fs.existsSync(androidIndex)) {
  let content = fs.readFileSync(androidIndex, 'utf8');
  content = content.replace(/ crossorigin/g, '');
  fs.writeFileSync(androidIndex, content, 'utf8');
  console.log('✅ Android index.html fixed: solo se elimino crossorigin, type="module" conservado para import.meta');
}

// 3. Eliminar fichas pesadas de Android assets para mantener el bundle .aab ultra liviano (~4 MB)
const androidFichas = path.resolve('android/app/src/main/assets/public/fichas');
if (fs.existsSync(androidFichas)) {
  fs.rmSync(androidFichas, { recursive: true, force: true });
  console.log('⚡ android/fichas removido con éxito: El paquete Android (.aab) pesa ~4 MB.');
}
