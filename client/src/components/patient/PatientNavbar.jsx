import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../NotificationPanel';
import {
  Activity,
  MapPin,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Store,
  Calendar,
  Compass
} from 'lucide-react';

export const PatientNavbar = () => {
  const { patientUser, logoutPatient } = useAuth();
  const { locationLabel, refreshLocation } = useLocation();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const handleLogout = () => {
    logoutPatient();
    navigate('/login');
  };

  const isActive = (path) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Patient Brand Logo */}
          <Link to="/patient/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Med<span className="text-teal-600">Locate</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                Patient Portal
              </span>
            </div>
          </Link>

          {/* Patient Navigation Links Only */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/patient/search"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/patient/search')
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Find Medicine</span>
            </Link>

            <Link
              to="/patient/pharmacies"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/patient/pharmacies')
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Nearby Pharmacies</span>
            </Link>

            <Link
              to="/patient/reservations"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/patient/reservations')
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Reservations</span>
            </Link>
          </nav>

          {/* Right Section: Location + Notification + Patient Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Current Location Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
              <span className="font-medium max-w-[130px] truncate" title={locationLabel}>
                {locationLabel}
              </span>
              <button
                type="button"
                onClick={refreshLocation}
                className="text-[10px] text-teal-600 hover:text-teal-700 underline font-semibold ml-1 cursor-pointer"
                title="Refresh GPS Coordinates"
              >
                Change
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
                aria-label="Patient Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Patient Profile & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {patientUser?.name ? patientUser.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {patientUser?.name || 'Rahul Sharma'}
                </span>
                <span className="text-[10px] font-medium text-teal-600 leading-none">
                  Patient
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout from Patient Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {patientUser?.name ? patientUser.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{patientUser?.name || 'Rahul Sharma'}</p>
                <p className="text-xs text-teal-600 font-medium">Patient</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium border border-rose-200"
            >
              Logout
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-600 py-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate">{locationLabel}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              to="/patient/search"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center space-x-2"
            >
              <Search className="w-4 h-4 text-teal-600" />
              <span>Find Medicine</span>
            </Link>
            <Link
              to="/patient/pharmacies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center space-x-2"
            >
              <Store className="w-4 h-4 text-teal-600" />
              <span>Nearby Pharmacies</span>
            </Link>
            <Link
              to="/patient/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Reservations</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PatientNavbar;
