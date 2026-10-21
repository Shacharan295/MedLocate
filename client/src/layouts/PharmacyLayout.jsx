import React from 'react';
import { Outlet } from 'react-router-dom';
import PharmacyNavbar from '../components/pharmacy/PharmacyNavbar';

export const PharmacyLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <PharmacyNavbar />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 MedLocate Pharmacy Management System — POS & In-Store Hold Synchronization.</p>
          <p className="mt-1 text-slate-500">
            Compliant with Pharmacy Stock Distribution & Schedule H / H1 dispensing guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PharmacyLayout;
