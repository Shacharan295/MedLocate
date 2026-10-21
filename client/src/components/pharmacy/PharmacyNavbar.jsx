import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Store,
  LayoutDashboard,
  CalendarCheck,
  Package,
  ShoppingBag,
  FileText,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const PharmacyNavbar = () => {
  const { pharmacyUser, logoutPharmacy } = useAuth();
  const { activePharmacy, getActivePharmacyReservations } = usePharmacy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const handleLogout = () => {
    logoutPharmacy();
    navigate('/pharmacy/login');
  };

  const isActive = (path) => routerLocation.pathname === path;

  // Active store details from pharmacy session or active pharmacy
  const storeName = pharmacyUser?.pharmacyName || activePharmacy?.name || 'Porur Care Dispensary';
  const storeAddress = pharmacyUser?.address || activePharmacy?.address || 'Mount-Poonamallee High Road, Porur, Chennai 600116';
  const staffName = pharmacyUser?.staffName || 'Karthik (Pharmacist)';

  const pendingHoldsCount = getActivePharmacyReservations().filter(
    (r) => r.status === 'READY_FOR_PICKUP' || r.status === 'CONFIRMED'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Pharmacy Management Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/pharmacy/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-teal-500/30">
                <Store className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-bold tracking-tight text-white">
                    MedLocate <span className="text-teal-400">Pharmacy</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-teal-900/60 text-teal-300 rounded border border-teal-700/60">
                    Dispensary Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Pharmacy Management Dashboard</p>
              </div>
            </Link>

            {/* Store Identification Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-100 flex items-center space-x-1">
                  <span>{storeName}</span>
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                </span>
                <span className="text-[10px] text-slate-400 max-w-[200px] truncate" title={storeAddress}>
                  {storeAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Pharmacy Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/pharmacy/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/pharmacy/dashboard')
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/pharmacy/reservations"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 relative ${
                isActive('/pharmacy/reservations')
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Incoming Reservations</span>
              {pendingHoldsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full">
                  {pendingHoldsCount}
                </span>
              )}
            </Link>

            <Link
              to="/pharmacy/inventory"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/pharmacy/inventory')
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventory</span>
            </Link>

            <Link
              to="/pharmacy/orders"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/pharmacy/orders')
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <Link
              to="/pharmacy/profile"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/pharmacy/profile')
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Activity / Logs</span>
            </Link>
          </nav>

          {/* Right Section: Staff Badge & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                {staffName.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {staffName}
                </span>
                <span className="text-[10px] font-medium text-emerald-400 leading-none">
                  Dispensary Staff
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 ml-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Logout from Pharmacy Portal"
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
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <div className="py-2 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{storeName}</p>
              <p className="text-xs text-slate-400 truncate">{storeAddress}</p>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">{staffName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg font-medium border border-rose-800"
            >
              Logout
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              to="/pharmacy/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-400" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/pharmacy/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-teal-400" />
                <span>Incoming Reservations</span>
              </div>
              {pendingHoldsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full">
                  {pendingHoldsCount}
                </span>
              )}
            </Link>
            <Link
              to="/pharmacy/inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2"
            >
              <Package className="w-4 h-4 text-teal-400" />
              <span>Inventory</span>
            </Link>
            <Link
              to="/pharmacy/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>Orders</span>
            </Link>
            <Link
              to="/pharmacy/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Activity / Logs</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PharmacyNavbar;
