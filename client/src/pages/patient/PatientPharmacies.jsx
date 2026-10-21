import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pharmacyService } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import PharmacyMap from '../../components/PharmacyMap';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  ExternalLink,
  Map as MapIcon,
  Grid,
  Star,
  Clock
} from 'lucide-react';

export const PatientPharmacies = () => {
  const { latitude, longitude, locationLabel } = useLocation();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'grid'
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        // Fetch pharmacies within 35km radius of Chennai coordinates
        const res = await pharmacyService.getNearby({
          latitude,
          longitude,
          radius: 35
        });
        const data = res.data?.data || [];
        setPharmacies(data);
        if (data.length > 0 && !selectedPharmacy) {
          setSelectedPharmacy(data[0]);
        }
      } catch (err) {
        console.warn('Nearby fetch fallback to all pharmacies:', err);
        try {
          const fallback = await pharmacyService.getAll();
          setPharmacies(fallback.data?.data || []);
        } catch (e) {
          setError('Failed to load pharmacies directory.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [latitude, longitude]);

  const filteredPharmacies = pharmacies.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Title + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Store className="w-6 h-6 text-teal-600" />
            <span>Chennai Pharmacy Network ({filteredPharmacies.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified healthcare dispensaries near {locationLabel}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or neighborhood..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Locating certified dispensaries across Chennai..." />
      ) : viewMode === 'map' ? (
        /* Map View: Map on Left + Pharmacy Cards on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs">
            <PharmacyMap
              userLat={latitude}
              userLng={longitude}
              radius={25}
              pharmacies={filteredPharmacies}
              selectedPharmacyId={selectedPharmacy?._id || selectedPharmacy?.id}
              onSelectPharmacy={(p) => setSelectedPharmacy(p.pharmacy || p)}
            />
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Dispensary List ({filteredPharmacies.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click to locate</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredPharmacies.map((pharm) => {
                const isSelected =
                  (selectedPharmacy?._id || selectedPharmacy?.id) === (pharm._id || pharm.id);
                return (
                  <div
                    key={pharm._id || pharm.id}
                    onClick={() => setSelectedPharmacy(pharm)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
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
                        to={`/patient/search?q=Paracetamol`}
                        className="font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-0.5"
                      >
                        <span>Check Stock</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPharmacies.map((pharm) => (
            <div
              key={pharm._id || pharm.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                    +
                  </div>
                  {pharm.verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-3">
                  <h3 className="font-bold text-base text-slate-900">{pharm.name}</h3>
                  {pharm.rating && (
                    <span className="flex items-center space-x-0.5 font-bold text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      <span>{pharm.rating}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{pharm.address}</span>
                </p>

                <div className="mt-3 flex items-center space-x-3 text-xs text-slate-600">
                  <a
                    href={`tel:${pharm.phone}`}
                    className="flex items-center space-x-1 hover:text-teal-600 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{pharm.phone}</span>
                  </a>
                  {pharm.distanceKm !== undefined && (
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {pharm.distanceKm} km
                    </span>
                  )}
                </div>

                {pharm.openingHours && (
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{pharm.openingHours}</span>
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                <Link
                  to={`/patient/search?q=Paracetamol`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                >
                  <span>Search Stock</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPharmacies;
