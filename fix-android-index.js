import fs from 'fs';
import path from 'path';

const distIndex = path.resolve('dist/index.html');
if (fs.existsSync(distIndex)) {
  let content = fs.readFileSync(distIndex, 'utf8');
  // Solo eliminar 'crossorigin' - NO eliminar type="module"
  // porque el bundle usa import.meta que requiere contexto de módulo ES
  content = content.replace(/ crossorigin/g, '');
  fs.writeFileSync(distIndex, content, 'utf8');
  console.log('✅ Android index.html fixed: solo se elimino crossorigin, type="module" conservado para import.meta');
}
