import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  borderRadius: '8px',
                  background: '#1E3A3A',
                  color: '#ffffff',
                },
                success: {
                  iconTheme: { primary: '#D4AF37', secondary: '#1E3A3A' },
                  style: { background: '#1E3A3A', color: '#ffffff' },
                },
                error: {
                  iconTheme: { primary: '#B85C4B', secondary: '#ffffff' },
                  style: { background: '#1E3A3A', color: '#ffffff' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
