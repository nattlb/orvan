
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './styles/orvan.css';
import './styles/accesibilidad.css';

import App from './App';
import { PrefsProvider } from './context/PrefsContext';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter
    basename={process.env.NODE_ENV === 'production' ? '/orvan' : '/'}
  >
    <PrefsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PrefsProvider>
  </BrowserRouter>
);
