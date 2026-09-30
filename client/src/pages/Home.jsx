import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  Store,
  Users,
  Shield
} from 'lucide-react';

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const { locationLabel } = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/patient/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/patient/search');
    }
  };

  const handleQuickDemoLogin = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      alert('Demo login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Real-Time Geospatial Pharmacy Locator</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Locate Prescribed Medicines, Compare Prices &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
            Reserve for In-Store Pickup
          </span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          MedLocate connects patients directly with verified pharmacies across Chennai. Check live stock quantities, find nearby stores on interactive maps, and hold items for 30 minutes without advance payment.
        </p>

        {/* Central Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 sm:p-2.5 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicine (e.g. Paracetamol, Amoxicillin, Metformin)..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl sm:rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Search Pharmacies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Scanning near: <strong>{locationLabel}</strong></span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Geospatial Proximity Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              MongoDB 2dsphere indexing sorts pharmacies by exact road distance from your coordinates. View interactive Leaflet map markers in real time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Atomic Stock Holds</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Guaranteed race-condition protection. Holds lock medicine stock for 30 minutes, automatically returning units to public inventory if not picked up.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Verified Dispensaries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Administrative verification ensures all listed pharmacies are licensed establishments with authentic batches and genuine pricing.
            </p>
          </div>
        </div>
      </section>

      {/* One-Click Demo Accounts Section (College Presentation Feature) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Demonstration Testing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              One-Click Quick Login for Evaluators
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Click any demo persona below to immediately log in with pre-seeded data and test all role-based features.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Patient Demo Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Patient Persona</h4>
                <p className="text-slate-400 text-xs mt-1">Rahul Sharma</p>
                <code className="text-[11px] text-teal-300 font-mono block mt-1">
                  patient@medlocate.demo
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin(
                    'patient@medlocate.demo',
                    'password123',
                    '/patient/dashboard'
                  )
                }
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Log In as Patient
              </button>
            </div>

            {/* Pharmacy Demo Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Pharmacy Persona</h4>
                <p className="text-slate-400 text-xs mt-1">Apollo Pharmacy T. Nagar</p>
                <code className="text-[11px] text-sky-300 font-mono block mt-1">
                  pharmacy@medlocate.demo
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin(
                    'pharmacy@medlocate.demo',
                    'password123',
                    '/pharmacy/dashboard'
                  )
                }
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Log In as Pharmacy
              </button>
            </div>

            {/* Admin Demo Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Admin Persona</h4>
                <p className="text-slate-400 text-xs mt-1">System Administrator</p>
                <code className="text-[11px] text-purple-300 font-mono block mt-1">
                  admin@medlocate.demo
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin(
                    'admin@medlocate.demo',
                    'password123',
                    '/admin/dashboard'
                  )
                }
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Log In as Admin
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
