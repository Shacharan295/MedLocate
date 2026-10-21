import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useNotifications } from '../context/NotificationContext';
import { usePharmacy, DEFAULT_PORUR_PHARMACY, DEFAULT_APOLLO_PHARMACY } from '../context/PharmacyContext';
import NotificationPanel from './NotificationPanel';
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
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isPatient, isPharmacy, isAdmin, switchToPharmacy, switchToPatient } = useAuth();
  const { activePharmacy, setActivePharmacy } = usePharmacy();
  const { locationLabel, refreshLocation } = useLocation();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenPharmacyDashboard = () => {
    switchToPharmacy(activePharmacy);
    navigate('/pharmacy/dashboard');
  };

  const handleOpenPatientSearch = () => {
    switchToPatient();
    navigate('/patient/search');
  };

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
              <span className="hidden sm:inline-block ml-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded border border-teal-200">
                Healthcare
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links based on Role */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {isAuthenticated ? (
              <>
                {isPatient && (
                  <>
                    <Link
                      to="/patient/search"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        isActive('/patient/search')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
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
                          ? 'bg-teal-50 text-teal-700 font-semibold'
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
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Reservations</span>
                    </Link>

                    {/* Direct Pharmacy Dashboard switch */}
                    <button
                      type="button"
                      onClick={handleOpenPharmacyDashboard}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                      title={`Open ${activePharmacy?.name} Dashboard`}
                    >
                      <Store className="w-4 h-4 text-teal-600" />
                      <span>Pharmacy Portal</span>
                    </button>
                  </>
                )}

                {isPharmacy && (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenPatientSearch}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
                    >
                      <Search className="w-4 h-4 text-slate-500" />
                      <span>Find Medicine</span>
                    </button>
                    <Link
                      to="/pharmacy/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        isActive('/pharmacy/dashboard')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 text-teal-600" />
                      <span>Dashboard ({activePharmacy?.name?.split(' ')[0]})</span>
                    </Link>
                    <Link
                      to="/pharmacy/inventory"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        isActive('/pharmacy/inventory')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Inventory</span>
                    </Link>
                    <Link
                      to="/pharmacy/reservations"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        isActive('/pharmacy/reservations')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Orders</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin/dashboard')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/pharmacies"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                        isActive('/admin/pharmacies')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Verifications</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin/users')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/reports"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin/reports')
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                      }`}
                    >
                      Reports
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/patient/search"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 flex items-center space-x-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Medicine</span>
                </Link>
                <Link
                  to="/patient/pharmacies"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                >
                  Pharmacies
                </Link>
                <button
                  type="button"
                  onClick={handleOpenPharmacyDashboard}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                >
                  <Store className="w-4 h-4 text-teal-600" />
                  <span>Pharmacy Portal</span>
                </button>
              </>
            )}

            {/* Architecture Visualization Link */}
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


          {/* Right Section: Geolocation badge + Active Store Switcher + Notifications + User Profile */}
          <div className="flex items-center space-x-3">
            {/* Active Pharmacy Store Switcher Pill */}
            <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1 bg-slate-100 rounded-xl text-xs border border-slate-200">
              <Store className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-slate-500 font-medium">Store:</span>
              <select
                value={activePharmacy?.name?.toLowerCase().includes('porur') ? 'PORUR_CARE' : 'APOLLO_TNAGAR'}
                onChange={(e) => {
                  const selected = e.target.value === 'PORUR_CARE' ? DEFAULT_PORUR_PHARMACY : DEFAULT_APOLLO_PHARMACY;
                  setActivePharmacy(selected);
                  if (isPharmacy) {
                    switchToPharmacy(selected);
                  }
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="PORUR_CARE">Porur Care Dispensary</option>
                <option value="APOLLO_TNAGAR">Apollo Pharmacy - T. Nagar</option>
              </select>
            </div>

            {/* Geolocation indicator */}
            <button
              onClick={refreshLocation}
              title="Click to refresh current location"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/60"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span className="truncate max-w-[130px] font-medium">{locationLabel}</span>
            </button>


            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
            )}

            {/* User Profile / Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-none">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-teal-600 font-medium capitalize mt-0.5">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated ? (
            <>
              {isPatient && (
                <>
                  <Link
                    to="/patient/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/patient/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Find Medicine
                  </Link>
                  <Link
                    to="/patient/pharmacies"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Nearby Pharmacies
                  </Link>
                  <Link
                    to="/patient/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Reservations
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenPharmacyDashboard();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 flex items-center space-x-1.5"
                  >
                    <Store className="w-4 h-4 text-teal-600" />
                    <span>Pharmacy Portal ({activePharmacy?.name?.split(' ')[0]})</span>
                  </button>
                </>
              )}

              {isPharmacy && (
                <>
                  <Link
                    to="/pharmacy/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/pharmacy/inventory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Inventory Management
                  </Link>
                  <Link
                    to="/pharmacy/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Reservations
                  </Link>
                  <Link
                    to="/pharmacy/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Pharmacy Profile
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/pharmacies"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Pharmacy Verifications
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    User Management
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    System Reports
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Logged in as {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/patient/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Find Medicine
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center rounded-lg text-sm font-medium text-white bg-teal-600"
              >
                Sign up as Patient
              </Link>
              <Link
                to="/architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center space-x-1.5"
              >
                <Layers className="w-4 h-4 text-teal-600" />
                <span>System Architecture</span>
              </Link>
            </div>
          )}

        </div>
      )}
    </header>
  );
};

export default Navbar;
