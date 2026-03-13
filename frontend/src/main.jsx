import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './config/msalConfig.js';
import App from './App.jsx';

// Initialize the MSAL instance before rendering.
// NOTE: StrictMode is intentionally removed. MSAL's handleRedirectPromise is
// consumed on first call; React StrictMode's double-mount causes the second
// call to return null, which triggers the "no result → navigate to /" fallback.
msalInstance.initialize().then(() => {
  createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </BrowserRouter>
  );
});


