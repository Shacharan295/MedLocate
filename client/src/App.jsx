import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PharmacyRegister from './pages/PharmacyRegister';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientSearch from './pages/patient/PatientSearch';
import PatientPharmacies from './pages/patient/PatientPharmacies';
import PatientReservations from './pages/patient/PatientReservations';

// Pharmacy Pages
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyReservations from './pages/pharmacy/PharmacyReservations';
import PharmacyProfile from './pages/pharmacy/PharmacyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPharmacies from './pages/admin/AdminPharmacies';
import AdminReports from './pages/admin/AdminReports';

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pharmacy-register" element={<PharmacyRegister />} />
          <Route path="/search" element={<Navigate to="/patient/search" replace />} />

          {/* Patient Routes (Accessible by Patient & Admin) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['patient', 'admin']} />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/search" element={<PatientSearch />} />
              <Route path="/patient/pharmacies" element={<PatientPharmacies />} />
              <Route path="/patient/reservations" element={<PatientReservations />} />
              <Route path="/patient/reservations/:id" element={<PatientReservations />} />
            </Route>

            {/* Pharmacy Staff Routes (Accessible by Pharmacy & Admin) */}
            <Route element={<RoleRoute allowedRoles={['pharmacy', 'admin']} />}>
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
              <Route path="/pharmacy/reservations" element={<PharmacyReservations />} />
              <Route path="/pharmacy/profile" element={<PharmacyProfile />} />
            </Route>

            {/* Admin Routes (Admin Only) */}
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
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 MedLocate — MERN Stack Pharmacy Medicine Locator and Reservation System.</p>
          <p className="mt-1">
            Built with React, Express, MongoDB Atlas & 2dsphere Geospatial Indexing.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
