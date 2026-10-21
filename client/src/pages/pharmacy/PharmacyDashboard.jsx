import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePharmacy } from '../../context/PharmacyContext';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Store,
  CheckCircle2,
  Calendar,
  User,
  Phone
} from 'lucide-react';

export const PharmacyDashboard = () => {
  const { pharmacyUser } = useAuth();
  const {
    activePharmacy,
    getActivePharmacyInventory,
    getActivePharmacyReservations,
    updateReservationStatus
  } = usePharmacy();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Compute live active pharmacy data
  const inventory = getActivePharmacyInventory();
  const reservations = getActivePharmacyReservations();

  const totalMedicines = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockItems = inventory.filter(
    (item) => item.quantity <= (item.lowStockThreshold || 10)
  );

  const pendingReservations = reservations.filter(
    (r) => r.status === 'READY_FOR_PICKUP' || r.status === 'CONFIRMED' || r.status === 'PENDING'
  );
  const confirmedOrders = reservations.filter(
    (r) => r.status === 'PICKED_UP'
  );

  const storeName = pharmacyUser?.pharmacyName || activePharmacy?.name || 'Porur Care Dispensary';
  const storeAddress = pharmacyUser?.address || activePharmacy?.address || 'Mount-Poonamallee High Road, Porur, Chennai 600116';

  const handleUpdateStatus = (id, newStatus) => {
    updateReservationStatus(id, newStatus);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>MedLocate Pharmacy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {storeName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center space-x-1.5 flex-wrap">
            <span className="font-semibold text-slate-800">Pharmacy Management</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{storeAddress}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Live Inventory</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: Total Stock, Low Stock Alerts, Pending Holds, Confirmed Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="TOTAL STOCK"
          value={totalStock}
          icon={Package}
          color="teal"
          subtitle={`${totalMedicines} catalog SKUs`}
        />
        <StatsCard
          title="LOW STOCK ALERTS"
          value={lowStockItems.length}
          icon={AlertTriangle}
          color={lowStockItems.length > 0 ? 'rose' : 'emerald'}
          subtitle={lowStockItems.length > 0 ? 'Replenishment needed' : 'Adequate buffer units'}
        />
        <StatsCard
          title="PENDING HOLDS"
          value={pendingReservations.length}
          icon={Clock}
          color="amber"
          subtitle="Awaiting patient pickup"
        />
        <StatsCard
          title="CONFIRMED ORDERS"
          value={confirmedOrders.length}
          icon={CheckCircle}
          color="blue"
          subtitle="Dispensed to patients"
        />
      </div>

      {/* Content Split: Incoming Reservations & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Reservations Management */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">INCOMING RESERVATIONS</h3>
              <p className="text-xs text-slate-500">Live patient holds for {storeName}</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {reservations.length} total
            </span>
          </div>

          {reservations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent reservations placed at {storeName}.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reservations.map((res) => {
                const resId = res._id || res.id || res.pickupCode;
                const isReady = res.status === 'READY_FOR_PICKUP' || res.status === 'CONFIRMED' || res.status === 'PENDING';
                const isPickedUp = res.status === 'PICKED_UP';
                const patientName = res.patientName || res.patientId?.name || 'Rahul Sharma';
                const patientPhone = res.patientPhone || res.patientId?.phone || '+91 98401 23456';
                const medicineName = res.medicineName || res.items?.[0]?.medicineName || 'Paracetamol 650mg';
                const quantity = res.quantity || res.items?.[0]?.quantity || 1;
                const price = parseFloat(res.totalAmount || res.price * quantity || 29.90).toFixed(2);

                return (
                  <div key={resId} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          {res.pickupCode || res.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isReady
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isReady ? 'Ready for Pickup' : 'Picked Up'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {patientName}
                      </h4>

                      <p className="text-xs text-slate-700 font-medium">
                        {quantity} × {medicineName}
                      </p>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">₹{price}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{patientPhone}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions for Pharmacy Staff */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      {isReady && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(resId, 'PICKED_UP')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Picked Up</span>
                        </button>
                      )}
                      {isPickedUp && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Picked Up</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Low Stock Watchlist */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Low Stock Alerts</h3>
              <p className="text-xs text-slate-500">Items below threshold for {storeName}</p>
            </div>
            <Link
              to="/pharmacy/inventory"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>Manage all ({inventory.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              All inventory items in {storeName} are currently above replenishment threshold.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.map((item) => (
                <div key={item._id || item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">
                      {item.medicineName || item.medicineId?.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      ₹{item.price?.toFixed(2)} • {item.medicineId?.category || 'Prescription Drug'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
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
