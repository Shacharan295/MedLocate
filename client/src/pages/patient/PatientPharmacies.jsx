import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pharmacyService } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export const PatientPharmacies = () => {
  const { latitude, longitude, locationLabel } = useLocation();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        // Use nearby endpoint if coordinates are available, otherwise standard
        const res = await pharmacyService.getNearby({
          latitude,
          longitude,
          radius: 30
        });
        setPharmacies(res.data?.data || []);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Registered Pharmacies Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified healthcare dispensaries near {locationLabel}.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pharmacy or area..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Locating certified pharmacies..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPharmacies.map((pharm) => (
            <div
              key={pharm._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                    +
                  </div>
                  {pharm.verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-3">{pharm.name}</h3>
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
