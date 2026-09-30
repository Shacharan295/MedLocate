import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} border-teal-200 border-t-teal-600 rounded-full animate-spin`}
      />
      {message && <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
