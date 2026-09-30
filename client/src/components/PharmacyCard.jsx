import React from 'react';
import { MapPin, Phone, ShieldCheck, Clock, Check, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const PharmacyCard = ({ item, onSelect, onReserve, isSelected, isEmergency = false }) => {
  const { pharmacy, medicine, quantity, price, distanceKm, verified } = item;
  const isLowStock = quantity <= 5;

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer relative ${
        isSelected
          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      } ${isEmergency ? 'border-l-4 border-l-rose-500' : ''}`}
    >
      {/* Top row: Pharmacy Name + Verification + Distance */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
              {pharmacy.name}
            </h4>
            {verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                Verified
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Unverified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{pharmacy.address}</span>
          </p>
        </div>

        {/* Distance Badge */}
        <div className="text-right flex-shrink-0">
          <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            {distanceKm} km
          </span>
        </div>
      </div>

      {/* Middle row: Medicine details & Stock */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 block">
            {medicine.name}
          </span>
          <span className="text-[11px] text-slate-400">
            {medicine.genericName}
          </span>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900 block">
            ₹{price}
          </span>
          <div className="flex items-center space-x-1 justify-end mt-0.5">
            {isLowStock ? (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>Only {quantity} left</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {quantity} in stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <a
          href={`tel:${pharmacy.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-slate-500 hover:text-teal-600 flex items-center space-x-1 font-medium transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{pharmacy.phone}</span>
        </a>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReserve(item);
          }}
          disabled={quantity < 1}
          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-40"
        >
          Reserve for Pickup
        </button>
      </div>
    </div>
  );
};

export default PharmacyCard;
