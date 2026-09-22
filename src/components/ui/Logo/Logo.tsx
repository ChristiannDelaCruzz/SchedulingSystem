// src/components/ui/Logo/Logo.tsx
import React from 'react';
import { Calendar } from 'lucide-react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-navy to-navy-dark rounded-xl shadow-md shadow-navy/20 flex-shrink-0">
        <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-cyan to-cyan-dark rounded-full border-2 border-white" />
      </div>

      {variant === 'full' && (
        <span className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
          Schedule<span className="text-navy">Pro</span>
        </span>
      )}
    </div>
  );
};

export default Logo;