import React from 'react';
import "../../../styles/Text.css";

type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body' | 'body-sm' | 'body-lg'
  | 'caption';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: React.ElementType;
  children: React.ReactNode;
  gradient?: 'green' | 'purple' | 'none';
  truncate?: boolean;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  as,
  children,
  className = '',
  gradient = 'none',
  truncate = false,
  ...props
}) => {
  const Component = as || (
    variant.startsWith('h') ? variant : 
    variant === 'body' || variant === 'body-sm' || variant === 'body-lg' ? 'p' : 'span'
  ) as React.ElementType;
  
  const gradientClass = gradient !== 'none' 
    ? gradient === 'green' 
      ? 'brand-gradient' 
      : 'brand-gradient-purple'
    : '';
  
  const truncateClass = truncate ? 'text-truncate' : '';
  
  return (
    <Component 
      className={`text-${variant} ${gradientClass} ${truncateClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Text; 

