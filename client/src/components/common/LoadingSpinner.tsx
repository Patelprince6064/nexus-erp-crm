import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading details...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-6 flex-1 bg-slate-200 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
};
