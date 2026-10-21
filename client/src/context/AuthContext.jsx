import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const DEFAULT_DEMO_PATIENT = {
  role: 'patient',
  patientId: 'patient-demo-001',
  id: 'patient-demo-001',
  _id: 'patient-demo-001',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98401 23456',
  permissions: ['patient']
};

export const DEFAULT_DEMO_PHARMACY = {
  role: 'pharmacy',
  pharmacyId: 'PORUR_CARE',
  id: 'PORUR_CARE',
  _id: 'PORUR_CARE',
  pharmacyName: 'Porur Care Dispensary',
  name: 'Porur Care Dispensary Staff',
  email: 'porur@medlocate.demo',
  address: 'Mount-Poonamallee High Road, Porur, Chennai 600116',
  phone: '+91 44 2476 1122',
  staffName: 'Karthik (Pharmacist)',
  permissions: ['pharmacy']
};

export const APOLLO_DEMO_PHARMACY = {
  role: 'pharmacy',
  pharmacyId: 'APOLLO_TNAGAR',
  id: 'APOLLO_TNAGAR',
  _id: 'APOLLO_TNAGAR',
  pharmacyName: 'Apollo Pharmacy - T. Nagar',
  name: 'Apollo Pharmacy Staff',
  email: 'apollo@medlocate.demo',
  address: 'G.N. Chetty Road, T. Nagar, Chennai 600017',
  phone: '+91 44 2815 6789',
  staffName: 'Suresh (Pharmacist)',
  permissions: ['pharmacy']
};

export const AuthProvider = ({ children }) => {
  // 1. Independent Patient Session
  const [patientUser, setPatientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medlocate_patient_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading patient session', e);
    }
    return DEFAULT_DEMO_PATIENT;
  });

  // 2. Independent Pharmacy Session
  const [pharmacyUser, setPharmacyUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medlocate_pharmacy_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading pharmacy session', e);
    }
    // Default to null so /pharmacy/login can be accessed cleanly
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    if (patientUser) {
      localStorage.setItem('medlocate_patient_session', JSON.stringify(patientUser));
      localStorage.setItem('medlocate_patient_token', 'demo-patient-token');
    } else {
      localStorage.removeItem('medlocate_patient_session');
      localStorage.removeItem('medlocate_patient_token');
    }
  }, [patientUser]);

  useEffect(() => {
    if (pharmacyUser) {
      localStorage.setItem('medlocate_pharmacy_session', JSON.stringify(pharmacyUser));
      localStorage.setItem('medlocate_pharmacy_token', 'demo-pharmacy-token');
    } else {
      localStorage.removeItem('medlocate_pharmacy_session');
      localStorage.removeItem('medlocate_pharmacy_token');
    }
  }, [pharmacyUser]);

  // Login as Pharmacy (Defaults to Porur Care Dispensary)
  const loginPharmacy = (pharmacyInput = DEFAULT_DEMO_PHARMACY) => {
    let session = { ...DEFAULT_DEMO_PHARMACY };

    if (pharmacyInput) {
      const pId = pharmacyInput.pharmacyId || pharmacyInput.id || pharmacyInput._id || 'PORUR_CARE';
      const isApollo = pId === 'APOLLO_TNAGAR' || pharmacyInput.name?.toLowerCase().includes('apollo');

      if (isApollo) {
        session = { ...APOLLO_DEMO_PHARMACY };
      } else {
        session = {
          role: 'pharmacy',
          pharmacyId: 'PORUR_CARE',
          id: 'PORUR_CARE',
          _id: 'PORUR_CARE',
          pharmacyName: 'Porur Care Dispensary',
          name: 'Porur Care Dispensary Staff',
          email: 'porur@medlocate.demo',
          address: 'Mount-Poonamallee High Road, Porur, Chennai 600116',
          phone: '+91 44 2476 1122',
          staffName: 'Karthik (Pharmacist)',
          permissions: ['pharmacy'],
          ...pharmacyInput
        };
      }
    }

    setPharmacyUser(session);
    localStorage.setItem('medlocate_pharmacy_session', JSON.stringify(session));
    localStorage.setItem('medlocate_pharmacy_token', 'demo-pharmacy-token');
    return session;
  };

  // Logout Pharmacy
  const logoutPharmacy = () => {
    setPharmacyUser(null);
    localStorage.removeItem('medlocate_pharmacy_session');
    localStorage.removeItem('medlocate_pharmacy_token');
  };

  // Login Patient
  const loginPatient = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.data?.user) {
        const u = {
          ...res.data.user,
          role: 'patient',
          patientId: res.data.user.id || res.data.user._id,
          permissions: ['patient']
        };
        setPatientUser(u);
        return u;
      }
    } catch (err) {
      console.warn('Fallback to demo patient login', err.message);
    }
    const demo = { ...DEFAULT_DEMO_PATIENT };
    setPatientUser(demo);
    return demo;
  };

  // Logout Patient
  const logoutPatient = () => {
    setPatientUser(null);
    localStorage.removeItem('medlocate_patient_session');
    localStorage.removeItem('medlocate_patient_token');
  };

  // Backward compatibility methods for existing legacy components
  const user = (typeof window !== 'undefined' && window.location.pathname.startsWith('/pharmacy'))
    ? pharmacyUser || DEFAULT_DEMO_PHARMACY
    : patientUser || DEFAULT_DEMO_PATIENT;

  const isPatient = !!patientUser;
  const isPharmacy = !!pharmacyUser;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        patientUser,
        pharmacyUser,
        isPatientAuthenticated: !!patientUser,
        isPharmacyAuthenticated: !!pharmacyUser,
        loginPharmacy,
        logoutPharmacy,
        loginPatient,
        logoutPatient,
        switchToPatient: () => {},
        switchToPharmacy: (p) => loginPharmacy(p),
        // Legacy compatibility:
        user,
        isAuthenticated: !!patientUser || !!pharmacyUser,
        isPatient,
        isPharmacy,
        isAdmin,
        login: loginPatient,
        logout: () => {
          logoutPatient();
          logoutPharmacy();
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
