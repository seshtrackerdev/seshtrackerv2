import React from 'react';

interface FeatureSectionProps {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
  ctaText?: string;
  ctaOnClick?: () => void;
  gradientColors?: {
    from: string;
    to: string;
  };
  forwardedRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  id,
  title,
  description,
  imageSrc,
  imageAlt,
  features,
  ctaText,
  ctaOnClick,
  gradientColors = { from: "#43a047", to: "#76d275" },
  forwardedRef,
  className = "",
}) => {
  return (
    <section 
      id={id} 
      ref={forwardedRef} 
      className={`feature-section tour-section ${className}`}
    >
      <div className="feature-content">
        <h2 
          className="feature-title"
          style={{
            background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </h2>
        
        {description && (
          <p className="feature-description">{description}</p>
        )}
        
        {imageSrc && (
          <div className="feature-image-container">
            <img src={imageSrc} alt={imageAlt || title} className="feature-image" />
          </div>
        )}
        
        {features && features.length > 0 && (
          <div className="feature-cards">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-card-icon">{feature.icon}</div>
                <div className="feature-card-content">
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {ctaText && (
          <button 
            className="feature-cta-button"
            onClick={ctaOnClick}
            style={{
              background: `linear-gradient(90deg, ${gradientColors.from}, ${gradientColors.to})`,
            }}
          >
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
};

export default FeatureSection; 