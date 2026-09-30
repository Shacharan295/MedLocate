import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, color = 'teal', subtitle }) => {
  const colorStyles = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              colorStyles[color] || colorStyles.teal
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
