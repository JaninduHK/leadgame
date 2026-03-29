import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { QuizProvider } from './context/QuizContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(10,22,40,0.95)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: '700',
              },
              success: { iconTheme: { primary: '#0DB14B', secondary: '#fff' } },
              error: { iconTheme: { primary: '#F85A40', secondary: '#fff' } },
            }}
          />
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
