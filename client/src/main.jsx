import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { PharmacyProvider } from './context/PharmacyContext';
import ErrorBoundary from './components/ErrorBoundary';
import 'leaflet/dist/leaflet.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              <PharmacyProvider>
                <App />
              </PharmacyProvider>
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

