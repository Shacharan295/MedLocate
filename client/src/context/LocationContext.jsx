import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

// Default coordinates: Chennai Central, India
const DEFAULT_COORDINATES = {
  latitude: 13.0827,
  longitude: 80.2707,
  city: 'Chennai (Default Location)'
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(DEFAULT_COORDINATES);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const detectLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsUsingFallback(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: 'Your Current Location'
        });
        setIsUsingFallback(false);
        setLoading(false);
      },
      (err) => {
        console.warn(`[Location] Geolocation permission/network warning: ${err.message}. Using Chennai fallback.`);
        setError(err.message);
        setIsUsingFallback(true);
        setLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        latitude: location.latitude,
        longitude: location.longitude,
        locationLabel: location.city,
        isUsingFallback,
        loading,
        error,
        refreshLocation: detectLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
