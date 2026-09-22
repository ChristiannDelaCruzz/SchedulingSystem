// src/components/ui/Card/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hover?: boolean;
  noPadding?: boolean;
  noOverflow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  hover = false,
  noPadding = false,
  noOverflow = false,
}) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200 shadow-sm
        ${noOverflow ? '' : 'overflow-hidden'}
        ${hover ? 'transition-all duration-300 hover:shadow-md hover:border-slate-300' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-100">
          {title && (
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;