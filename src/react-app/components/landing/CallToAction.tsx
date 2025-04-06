import React from 'react';
import { Link } from 'react-router-dom';

interface CallToActionProps {
  id?: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  forwardedRef: React.RefObject<HTMLElement | null>;
}

const CallToAction: React.FC<CallToActionProps> = ({
  id,
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  forwardedRef
}) => {
  return (
    <section id={id} ref={forwardedRef} className="cta-section tour-section">
      <div className="cta-content">
        <h2 className="cta-title">{title}</h2>
        <p className="cta-description">{description}</p>
        
        <div className="cta-buttons">
          <Link to={primaryButtonLink} className="cta-button cta-primary-button">
            {primaryButtonText}
          </Link>
          
          {secondaryButtonText && secondaryButtonLink && (
            <Link to={secondaryButtonLink} className="cta-button cta-secondary-button">
              {secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 