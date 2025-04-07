import React from 'react';
import "../../../styles/RadarChart.css";
import { Text } from '../Text';

export interface RadarChartProps {
  data?: StrainRadarData[];
  title?: string;
  subtitle?: string;
  dimensions?: RadarDimension[];
  className?: string;
  maxValue?: number;
  showLegend?: boolean;
  onStrainClick?: (strain: string) => void;
  size?: number;
}

export interface StrainRadarData {
  strain: string;
  strainType?: 'indica' | 'sativa' | 'hybrid';
  color?: string;
  values: {
    [dimension: string]: number;
  };
}

export interface RadarDimension {
  id: string;
  label: string;
  color?: string;
}

const defaultDimensions: RadarDimension[] = [
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'energy', label: 'Energy' },
  { id: 'focus', label: 'Focus' },
  { id: 'euphoria', label: 'Euphoria' },
  { id: 'sleep', label: 'Sleep' },
];

/**
 * RadarChart visualizes strain effectiveness across multiple dimensions
 */
const RadarChart: React.FC<RadarChartProps> = ({
  data = [],
  title = 'Strain Effectiveness',
  subtitle = 'Compare effects across dimensions',
  dimensions = defaultDimensions,
  className = '',
  maxValue = 10,
  showLegend = true,
  onStrainClick,
  size = 300,
}) => {
  // Sample data for the placeholder visualization
  const sampleData: StrainRadarData[] = [
    {
      strain: 'Purple Haze',
      strainType: 'sativa',
      color: '#7b2cbf', // Cannabis purple
      values: {
        relaxation: 5,
        creativity: 9,
        energy: 8,
        focus: 7,
        euphoria: 9,
        sleep: 3,
      },
    },
    {
      strain: 'Northern Lights',
      strainType: 'indica',
      color: '#43a047', // Cannabis green
      values: {
        relaxation: 9,
        creativity: 5,
        energy: 2,
        focus: 4,
        euphoria: 7,
        sleep: 9,
      },
    },
  ];

  // Use sample data for the placeholder
  const displayData = data.length > 0 ? data : sampleData;

  // Calculate points for each strain data
  const getPointsForStrain = (strainData: StrainRadarData): string => {
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    const angleIncrement = (2 * Math.PI) / dimensions.length;

    return dimensions
      .map((dimension, index) => {
        const value = strainData.values[dimension.id] || 0;
        const normalizedValue = (value / maxValue) * radius;
        const angle = index * angleIncrement - Math.PI / 2; // Start from top (270 degrees)
        const x = centerX + normalizedValue * Math.cos(angle);
        const y = centerY + normalizedValue * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Get color based on strain type or explicit color
  const getStrainColor = (strainData: StrainRadarData): string => {
    if (strainData.color) return strainData.color;
    
    switch (strainData.strainType) {
      case 'indica':
        return '#7b2cbf'; // Cannabis purple
      case 'sativa':
        return '#43a047'; // Cannabis green
      case 'hybrid':
        return '#ffc107'; // Cannabis gold
      default:
        return '#795548'; // Cannabis earth
    }
  };

  return (
    <div className={`radar-chart-container ${className}`}>
      {title && <Text variant="h4" className="chart-title">{title}</Text>}
      {subtitle && <Text variant="body-sm" className="chart-subtitle">{subtitle}</Text>}
      
      <div className="radar-chart" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Base grid circles */}
        <svg viewBox="0 0 100 100" className="radar-grid">
          <circle cx="50" cy="50" r="40" className="grid-circle" />
          <circle cx="50" cy="50" r="30" className="grid-circle" />
          <circle cx="50" cy="50" r="20" className="grid-circle" />
          <circle cx="50" cy="50" r="10" className="grid-circle" />
          
          {/* Dimension axis lines */}
          {dimensions.map((dimension, index) => {
            const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
            const x2 = 50 + 40 * Math.cos(angle);
            const y2 = 50 + 40 * Math.sin(angle);
            return (
              <line 
                key={dimension.id}
                x1="50" y1="50" 
                x2={x2} y2={y2} 
                className="axis-line"
              />
            );
          })}
        </svg>
        
        {/* Data polygons */}
        <svg viewBox="0 0 100 100" className="radar-data">
          {displayData.map((strainData, index) => (
            <g key={strainData.strain} className="strain-data-group">
              <polygon 
                points={getPointsForStrain(strainData)} 
                style={{ 
                  fill: `${getStrainColor(strainData)}66`, // Increased to 40% opacity
                  stroke: getStrainColor(strainData),
                  strokeWidth: '2'
                }}
                onClick={() => onStrainClick && onStrainClick(strainData.strain)}
              />
              {/* Data points */}
              {dimensions.map((dimension, dimIndex) => {
                const value = strainData.values[dimension.id] || 0;
                const normalizedValue = (value / maxValue) * 40;
                const angle = dimIndex * (2 * Math.PI / dimensions.length) - Math.PI / 2;
                const x = 50 + normalizedValue * Math.cos(angle);
                const y = 50 + normalizedValue * Math.sin(angle);
                return (
                  <circle 
                    key={`${strainData.strain}-${dimension.id}`}
                    cx={x} cy={y} r="3"
                    fill={getStrainColor(strainData)}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                    className="data-point"
                  />
                );
              })}
            </g>
          ))}
        </svg>
        
        {/* Dimension labels */}
        <div className="radar-labels">
          {dimensions.map((dimension, index) => {
            const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
            const radius = 48; // Slightly outside the main radar
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            
            // Calculate text anchor and position adjustment based on angle
            let textAnchor = "middle";
            let xAdjust = 0;
            let yAdjust = 0;
            
            if (angle === -Math.PI / 2) { // Top
              textAnchor = "middle";
              yAdjust = -10;
            } else if (angle === Math.PI / 2) { // Bottom
              textAnchor = "middle";
              yAdjust = 15;
            } else if (Math.cos(angle) > 0) { // Right half
              textAnchor = "start";
              xAdjust = 5;
            } else { // Left half
              textAnchor = "end";
              xAdjust = -5;
            }
            
            return (
              <div 
                key={dimension.id}
                className="dimension-label"
                style={{
                  left: `calc(${x}% + ${xAdjust}px)`,
                  top: `calc(${y}% + ${yAdjust}px)`,
                  textAlign: textAnchor === "middle" ? "center" : textAnchor === "start" ? "left" : "right",
                }}
              >
                {dimension.label}
              </div>
            );
          })}
        </div>
      </div>
      
      {showLegend && (
        <div className="chart-legend">
          {displayData.map((strainData) => (
            <div key={strainData.strain} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: getStrainColor(strainData) }}
              ></span>
              <span className="legend-label">{strainData.strain}</span>
              {strainData.strainType && (
                <span className={`strain-type-badge strain-type-${strainData.strainType}`}>
                  {strainData.strainType}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <Text variant="caption" className="chart-note">
        This is a visual representation. Actual data will be displayed when available.
      </Text>
    </div>
  );
};

export default RadarChart; 

