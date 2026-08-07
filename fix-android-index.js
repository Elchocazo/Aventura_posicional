import fs from 'fs';
import path from 'path';

// 1. Corregir index.html para Android WebView
const distIndex = path.resolve('dist/index.html');
if (fs.existsSync(distIndex)) {
  let content = fs.readFileSync(distIndex, 'utf8');
  content = content.replace(/ crossorigin/g, '');
  fs.writeFileSync(distIndex, content, 'utf8');
  console.log('✅ Android index.html fixed: solo se elimino crossorigin, type="module" conservado para import.meta');
}

// 2. Eliminar dist/fichas para mantener el bundle .aab ultra liviano (menos de 5 MB vs 680 MB)
const distFichas = path.resolve('dist/fichas');
if (fs.existsSync(distFichas)) {
  fs.rmSync(distFichas, { recursive: true, force: true });
  console.log('⚡ dist/fichas removido con éxito: El paquete Android (.aab) ahora pesa ~4 MB para pasar el límite de 500 MB en Google Play.');
}
