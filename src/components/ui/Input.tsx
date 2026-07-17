import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, hint, className = '', id, placeholder, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full text-left">
        <div className="floating-group">
          {/* Left Icon */}
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10 pointer-events-none">
              {leftIcon}
            </span>
          )}

          {/* Form Input */}
          <input
            ref={ref}
            id={inputId}
            placeholder={placeholder || ' '} /* Critical for floating label placeholder-shown selector */
            className={`floating-input min-h-[48px] ${leftIcon ? 'floating-input-icon' : ''} ${
              rightIcon ? 'pr-10' : ''
            } ${
              error
                ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/10'
                : ''
            } ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {/* Floating Label */}
          {label && (
            <label
              htmlFor={inputId}
              className={`floating-label ${leftIcon ? 'floating-label-icon' : ''} ${
                error ? 'text-red-500 dark:text-red-400' : ''
              }`}
            >
              {label}
            </label>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Supporting message text */}
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium pl-1">
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 pl-1">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
