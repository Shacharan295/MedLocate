import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { reservationService, pharmacyService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  AlertCircle
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { locationLabel, latitude, longitude } = useLocation();
  const [reservations, setReservations] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resReservations, resPharmacies] = await Promise.all([
          reservationService.getAll({ limit: 5 }),
          pharmacyService.getNearby({ latitude, longitude, radius: 15 })
        ]);
        setReservations(resReservations.data?.data || []);
        setNearbyPharmacies(resPharmacies.data?.data || []);
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [latitude, longitude]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/patient/search?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const activeReservations = reservations.filter(
    (r) => r.status === 'PENDING' || r.status === 'CONFIRMED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Detected: {locationLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-teal-100 text-xs sm:text-sm">
            Search medicine availability across nearby pharmacies in Chennai and place guaranteed 30-minute holds for in-store pickup.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search medicine (e.g. Paracetamol, Metformin)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Holds"
          value={activeReservations.length}
          icon={Clock}
          color="teal"
          subtitle="Currently waiting for pickup"
        />
        <StatsCard
          title="Nearby Pharmacies"
          value={nearbyPharmacies.length}
          icon={MapPin}
          color="blue"
          subtitle="Within 15km of your location"
        />
        <StatsCard
          title="Total Reservations"
          value={reservations.length}
          icon={PackageCheck}
          color="emerald"
          subtitle="All-time orders"
        />
      </div>

      {/* Content Split: Recent Reservations & Nearby Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Reservations */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Your Reservations</h3>
              <p className="text-xs text-slate-500">Track current pickup status</p>
            </div>
            <Link
              to="/patient/reservations"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner size="sm" message="Loading reservations..." />
          ) : reservations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent reservations. Search for a medicine to place your first hold.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reservations.slice(0, 3).map((res) => (
                <div key={res._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-800">
                        {res.items[0]?.medicineName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({res.pickupCode})
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {res.pharmacyId?.name} • ₹{res.totalAmount}
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={res.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Nearby Pharmacies */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Nearby Stores</h3>
              <p className="text-xs text-slate-500">Closest verified pharmacies</p>
            </div>
            <Link
              to="/patient/pharmacies"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>Browse map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {nearbyPharmacies.slice(0, 4).map((pharm) => (
              <div key={pharm._id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800">
                    {pharm.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {pharm.address}
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                  {pharm.distanceKm} km
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
