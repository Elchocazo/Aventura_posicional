import fs from 'fs';
import path from 'path';

const distIndex = path.resolve('dist/index.html');
if (fs.existsSync(distIndex)) {
  let content = fs.readFileSync(distIndex, 'utf8');
  content = content.replace(/type="module"/g, 'defer');
  content = content.replace(/crossorigin/g, '');
  fs.writeFileSync(distIndex, content, 'utf8');
  console.log('✅ Android index.html fixed: type="module" and crossorigin removed for Android WebView compatibility!');
}
