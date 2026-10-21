import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/api';
import { usePharmacy } from '../../context/PharmacyContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle,
  XCircle,
  PackageCheck,
  Search,
  Store
} from 'lucide-react';

export const PharmacyReservations = () => {
  const { activePharmacy, getActivePharmacyReservations, updateReservationStatus: updateContextStatus } = usePharmacy();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [searchCode, setSearchCode] = useState('');

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reservationService.getAll();
      const serverRes = res.data?.data || [];
      const localRes = getActivePharmacyReservations();
      const map = new Map();
      localRes.forEach((r) => map.set(r.pickupCode || r.id || r._id, r));
      serverRes.forEach((r) => {
        const key = r.pickupCode || r.id || r._id;
        if (!map.has(key)) map.set(key, r);
      });
      setReservations(Array.from(map.values()));
    } catch (err) {
      setReservations(getActivePharmacyReservations());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [activePharmacy]);

  const handleStatusUpdate = async (id, newStatus) => {
    updateContextStatus(id, newStatus);
    try {
      await reservationService.updateStatus(id, newStatus);
    } catch (err) {
      // In demo mode local context is updated
    }
    setReservations((prev) =>
      prev.map((r) =>
        r._id === id || r.id === id || r.pickupCode === id ? { ...r, status: newStatus } : r
      )
    );
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      await reservationService.updateStatus(cancelTarget._id, 'CANCELLED');
      setCancelTarget(null);
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch =
      !searchCode ||
      r.pickupCode?.toLowerCase().includes(searchCode.toLowerCase()) ||
      r.patientId?.name?.toLowerCase().includes(searchCode.toLowerCase()) ||
      r.patientId?.phone?.includes(searchCode);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Patient Holds & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage pending pickup orders, verify codes, and fulfill reserved medications.
          </p>
        </div>

        {/* Search pickup code or patient */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Search code or phone..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['ALL', 'PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED', 'EXPIRED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              filter === tab
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Loading incoming reservations..." />
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No reservations found"
          description="There are currently no patient reservations matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReservations.map((res) => {
            const expiresDate = new Date(res.expiresAt);
            const isExpired = new Date() > expiresDate && res.status === 'PENDING';

            return (
              <div
                key={res._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-mono font-extrabold text-sm text-slate-900 tracking-wider">
                      {res.pickupCode}
                    </span>
                    <StatusBadge status={isExpired ? 'EXPIRED' : res.status} />
                  </div>

                  {/* Patient Info */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-800 font-semibold text-xs">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{res.patientId?.name || 'Walk-in Patient'}</span>
                    </div>
                    {res.patientId?.phone && (
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${res.patientId.phone}`} className="hover:text-teal-600">
                          {res.patientId.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Order items */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1 text-xs">
                    {res.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>
                          {item.quantity}× <strong>{item.medicineName}</strong>
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Due at Counter</span>
                      <span className="text-teal-700">₹{res.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Expiry Timestamp */}
                  <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Hold Expiry: {expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Pharmacy Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {res.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCancelTarget(res)}
                        className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(res._id, 'CONFIRMED')}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                      >
                        Confirm Hold
                      </button>
                    </>
                  )}

                  {res.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(res._id, 'PICKED_UP')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      Complete & Mark Picked Up
                    </button>
                  )}

                  {(res.status === 'PICKED_UP' || res.status === 'CANCELLED' || res.status === 'EXPIRED') && (
                    <span className="text-[11px] text-slate-400 italic">No further actions available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Cancel Patient Reservation?"
        message={`Are you sure you want to cancel reservation ${cancelTarget?.pickupCode}? The reserved medicines will be restored to your live stock immediately.`}
        confirmText="Cancel Reservation"
        isDangerous={true}
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default PharmacyReservations;
