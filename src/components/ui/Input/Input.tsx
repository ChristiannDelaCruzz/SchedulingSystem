// src/components/ui/Input/Input.tsx
import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string | React.ReactNode;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      className = '',
      type = 'text',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div
              className={`
                absolute left-4 top-1/2 -translate-y-1/2 transition-colors
                ${hasError ? 'text-red-500' : isFocused ? 'text-cyan' : 'text-slate-400'}
              `}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            required={required}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              w-full py-3.5 bg-white border-2 rounded-xl text-sm text-slate-900
              placeholder:text-slate-400 transition-all duration-200
              focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${icon && iconPosition === 'left' ? 'pl-11' : 'pl-4'}
              ${isPassword ? 'pr-12' : icon && iconPosition === 'right' ? 'pr-11' : 'pr-4'}
              ${
                hasError
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : isFocused
                  ? 'border-cyan ring-4 ring-cyan/10'
                  : 'border-slate-200 hover:border-slate-300'
              }
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {icon && iconPosition === 'right' && !isPassword && (
            <div
              className={`
                absolute right-4 top-1/2 -translate-y-1/2 transition-colors
                ${hasError ? 'text-red-500' : isFocused ? 'text-cyan' : 'text-slate-400'}
              `}
            >
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;