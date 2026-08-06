import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Función para eliminar el cargador de index.html
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader && loader.parentNode) {
    loader.parentNode.removeChild(loader);
  }
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  // Eliminamos el cargador justo antes de renderizar
  removeInitialLoader();
  root.render(<App />);
}
