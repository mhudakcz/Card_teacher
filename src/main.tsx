import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';
import { App } from './app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA: registrace service workeru jen v produkci (v devu by cache překážela).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* offline podpora je nepovinná */
    });
  });
}
