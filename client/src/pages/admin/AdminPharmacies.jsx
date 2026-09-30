import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService, pharmacyService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  Search,
  Check,
  X,
  Phone,
  MapPin,
  User
} from 'lucide-react';

export const AdminPharmacies = () => {
  const [searchParams] = useSearchParams();
  const initialPending = searchParams.get('filter') === 'pending';

  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialPending ? 'PENDING' : 'ALL');

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getPharmacies();
      setPharmacies(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch pharmacies list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleToggleVerification = async (id, currentStatus) => {
    try {
      await pharmacyService.updateVerification(id, !currentStatus);
      await fetchPharmacies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pharmacy verification.');
    }
  };

  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'VERIFIED' && p.verified) ||
      (filter === 'PENDING' && !p.verified);
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy Verification Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Approve or revoke verification badges for dispensaries across the network.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pharmacy or owner..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['ALL', 'PENDING', 'VERIFIED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              filter === tab
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Loading registered pharmacies..." />
      ) : filteredPharmacies.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No pharmacies found"
          description="There are currently no pharmacy records matching your filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Pharmacy</th>
                  <th className="py-3.5 px-5">Contact & Location</th>
                  <th className="py-3.5 px-5">Owner</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPharmacies.map((pharm) => (
                  <tr key={pharm._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <strong className="font-bold text-slate-900 block text-sm">
                        {pharm.name}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        GeoJSON: [{pharm.location?.coordinates?.[0]?.toFixed(4)}, {pharm.location?.coordinates?.[1]?.toFixed(4)}]
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-slate-700 block truncate max-w-xs">{pharm.address}</span>
                      <span className="text-slate-400 text-[11px]">{pharm.phone}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-800 block">
                        {pharm.ownerId?.name || 'Owner'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {pharm.ownerId?.email}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      {pharm.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3 text-orange-600" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {pharm.verified ? (
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(pharm._id, pharm.verified)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition-colors"
                        >
                          Revoke Verification
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(pharm._id, pharm.verified)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all"
                        >
                          Approve Pharmacy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPharmacies;
