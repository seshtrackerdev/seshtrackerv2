import React from 'react';
import "../../../styles/.css";

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'text' 
  | 'danger'
  | 'cannabis'
  | 'purple'
  | 'gradient'
  | 'gold'
  | 'pixel';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonWidth = 'auto' | 'full';
export type ButtonIconPosition = 'left' | 'right';

export type ButtonEffect = 
  | 'triple-leaf'
  | 'glow'
  | 'smoke'
  | 'shimmer'
  | 'none';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  rounded?: boolean;
  effect?: ButtonEffect;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  width = 'auto',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ariaLabel,
  rounded = false,
  effect = 'none',
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    width === 'full' ? 'btn-full' : '',
    icon ? `btn-with-icon btn-icon-${iconPosition}` : '',
    loading ? 'btn-loading' : '',
    rounded ? 'btn-rounded' : '',
    effect !== 'none' ? `btn-${effect}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="btn-icon">{icon}</span>
      )}
      
      <span className="btn-text">{children}</span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="btn-icon">{icon}</span>
      )}
    </button>
  );
};

export default Button; 
