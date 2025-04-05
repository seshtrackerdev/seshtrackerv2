import React from 'react';
import { Text } from '../Text';

export interface HeatmapChartProps {
  data?: HeatmapData[];
  title?: string;
  subtitle?: string;
  xAxisLabels?: string[];
  yAxisLabels?: string[];
  colorScale?: string[];
  minValue?: number;
  maxValue?: number;
  cellSize?: number;
  className?: string;
  onCellClick?: (data: HeatmapCellData) => void;
  showLegend?: boolean;
}

export interface HeatmapData {
  x: number | string;
  y: number | string;
  value: number;
  label?: string;
}

export interface HeatmapCellData extends HeatmapData {
  xLabel: string;
  yLabel: string;
  color: string;
}

/**
 * HeatmapChart shows intensity of effects across different time periods
 */
const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data = [],
  title = 'Mood/Effect Intensity',
  subtitle = 'Visualize patterns across time periods',
  xAxisLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  yAxisLabels = ['Morning', 'Afternoon', 'Evening', 'Night'],
  colorScale = ['#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688'],
  minValue = 0,
  maxValue = 10,
  cellSize = 50,
  className = '',
  onCellClick,
  showLegend = true,
}) => {
  // Sample data for demonstration if no data is provided
  const sampleData: HeatmapData[] = [];
  
  // Generate sample data if none is provided
  if (data.length === 0) {
    for (let x = 0; x < xAxisLabels.length; x++) {
      for (let y = 0; y < yAxisLabels.length; y++) {
        // Create realistic-looking pattern with some randomness
        // Higher values in evenings, on weekends, etc.
        let baseValue = 3; // Base value
        
        // Higher in evenings and nights
        if (y >= 2) baseValue += 2;
        
        // Higher on weekends
        if (x >= 5) baseValue += 1.5;
        
        // Add some randomness
        const randomFactor = Math.random() * 3;
        const value = Math.min(Math.max(baseValue + randomFactor, minValue), maxValue);
        
        sampleData.push({
          x,
          y,
          value: Math.round(value * 10) / 10, // Round to 1 decimal place
        });
      }
    }
  }
  
  // Use sample data or provided data
  const displayData = data.length > 0 ? data : sampleData;
  
  // Get color for a value based on the color scale
  const getColorForValue = (value: number): string => {
    // Normalize value to 0-1 range
    const normalizedValue = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
    const index = Math.min(Math.floor(normalizedValue * colorScale.length), colorScale.length - 1);
    return colorScale[index];
  };
  
  // Convert numeric coordinates to labels
  const getLabel = (coord: number | string, labels: string[]): string => {
    if (typeof coord === 'string') return coord;
    return labels[coord] || `${coord}`;
  };
  
  // Handle cell click event
  const handleCellClick = (cellData: HeatmapData) => {
    if (onCellClick) {
      const xLabel = getLabel(cellData.x, xAxisLabels);
      const yLabel = getLabel(cellData.y, yAxisLabels);
      const color = getColorForValue(cellData.value);
      
      onCellClick({
        ...cellData,
        xLabel,
        yLabel,
        color,
      });
    }
  };
  
  // Calculate the width and height of the heatmap grid
  const gridWidth = xAxisLabels.length * cellSize;
  const gridHeight = yAxisLabels.length * cellSize;
  
  return (
    <div className={`heatmap-chart-container ${className}`}>
      {title && <Text variant="h4" className="chart-title">{title}</Text>}
      {subtitle && <Text variant="body-sm" className="chart-subtitle">{subtitle}</Text>}
      
      <div className="heatmap-chart">
        {/* Y-Axis Labels */}
        <div className="heatmap-y-axis">
          {yAxisLabels.map((label, index) => (
            <div 
              key={`y-${index}`} 
              className="heatmap-axis-label y-label"
              style={{ height: `${cellSize}px` }}
            >
              {label}
            </div>
          ))}
        </div>
        
        {/* Main Heatmap Grid */}
        <div className="heatmap-grid-container">
          <div 
            className="heatmap-grid"
            style={{ 
              gridTemplateColumns: `repeat(${xAxisLabels.length}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${yAxisLabels.length}, ${cellSize}px)`,
              width: `${gridWidth}px`,
              height: `${gridHeight}px`,
            }}
          >
            {displayData.map((cellData, index) => {
              const xIndex = typeof cellData.x === 'number' ? cellData.x : xAxisLabels.indexOf(cellData.x as string);
              const yIndex = typeof cellData.y === 'number' ? cellData.y : yAxisLabels.indexOf(cellData.y as string);
              const color = getColorForValue(cellData.value);
              
              return (
                <div 
                  key={`cell-${index}`}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: color,
                    gridColumn: xIndex + 1,
                    gridRow: yIndex + 1,
                  }}
                  onClick={() => handleCellClick(cellData)}
                  title={cellData.label || `${getLabel(cellData.x, xAxisLabels)}, ${getLabel(cellData.y, yAxisLabels)}: ${cellData.value}`}
                >
                  <span className="cell-value">{cellData.value}</span>
                </div>
              );
            })}
          </div>
          
          {/* X-Axis Labels */}
          <div 
            className="heatmap-x-axis"
            style={{ width: `${gridWidth}px` }}
          >
            {xAxisLabels.map((label, index) => (
              <div 
                key={`x-${index}`} 
                className="heatmap-axis-label x-label"
                style={{ width: `${cellSize}px` }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Color Scale Legend */}
      {showLegend && (
        <div className="heatmap-legend">
          <div className="legend-title">Intensity Scale</div>
          <div className="legend-scale">
            <div className="scale-labels">
              <span>{minValue}</span>
              <span>{Math.round((maxValue - minValue) / 2 + minValue)}</span>
              <span>{maxValue}</span>
            </div>
            <div className="scale-gradient">
              <div 
                className="gradient-bar"
                style={{
                  background: `linear-gradient(to right, ${colorScale.join(', ')})`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      <Text variant="caption" className="chart-note">
        This visualization shows the intensity of effects across different times.
      </Text>
    </div>
  );
};

export default HeatmapChart; 