import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Desregistrar cualquier Service Worker heredado para evitar el cacheo de código en desarrollo
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Service Worker desregistrado correctamente.');
          // Recargar la página una vez desregistrado para jalar directamente el contenido nuevo
          window.location.reload();
        }
      });
    }
  });
}

