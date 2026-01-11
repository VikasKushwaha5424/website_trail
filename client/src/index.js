import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Note: We do NOT import BrowserRouter here anymore.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);