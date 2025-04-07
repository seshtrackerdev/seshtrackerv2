import React, { forwardRef } from 'react';
import "../../../styles/.css";

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'filled' | 'outlined';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorText,
      size = 'md',
      variant = 'outlined',
      fullWidth = false,
      startIcon,
      endIcon,
      disabled = false,
      required = false,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const inputClasses = [
      'input',
      `input-${size}`,
      `input-${variant}`,
      error && 'input-error',
      disabled && 'input-disabled',
      startIcon && 'input-with-start-icon',
      endIcon && 'input-with-end-icon',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const containerClasses = [
      'input-container',
      fullWidth && 'input-full-width',
      containerClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-wrapper">
          {startIcon && <div className="input-icon input-start-icon">{startIcon}</div>}
          <input ref={ref} className={inputClasses} disabled={disabled} required={required} {...rest} />
          {endIcon && <div className="input-icon input-end-icon">{endIcon}</div>}
        </div>
        {(helperText || (error && errorText)) && (
          <div className={`input-helper-text ${error ? 'input-error-text' : ''}`}>
            {error ? errorText : helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 
