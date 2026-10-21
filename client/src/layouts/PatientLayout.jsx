import React from 'react';
import { Outlet } from 'react-router-dom';
import PatientNavbar from '../components/patient/PatientNavbar';

export const PatientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <PatientNavbar />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 MedLocate Patient Portal — Real-time Medicine Locator & Pickup Hold System.</p>
          <p className="mt-1">
            Connected to verified neighborhood pharmacies across Chennai.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PatientLayout;
