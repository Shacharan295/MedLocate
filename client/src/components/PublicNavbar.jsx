import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Search, Store, Layers, LogIn, ArrowRight } from 'lucide-react';

export const PublicNavbar = () => {
  const routerLocation = useLocation();
  const isActive = (path) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Med<span className="text-teal-600">Locate</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded border border-teal-200">
                Healthcare
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/architecture"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/architecture')
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Architecture</span>
            </Link>
          </nav>

          {/* Dual Portal Entry Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/patient/dashboard"
              className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs sm:text-sm font-semibold rounded-xl border border-teal-200 transition-colors flex items-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Portal</span>
            </Link>

            <Link
              to="/pharmacy/login"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span>Pharmacy Portal</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
