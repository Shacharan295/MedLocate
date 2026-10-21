import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PharmacyRoute = () => {
  const { isPharmacyAuthenticated } = useAuth();
  const location = useLocation();

  if (!isPharmacyAuthenticated) {
    // Redirect unauthenticated pharmacy visitors (including patients) to pharmacy login
    return <Navigate to="/pharmacy/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PharmacyRoute;
