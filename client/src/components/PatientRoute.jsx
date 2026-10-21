import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PatientRoute = () => {
  const { isPatientAuthenticated } = useAuth();
  const location = useLocation();

  if (!isPatientAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PatientRoute;
