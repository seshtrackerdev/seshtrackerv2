import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  bordered?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

// Define the type for Card component with subcomponents
interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
}

// Create the Card component
const Card: CardComponent = ({ 
  children,
  className = '',
  elevation = 'md',
  bordered = false,
  fullWidth = false,
  onClick,
}) => {
  const cardClasses = [
    'card',
    elevation !== 'none' && `card-elevation-${elevation}`,
    bordered && 'card-bordered',
    fullWidth && 'card-full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  // If children are provided, use them instead of the title/subtitle/action structure
  if (React.Children.count(children) > 0) {
    return <div className={`card-header ${className}`}>{children}</div>;
  }

  return (
    <div className={`card-header ${className}`}>
      <div className="card-header-content">
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  return (
    <div className={`card-body card-padding-${padding} ${className}`}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  align = 'between',
}) => {
  return (
    <div className={`card-footer card-footer-${align} ${className}`}>
      {children}
    </div>
  );
};

// Add subcomponents to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card, CardHeader, CardBody, CardFooter };
export default Card; 