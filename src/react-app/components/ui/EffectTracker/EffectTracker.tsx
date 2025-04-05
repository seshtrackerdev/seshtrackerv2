import React, { useState } from 'react';

export interface EffectRating {
  name: string;
  value: number;
}

export interface EffectTrackerProps {
  onRatingChange?: (ratings: EffectRating[]) => void;
  initialRatings?: EffectRating[];
  maxRating?: number;
  className?: string;
}

/**
 * EffectTracker component - Allows users to track various effects during a session
 * This is a placeholder implementation that will be expanded with proper functionality later
 */
const EffectTracker: React.FC<EffectTrackerProps> = ({
  onRatingChange,
  initialRatings = [],
  maxRating = 10,
  className = '',
}) => {
  // Default effect types if none provided
  const defaultEffects = [
    'Euphoria',
    'Relaxation',
    'Energy',
    'Creativity',
    'Focus',
    'Pain Relief',
    'Appetite',
    'Anxiety Relief'
  ];

  // Initialize ratings state
  const [ratings, setRatings] = useState<EffectRating[]>(
    initialRatings.length > 0 
      ? initialRatings 
      : defaultEffects.map(effect => ({ name: effect, value: 0 }))
  );

  const handleRatingChange = (effectName: string, newValue: number) => {
    const updatedRatings = ratings.map(rating => 
      rating.name === effectName ? { ...rating, value: newValue } : rating
    );
    
    setRatings(updatedRatings);
    
    if (onRatingChange) {
      onRatingChange(updatedRatings);
    }
  };

  return (
    <div className={`effect-tracker ${className}`} style={{
      padding: '16px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <h3 style={{ marginBottom: '16px' }}>Effect Tracker</h3>
      <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
        Track how you're feeling during your session
      </p>
      
      <div className="effects-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {ratings.map((effect, index) => (
          <div key={index} className="effect-item" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <div className="effect-name" style={{ 
              flexBasis: '30%',
              fontWeight: '500'
            }}>
              {effect.name}
            </div>
            
            <div className="effect-slider" style={{ 
              flexBasis: '60%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="range"
                min="0"
                max={maxRating}
                value={effect.value}
                onChange={(e) => handleRatingChange(effect.name, parseInt(e.target.value))}
                style={{ 
                  flexGrow: 1,
                  accentColor: 'var(--accent-color)'
                }}
              />
              <span style={{ 
                minWidth: '24px',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                {effect.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="effects-footer" style={{ 
        marginTop: '20px',
        textAlign: 'center',
        padding: '8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--text-muted)'
      }}>
        Full Effect Tracker implementation coming soon...
      </div>
    </div>
  );
};

export default EffectTracker; 