import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { store, persistor } from './store';
import { lightTheme } from './theme';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Import i18n (must be imported before App)
import './i18n';

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress size={48} />
  </Box>
);

// Root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create React root
const root = ReactDOM.createRoot(rootElement);

// Render app with all providers
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={<LoadingFallback />} persistor={persistor}>
          <BrowserRouter>
            <ThemeProvider theme={lightTheme}>
              <CssBaseline />
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <App />
                </Suspense>
              </ErrorBoundary>
            </ThemeProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}
