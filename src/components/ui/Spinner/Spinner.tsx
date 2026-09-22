// src/components/ui/Spinner/Spinner.tsx
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} border-navy border-t-cyan rounded-full animate-spin`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};

export default Spinner;