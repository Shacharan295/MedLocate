import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There is currently nothing to display in this section.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
