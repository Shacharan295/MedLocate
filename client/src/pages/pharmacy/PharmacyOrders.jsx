import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
  FileText,
  DollarSign,
  Package,
  Calendar,
  Filter,
  Check
} from 'lucide-react';

export const PharmacyOrders = () => {
  const { pharmacyUser } = useAuth();
  const { activePharmacy, getActivePharmacyReservations, updateReservationStatus } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const storeName = pharmacyUser?.pharmacyName || activePharmacy?.name || 'Porur Care Dispensary';
  const reservations = getActivePharmacyReservations();

  const handleMarkPickedUp = (resId) => {
    updateReservationStatus(resId, 'PICKED_UP');
  };

  const filteredOrders = reservations.filter((order) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PICKED_UP'
        ? order.status === 'PICKED_UP'
        : order.status === 'READY_FOR_PICKUP' || order.status === 'CONFIRMED';

    const pName = order.patientName || order.patientId?.name || '';
    const mName = order.medicineName || '';
    const code = order.pickupCode || order.id || '';
    const matchesSearch =
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalRevenue = reservations
    .filter((r) => r.status === 'PICKED_UP')
    .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || parseFloat(r.price) * (r.quantity || 1) || 0), 0);

  const pendingHolds = reservations.filter(
    (r) => r.status === 'READY_FOR_PICKUP' || r.status === 'CONFIRMED'
  ).length;

  const pickedUpCount = reservations.filter((r) => r.status === 'PICKED_UP').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Orders & Pickup Fulfillment
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              {storeName}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete transaction history and pickup verification records for this pharmacy.
          </p>
        </div>

        {/* Metrics Pill Grid */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <span className="text-slate-400 block font-medium">Pending Holds</span>
            <span className="text-base font-bold text-amber-600">{pendingHolds}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <span className="text-slate-400 block font-medium">Picked Up</span>
            <span className="text-base font-bold text-emerald-600">{pickedUpCount}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <span className="text-slate-400 block font-medium">Fulfilled Revenue</span>
            <span className="text-base font-bold text-slate-900">₹{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pickup code, patient, medicine..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Orders ({reservations.length})
          </button>
          <button
            onClick={() => setStatusFilter('READY_FOR_PICKUP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'READY_FOR_PICKUP'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Holds ({pendingHolds})
          </button>
          <button
            onClick={() => setStatusFilter('PICKED_UP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'PICKED_UP'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Picked Up ({pickedUpCount})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-700">No orders match the current filter</p>
            <p className="text-xs mt-1">New reservations made by patients will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const isPending = order.status === 'READY_FOR_PICKUP' || order.status === 'CONFIRMED';
              const isFulfilled = order.status === 'PICKED_UP';
              const pName = order.patientName || order.patientId?.name || 'Rahul Sharma';
              const pPhone = order.patientPhone || order.patientId?.phone || '+91 98401 23456';
              const mName = order.medicineName || 'Paracetamol 650mg';
              const qty = order.quantity || 1;
              const price = parseFloat(order.totalAmount || order.price * qty || 29.90).toFixed(2);

              return (
                <div key={order._id || order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isPending ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          {order.pickupCode || order.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isPending ? 'Ready for Pickup' : 'Picked Up'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {qty} × {mName}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{pName}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{pPhone}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{price}
                    </span>

                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleMarkPickedUp(order._id || order.id || order.pickupCode)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Picked Up</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dispensed</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyOrders;
