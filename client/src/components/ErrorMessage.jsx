import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between p-4 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-rose-900">Notice</h4>
          <p className="mt-0.5 text-rose-700">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
