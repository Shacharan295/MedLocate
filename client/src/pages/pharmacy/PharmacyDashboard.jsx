import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inventoryService, reservationService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Package,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resInv, resRes] = await Promise.all([
        inventoryService.getAll(),
        reservationService.getAll({ limit: 10 })
      ]);
      setInventory(resInv.data?.data || []);
      setReservations(resRes.data?.data || []);
    } catch (err) {
      setError('Failed to load pharmacy dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalMedicines = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockItems = inventory.filter(
    (item) => item.quantity <= (item.lowStockThreshold || 10)
  );
  const pendingReservations = reservations.filter((r) => r.status === 'PENDING');
  const confirmedReservations = reservations.filter((r) => r.status === 'CONFIRMED');

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await reservationService.updateStatus(id, newStatus);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reservation status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Store: <strong>{user?.pharmacy?.name || 'Your Pharmacy'}</strong> ({user?.pharmacy?.address || 'Chennai'})
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Stock"
          value={totalStock}
          icon={Package}
          color="teal"
          subtitle={`${totalMedicines} distinct catalog items`}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          icon={AlertTriangle}
          color={lowStockItems.length > 0 ? 'rose' : 'emerald'}
          subtitle={lowStockItems.length > 0 ? 'Needs reordering' : 'Stock levels healthy'}
        />
        <StatsCard
          title="Pending Holds"
          value={pendingReservations.length}
          icon={Clock}
          color="amber"
          subtitle="Waiting for pickup confirmation"
        />
        <StatsCard
          title="Confirmed Orders"
          value={confirmedReservations.length}
          icon={CheckCircle}
          color="blue"
          subtitle="Ready for counter pickup"
        />
      </div>

      {/* Content Split: Incoming Holds & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Reservations Management */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Incoming Reservations</h3>
              <p className="text-xs text-slate-500">Confirm or complete patient holds</p>
            </div>
            <Link
              to="/pharmacy/reservations"
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
              No recent reservations placed at your store.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reservations.slice(0, 5).map((res) => (
                <div key={res._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {res.pickupCode}
                      </span>
                      <StatusBadge status={res.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Patient: <strong>{res.patientId?.name || 'Patient'}</strong> ({res.patientId?.phone})
                    </p>
                    <p className="text-xs text-slate-500">
                      {res.items[0]?.quantity}× {res.items[0]?.medicineName} • ₹{res.totalAmount}
                    </p>
                  </div>

                  {/* Actions for Pharmacy Staff */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {res.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(res._id, 'CONFIRMED')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Confirm Hold
                      </button>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(res._id, 'PICKED_UP')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Mark Picked Up
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Low Stock Watchlist */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Low Stock Watchlist</h3>
              <p className="text-xs text-slate-500">Items below replenishment threshold</p>
            </div>
            <Link
              to="/pharmacy/inventory?filter=low"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              All inventory items are currently above threshold levels.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">
                      {item.medicineId?.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {item.medicineId?.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {item.quantity} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
