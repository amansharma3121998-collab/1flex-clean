import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ListProvider } from './context/ListContext';
import { ModalProvider } from './context/ModalContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ListProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </ListProvider>
    </AuthProvider>
  </React.StrictMode>
);
