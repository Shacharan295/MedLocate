import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { usePharmacy } from '../../context/PharmacyContext';
import { reservationService, pharmacyService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import PharmacyMap from '../../components/PharmacyMap';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  AlertCircle,
  Phone,
  Sparkles,
  Layers,
  ChevronRight,
  Star
} from 'lucide-react';

const POPULAR_SEARCHES = [
  'Paracetamol',
  'Amoxicillin',
  'Metformin',
  'Pantoprazole',
  'Cetirizine',
  'ORS Solution',
  'Vitamin D3'
];

export const PatientDashboard = () => {
  const { user, switchToPatient } = useAuth();
  const { locationLabel, latitude, longitude } = useLocation();
  const { activePharmacy, setActivePharmacy } = usePharmacy();
  const [reservations, setReservations] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    switchToPatient();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resReservations, resPharmacies] = await Promise.all([
          reservationService.getAll({ limit: 5 }),
          pharmacyService.getNearby({ latitude, longitude, radius })
        ]);
        setReservations(resReservations.data?.data || []);
        const pharms = resPharmacies.data?.data || [];
        setNearbyPharmacies(pharms);
        if (pharms.length > 0 && !selectedPharmacy) {
          setSelectedPharmacy(pharms[0]);
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [latitude, longitude, radius]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/patient/search?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const handleQuickTagClick = (query) => {
    navigate(`/patient/search?q=${encodeURIComponent(query)}`);
  };

  const activeReservations = reservations.filter(
    (r) => r.status === 'PENDING' || r.status === 'CONFIRMED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Section: Medicine Search Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Search Origin: {locationLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find Medicines Across Verified Chennai Pharmacies
          </h1>
          <p className="mt-2 text-teal-100 text-xs sm:text-sm">
            Locate prescription and OTC drugs, compare real-time stock levels, and place a guaranteed 30-minute hold for instant store pickup.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search medicine by name or salt (e.g. Paracetamol, Metformin 500mg)..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-xs sm:text-sm focus:outline-none shadow-md border-0"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search Stock</span>
            </button>
          </form>

          {/* Popular Search Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-teal-300 text-[11px] font-semibold flex items-center mr-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Quick Search:
            </span>
            {POPULAR_SEARCHES.map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => handleQuickTagClick(med)}
                className="px-2.5 py-1 bg-teal-950/60 hover:bg-teal-700/60 text-teal-100 rounded-lg text-[11px] font-medium border border-teal-500/30 transition-colors"
              >
                {med}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Below: Quick Stats & Recent Holds */}
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
          subtitle={`Within ${radius} km of your location`}
        />
        <StatsCard
          title="Total Reservations"
          value={reservations.length}
          icon={PackageCheck}
          color="emerald"
          subtitle="All-time orders"
        />
      </div>

      {/* Recent Reservations Summary Banner if patient has active orders */}
      {reservations.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Your Recent Medicine Reservations</h3>
            </div>
            <Link
              to="/patient/reservations"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reservations.slice(0, 3).map((res) => (
              <div
                key={res._id}
                className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-xs text-slate-800 block truncate">
                    {res.items[0]?.medicineName || 'Medicine Item'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {res.pharmacyId?.name || 'Pharmacy'} • Pickup Code: <strong className="font-mono text-teal-700">{res.pickupCode}</strong>
                  </span>
                </div>
                <StatusBadge status={res.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Section: Interactive Map + Nearby Pharmacy Results */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span>Explore Nearby Pharmacies & Live Stock</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any store pin or list card to sync coordinates and inspect inventory status.
            </p>
          </div>

          {/* Radius selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Search Radius:</span>
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
              {[2, 5, 10, 25].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    radius === r
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Split Grid: Interactive Map (Left) + Store Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs overflow-hidden">
            <PharmacyMap
              userLat={latitude}
              userLng={longitude}
              radius={radius}
              pharmacies={nearbyPharmacies}
              selectedPharmacyId={selectedPharmacy?._id || selectedPharmacy?.id || activePharmacy?.id}
              onSelectPharmacy={(p) => {
                const item = p.pharmacy || p;
                setSelectedPharmacy(item);
                setActivePharmacy(item);
              }}
              onReserve={(p) => {
                const item = p.pharmacy || p;
                setActivePharmacy(item);
                navigate(`/patient/search`);
              }}
            />
          </div>

          {/* Store List Column (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Pharmacies in Radius ({nearbyPharmacies.length})
                </h3>
                <p className="text-[11px] text-slate-400">Click a store to center map</p>
              </div>
              <Link
                to="/patient/pharmacies"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <span>Full directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner size="sm" message="Loading nearby dispensaries..." />
            ) : nearbyPharmacies.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No pharmacies found within {radius} km. Try expanding the radius above.
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {nearbyPharmacies
                  .slice()
                  .sort((a, b) => {
                    const aName = a.name?.toLowerCase() || '';
                    const bName = b.name?.toLowerCase() || '';
                    const isAPorur = aName.includes('porur');
                    const isBPorur = bName.includes('porur');
                    if (isAPorur && !isBPorur) return -1;
                    if (!isAPorur && isBPorur) return 1;
                    return 0;
                  })
                  .map((pharm) => {
                    const isSelected =
                      (selectedPharmacy?._id || selectedPharmacy?.id) === (pharm._id || pharm.id) ||
                      (activePharmacy && pharm.name === activePharmacy?.name);
                    return (
                      <div
                        key={pharm._id || pharm.id}
                        onClick={() => {
                          setSelectedPharmacy(pharm);
                          setActivePharmacy(pharm);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500/20'
                            : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {pharm.name}
                            </h4>
                            {pharm.verified && (
                              <span className="inline-flex items-center space-x-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
                                <ShieldCheck className="w-3 h-3 text-teal-600" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            {pharm.address}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                            {pharm.distanceKm ? `${pharm.distanceKm} km` : 'Chennai'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center space-x-2">
                          {pharm.rating && (
                            <span className="flex items-center space-x-0.5 font-bold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                              <span>{pharm.rating}</span>
                            </span>
                          )}
                          <span>{pharm.openingHours || '8:00 AM - 10:00 PM'}</span>
                        </div>

                        <Link
                          to={`/patient/search?pharmacyId=${pharm._id || pharm.id}`}
                          className="font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-0.5"
                        >
                          <span>Check Stock</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
