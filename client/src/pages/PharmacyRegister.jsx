import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import ErrorMessage from '../components/ErrorMessage';
import { Store, User, Mail, Phone, Lock, MapPin, ArrowRight, Compass } from 'lucide-react';

export const PharmacyRegister = () => {
  const { register } = useAuth();
  const { latitude: defaultLat, longitude: defaultLng } = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Pharmacy details
  const [pharmacyName, setPharmacyName] = useState('');
  const [address, setAddress] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [latitude, setLatitude] = useState(defaultLat || 13.0827);
  const [longitude, setLongitude] = useState(defaultLng || 80.2707);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await register({
        name,
        email,
        phone,
        password,
        role: 'pharmacy',
        pharmacyDetails: {
          pharmacyName,
          address,
          phone: pharmacyPhone || phone,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });

      navigate('/pharmacy/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Pharmacy registration failed. Please check inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-sky-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Register Pharmacy Establishment
          </h2>
          <p className="text-xs text-slate-500">
            Join the MedLocate network to manage medicine stock and receive in-store patient reservations.
          </p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Owner details */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 pb-1 border-b border-slate-100">
              Account Manager Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pharmacist Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Suresh Kumar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pharmacy@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Manager Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 12345"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Pharmacy store details */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-800 pb-1 border-b border-slate-100">
              Dispensary & Geospatial Location
            </h3>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pharmacy Trade Name</label>
              <input
                type="text"
                required
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                placeholder="Apollo Pharmacy - T. Nagar"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="No. 42 Pondy Bazaar, T. Nagar, Chennai 600017"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentGPS}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center space-x-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Use Current GPS Device Coordinates</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Registering Establishment...' : 'Submit Pharmacy Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PharmacyRegister;
