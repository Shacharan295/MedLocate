import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Route Guards
import PublicLayout from './layouts/PublicLayout';
import PatientLayout from './layouts/PatientLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import PatientRoute from './components/PatientRoute';
import PharmacyRoute from './components/PharmacyRoute';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PharmacyRegister from './pages/PharmacyRegister';
import Architecture from './pages/Architecture';

// Patient Portal Pages (Under /patient/*)
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientSearch from './pages/patient/PatientSearch';
import PatientPharmacies from './pages/patient/PatientPharmacies';
import PatientReservations from './pages/patient/PatientReservations';

// Pharmacy Portal Pages (Under /pharmacy/*)
import PharmacyLogin from './pages/pharmacy/PharmacyLogin';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyReservations from './pages/pharmacy/PharmacyReservations';
import PharmacyOrders from './pages/pharmacy/PharmacyOrders';
import PharmacyProfile from './pages/pharmacy/PharmacyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPharmacies from './pages/admin/AdminPharmacies';
import AdminReports from './pages/admin/AdminReports';

export const App = () => {
  return (
    <Routes>
      {/* 1. Public Routes Wrapped in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pharmacy-register" element={<PharmacyRegister />} />
        <Route path="/architecture" element={<Architecture />} />
      </Route>

      {/* 2. Standalone Pharmacy Login */}
      <Route path="/pharmacy/login" element={<PharmacyLogin />} />

      {/* 3. STRICTLY SEPARATE PATIENT PORTAL (/patient/*) */}
      <Route element={<PatientRoute />}>
        <Route element={<PatientLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/search" element={<PatientSearch />} />
          <Route path="/patient/pharmacies" element={<PatientPharmacies />} />
          <Route path="/patient/reservations" element={<PatientReservations />} />
          <Route path="/patient/reservations/:id" element={<PatientReservations />} />
          <Route path="/search" element={<Navigate to="/patient/search" replace />} />
        </Route>
      </Route>

      {/* 4. STRICTLY SEPARATE PHARMACY PORTAL (/pharmacy/*) */}
      <Route element={<PharmacyRoute />}>
        <Route element={<PharmacyLayout />}>
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
          <Route path="/pharmacy/reservations" element={<PharmacyReservations />} />
          <Route path="/pharmacy/orders" element={<PharmacyOrders />} />
          <Route path="/pharmacy/profile" element={<PharmacyProfile />} />
        </Route>
      </Route>

      {/* 5. Admin Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
