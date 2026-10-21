import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEFAULT_DEMO_PHARMACY, APOLLO_DEMO_PHARMACY } from '../../context/AuthContext';
import { usePharmacy, DEFAULT_PORUR_PHARMACY, DEFAULT_APOLLO_PHARMACY } from '../../context/PharmacyContext';
import {
  Store,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';

export const PharmacyLogin = () => {
  const { loginPharmacy } = useAuth();
  const { setActivePharmacy } = usePharmacy();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedStoreId, setSelectedStoreId] = useState('PORUR_CARE');
  const [email, setEmail] = useState('porur@medlocate.demo');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleStoreChange = (storeId) => {
    setSelectedStoreId(storeId);
    if (storeId === 'PORUR_CARE') {
      setEmail('porur@medlocate.demo');
    } else {
      setEmail('apollo@medlocate.demo');
    }
  };

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const storeData =
      selectedStoreId === 'PORUR_CARE'
        ? DEFAULT_PORUR_PHARMACY
        : DEFAULT_APOLLO_PHARMACY;

    // 1. Establish pharmacy session in AuthContext
    loginPharmacy({
      pharmacyId: storeData.id,
      pharmacyName: storeData.name,
      address: storeData.address,
      phone: storeData.phone,
      staffName: selectedStoreId === 'PORUR_CARE' ? 'Karthik (Pharmacist)' : 'Suresh (Pharmacist)'
    });

    // 2. Set active pharmacy in PharmacyContext
    setActivePharmacy(storeData);

    setTimeout(() => {
      setLoading(false);
      const destination = location.state?.from?.pathname || '/pharmacy/dashboard';
      navigate(destination);
    }, 200);
  };

  const handleQuickLogin = (storeId) => {
    handleStoreChange(storeId);
    const storeData =
      storeId === 'PORUR_CARE'
        ? DEFAULT_PORUR_PHARMACY
        : DEFAULT_APOLLO_PHARMACY;

    loginPharmacy({
      pharmacyId: storeData.id,
      pharmacyName: storeData.name,
      address: storeData.address,
      phone: storeData.phone,
      staffName: storeId === 'PORUR_CARE' ? 'Karthik (Pharmacist)' : 'Suresh (Pharmacist)'
    });

    setActivePharmacy(storeData);
    navigate('/pharmacy/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3 relative z-10">
        <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
          <Store className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          MedLocate <span className="text-teal-400">Pharmacy Portal</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Dispensary & Inventory Management Console for Verified Retail Pharmacies
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-sm">
          {/* Quick Evaluator Access Section */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluator One-Click Sign In</span>
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-semibold border border-teal-500/30">
                Demo Ready
              </span>
            </div>

            {/* Recommended Store: Porur Care Dispensary */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border-2 border-teal-500/60 hover:border-teal-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">Porur Care Dispensary</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Mount-Poonamallee High Road, Porur, Chennai 600116</span>
                  </p>
                  <p className="text-[11px] text-teal-300 mt-1">
                    Staff: Karthik (Pharmacist) • Active Paracetamol & Amoxicillin stock
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickLogin('PORUR_CARE')}
                className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-teal-500/20"
              >
                <span>Log In as Porur Care Dispensary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Secondary Store: Apollo Pharmacy */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Apollo Pharmacy - T. Nagar</h4>
                  <p className="text-[11px] text-slate-400">G.N. Chetty Road, T. Nagar, Chennai 600017</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('APOLLO_TNAGAR')}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  Log In as Apollo
                </button>
              </div>
            </div>
          </div>

          {/* Standard Form Login */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2 border-t border-slate-800 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Select Dispensary Store</label>
              <select
                value={selectedStoreId}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
              >
                <option value="PORUR_CARE">Porur Care Dispensary (Mount-Poonamallee Rd, Porur)</option>
                <option value="APOLLO_TNAGAR">Apollo Pharmacy - T. Nagar (G.N. Chetty Rd)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Authenticating Dispensary...' : 'Enter Pharmacy Management Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Sync Guarantee Note */}
          <div className="p-3 bg-teal-950/40 border border-teal-800/40 rounded-xl text-[11px] text-teal-300 flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p>
              <strong>Live Shared Data:</strong> Reservations placed by patients for <em>Porur Care Dispensary</em> in the Patient Portal will appear instantly under <strong>Incoming Reservations</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;
