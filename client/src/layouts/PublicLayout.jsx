import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <PublicNavbar />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

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

export default PublicLayout;
