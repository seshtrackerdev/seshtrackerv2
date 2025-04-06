import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface GradientColors {
  from: string;
  to: string;
}

interface FeatureSectionProps {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  features?: Feature[];
  ctaText: string;
  ctaOnClick: () => void;
  gradientColors?: GradientColors;
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
  gradientColors,
  forwardedRef,
  className = '',
}) => {
  // Setup gradient style if colors are provided
  const gradientStyle = gradientColors 
    ? { 
        backgroundImage: `linear-gradient(90deg, ${gradientColors.from}, ${gradientColors.to})`,
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      } 
    : {};

  return (
    <section 
      id={id} 
      ref={forwardedRef} 
      className={`tour-section ${className}`}
      data-section-id={id}
    >
      <div className="container">
        <div className="section-content">
          <h2 className="section-title">{title}</h2>
          
          {description && (
            <p className="section-description">{description}</p>
          )}
          
          {imageSrc && (
            <div className="section-image-container">
              <img 
                src={imageSrc} 
                alt={imageAlt || title} 
                className="section-image"
              />
            </div>
          )}
          
          {features && features.length > 0 && (
            <div className="feature-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="btn btn-primary next-button"
            onClick={ctaOnClick}
            style={gradientStyle}
          >
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection; 