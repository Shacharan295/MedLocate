import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle,
  AlertTriangle,
  QrCode
} from 'lucide-react';

export const PatientReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationService.getAll();
      setReservations(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelClick = (reservation) => {
    setCancelTarget(reservation);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      await reservationService.updateStatus(cancelTarget._id, 'CANCELLED');
      setIsCancelModalOpen(false);
      setCancelTarget(null);
      await fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    return r.status === selectedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Medicine Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Present your pickup code at the pharmacy counter to collect your held medicines.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                selectedFilter === tab
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Retrieving your reservation history..." />
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No reservations found"
          description="You do not have any reservations matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReservations.map((res) => {
            const isHoldActive = res.status === 'PENDING';
            const expiresDate = new Date(res.expiresAt);
            const isExpired = new Date() > expiresDate && res.status === 'PENDING';

            return (
              <div
                key={res._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code + Status Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-4 h-4 text-teal-600" />
                      <span className="font-mono font-bold text-sm tracking-wider text-slate-900">
                        {res.pickupCode}
                      </span>
                    </div>
                    <StatusBadge status={isExpired ? 'EXPIRED' : res.status} />
                  </div>

                  {/* Pharmacy Details */}
                  <div className="mt-3.5 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{res.pharmacyId?.name}</h3>
                    <p className="text-xs text-slate-500 flex items-start space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{res.pharmacyId?.address}</span>
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1.5">
                    {res.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-700">
                        <span>
                          {item.quantity}× <strong>{item.medicineName}</strong>
                        </span>
                        <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-teal-700">₹{res.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Expiration Notice */}
                  {res.status === 'PENDING' && !isExpired && (
                    <div className="mt-3.5 flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Hold expires at: <strong>{expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isHoldActive && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCancelClick(res)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      Cancel Hold
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        title="Cancel Medicine Reservation?"
        message={`Are you sure you want to release the hold on reservation ${cancelTarget?.pickupCode}? The held medicine quantity will immediately be restored to public pharmacy stock.`}
        confirmText="Release Hold"
        isDangerous={true}
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setCancelTarget(null);
        }}
      />
    </div>
  );
};

export default PatientReservations;
