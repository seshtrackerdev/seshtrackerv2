import React from 'react';
import "../../../styles/Badge.css";

export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark'
  | 'cannabis'
  | 'purple'
  | 'gold'
  | 'earth'
  | 'gradient';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  outlined?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
  leafIcon?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  outlined = false,
  removable = false,
  onRemove,
  icon,
  className = '',
  leafIcon = false,
}) => {
  const badgeClasses = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    rounded && 'badge-rounded',
    outlined && 'badge-outlined',
    icon && 'badge-with-icon',
    leafIcon && 'badge-with-leaf',
    removable && 'badge-removable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClasses}>
      {icon && <span className="badge-icon">{icon}</span>}
      {leafIcon && (
        <span className="badge-leaf-icon">
          🍃
        </span>
      )}
      <span className="badge-content">{children}</span>
      {removable && (
        <button
          type="button"
          className="badge-remove-button"
          onClick={onRemove}
          aria-label="Remove"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="badge-remove-icon">
            <path
              d="M18 6L6 18M6 6l12 12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge; 
