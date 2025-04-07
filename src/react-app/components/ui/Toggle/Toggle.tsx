import React, { useEffect, useRef } from 'react';
import "../../../styles/.css";

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  label?: string;
  labelPosition?: 'left' | 'right';
  name?: string;
  className?: string;
  ariaLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  labelPosition = 'right',
  name,
  className = '',
  ariaLabel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const toggleClasses = [
    'toggle',
    `toggle-${size}`,
    checked ? 'toggle-checked' : '',
    disabled ? 'toggle-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    // Prevent default behavior to avoid checkbox state being toggled twice
    e.preventDefault(); 
    
    if (!disabled) {
      onChange(!checked);
    }
  };

  // Force update the DOM to match the React state
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.checked = checked;
    }
  }, [checked]);

  const toggleSwitch = (
    <div
      className={toggleClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="switch"
      tabIndex={disabled ? -1 : 0}
      aria-checked={checked}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
    >
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        disabled={disabled}
        className="toggle-input"
        name={name}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );

  if (!label) {
    return toggleSwitch;
  }

  return (
    <label 
      className={`toggle-container toggle-label-${labelPosition}`} 
      onClick={handleLabelClick}
    >
      {labelPosition === 'left' && <span className="toggle-label">{label}</span>}
      {toggleSwitch}
      {labelPosition === 'right' && <span className="toggle-label">{label}</span>}
    </label>
  );
};

export default Toggle; 
