import React, { forwardRef } from 'react';
import "../../../styles/Checkbox.css";

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: CheckboxSize;
  error?: boolean;
  indeterminate?: boolean;
  className?: string;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = 'md',
      error = false,
      indeterminate = false,
      className = '',
      labelClassName = '',
      id,
      disabled = false,
      checked,
      onChange,
      ...rest
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = (node: HTMLInputElement) => {
      // Set indeterminate property as it's not controllable via HTML
      if (node) {
        node.indeterminate = indeterminate;
      }

      // Forward ref
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }

      // Store in local ref
      inputRef.current = node;
    };

    const checkboxClasses = [
      'checkbox',
      `checkbox-${size}`,
      error && 'checkbox-error',
      disabled && 'checkbox-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = ['checkbox-label', labelClassName].filter(Boolean).join(' ');

    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <label htmlFor={checkboxId} className={labelClasses}>
        <div className="checkbox-container">
          <input
            type="checkbox"
            ref={combinedRef}
            id={checkboxId}
            className={checkboxClasses}
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            {...rest}
          />
          <div className="checkbox-custom" aria-hidden="true">
            {checked && !indeterminate && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="checkbox-check-icon">
                <path
                  d="M5 13l4 4L19 7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {indeterminate && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="checkbox-indeterminate-icon">
                <path
                  d="M5 12h14"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
        {label && <span className="checkbox-text">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 

