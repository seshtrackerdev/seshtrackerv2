import React, { useState, useCallback, useEffect } from 'react';
import { Text } from '../Text';
import "../../../styles/RatingSlider.css";

export interface RatingSliderProps {
  /**
   * Value of the rating slider (0-10)
   */
  value?: number;
  
  /**
   * Callback when the rating changes
   */
  onChange?: (value: number) => void;
  
  /**
   * Label to display above the slider
   */
  label?: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Whether to show emoji indicators
   */
  showEmojis?: boolean;
  
  /**
   * Whether to show numeric value
   */
  showValue?: boolean;
  
  /**
   * Minimum value (default: 0)
   */
  min?: number;
  
  /**
   * Maximum value (default: 10)
   */
  max?: number;
  
  /**
   * Step size for the slider (default: 1)
   */
  step?: number;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;
}

/**
 * Rating slider with emoji indicators for intuitive feedback
 */
const RatingSlider: React.FC<RatingSliderProps> = ({
  value = 0,
  onChange,
  label = 'Rating',
  description,
  showEmojis = true,
  showValue = true,
  min = 0,
  max = 10,
  step = 1,
  className = '',
  size = 'md',
  disabled = false
}) => {
  const [internalValue, setInternalValue] = useState<number>(value);
  
  // Update internal value and call onChange prop
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);
  
  // Update if prop value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  // Get emoji based on rating value
  const getEmoji = (): string => {
    const normalizedValue = (internalValue - min) / (max - min);
    
    if (normalizedValue <= 0.1) return '😐';
    if (normalizedValue <= 0.3) return '🙂';
    if (normalizedValue <= 0.5) return '😊';
    if (normalizedValue <= 0.7) return '😄';
    if (normalizedValue <= 0.9) return '🤩';
    return '🔥';
  };
  
  // Get label text based on rating value
  const getLabel = (): string => {
    const normalizedValue = (internalValue - min) / (max - min);
    
    if (normalizedValue <= 0.1) return 'Neutral';
    if (normalizedValue <= 0.3) return 'Mild';
    if (normalizedValue <= 0.5) return 'Moderate';
    if (normalizedValue <= 0.7) return 'Strong';
    if (normalizedValue <= 0.9) return 'Very Strong';
    return 'Intense';
  };
  
  // Calculate track gradient background for visual feedback
  const trackStyle = {
    background: `linear-gradient(to right, var(--cannabis-green) 0%, var(--cannabis-green) ${(internalValue - min) / (max - min) * 100}%, var(--bg-tertiary) ${(internalValue - min) / (max - min) * 100}%, var(--bg-tertiary) 100%)`
  };
  
  return (
    <div className={`rating-slider ${className} rating-slider-${size}`}>
      {label && (
        <div className="rating-slider-header">
          <Text variant="body-sm" className="rating-slider-label">{label}</Text>
          {showValue && <span className="rating-slider-value">{internalValue}</span>}
        </div>
      )}
      
      <div className="rating-slider-container">
        <div className="rating-slider-track" style={trackStyle}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={internalValue}
            onChange={handleChange}
            disabled={disabled}
            className="rating-slider-input"
          />
        </div>
        
        {showEmojis && (
          <div className="rating-slider-emoji-container">
            <div 
              className="rating-slider-emoji"
              style={{ left: `${(internalValue - min) / (max - min) * 100}%` }}
            >
              {getEmoji()}
            </div>
          </div>
        )}
      </div>
      
      {description && (
        <Text variant="caption" className="rating-slider-description">
          {description}
        </Text>
      )}
      
      <div className="rating-slider-labels">
        <Text variant="caption" className="rating-intensity-label">
          {getLabel()}
        </Text>
      </div>
    </div>
  );
};

export default RatingSlider; 

