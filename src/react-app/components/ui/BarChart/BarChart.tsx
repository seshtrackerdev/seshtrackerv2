import React, { useMemo } from 'react';
import "../../../styles/BarChart.css";

interface BarChartData {
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number;
}

interface BarChartProps {
  /**
   * Array of data points to display in the chart
   */
  data?: BarChartData[];
  
  /**
   * Optional title for the chart
   */
  title?: string;
  
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  
  /**
   * Maximum value for the y-axis (calculated from data if not provided)
   */
  maxValue?: number;
  
  /**
   * Whether to show data labels on bars
   */
  showDataLabels?: boolean;
  
  /**
   * Whether to enable hover effects
   */
  enableHover?: boolean;
  
  /**
   * Whether to show a legend
   */
  showLegend?: boolean;
  
  /**
   * Whether to enable animation
   */
  animated?: boolean;
  
  /**
   * Optional comparison label for secondary values
   */
  comparisonLabel?: string;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Callback fired when a bar is clicked
   */
  onBarClick?: (data: BarChartData) => void;
  
  /**
   * Width of the chart (default: 100%)
   */
  width?: string;
  
  /**
   * Height of the chart (default: 300px)
   */
  height?: string;
  
  /**
   * Orientation of the chart (default: vertical)
   */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * BarChart component for comparing methods, strains, or other categorical data
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Method Comparison',
  subtitle = 'Comparison of effectiveness by consumption method',
  maxValue,
  showDataLabels = true,
  enableHover = true,
  showLegend = true,
  animated = true,
  comparisonLabel = 'Previous Period',
  className = '',
  onBarClick,
  width = '100%',
  height = '300px',
  orientation = 'vertical'
}) => {
  // Generate sample data if none provided
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    
    return [
      { label: 'Vaporizer', value: 85, secondaryValue: 75, color: '#4CAF50' },
      { label: 'Joint', value: 72, secondaryValue: 78, color: '#2196F3' },
      { label: 'Bong', value: 68, secondaryValue: 65, color: '#9C27B0' },
      { label: 'Edible', value: 90, secondaryValue: 82, color: '#FF9800' },
      { label: 'Tincture', value: 62, secondaryValue: 58, color: '#F44336' }
    ];
  }, [data]);

  // Calculate max value for y-axis
  const yMax = useMemo(() => {
    if (maxValue) return maxValue;
    
    let max = 0;
    chartData.forEach(item => {
      max = Math.max(max, item.value);
      if (item.secondaryValue) {
        max = Math.max(max, item.secondaryValue);
      }
    });
    
    // Add 10% padding to the max value
    return Math.ceil(max * 1.1);
  }, [chartData, maxValue]);

  // Create tick marks for y-axis
  const yAxisTicks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, i) => 
      Math.round((yMax / (tickCount - 1)) * i)
    );
  }, [yMax]);
  
  // Handle bar click
  const handleBarClick = (item: BarChartData) => {
    if (onBarClick) {
      onBarClick(item);
    }
  };
  
  // Determine if we're showing comparison bars
  const hasComparison = useMemo(() => {
    return chartData.some(item => item.secondaryValue !== undefined);
  }, [chartData]);

  // Horizontal orientation classes and styles
  const chartClasses = `bar-chart-container ${className} ${orientation === 'horizontal' ? 'horizontal' : 'vertical'} ${animated ? 'animated' : ''}`;
  
  return (
    <div className={chartClasses} style={{ width }}>
      {title && <h3 className="chart-title">{title}</h3>}
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      
      <div className="bar-chart" style={{ height }}>
        <div className="chart-y-axis">
          {yAxisTicks.map((tick, index) => (
            <div key={`y-tick-${index}`} className="y-axis-tick">
              <span className="tick-label">{tick}</span>
              <span className="tick-line"></span>
            </div>
          ))}
        </div>
        
        <div className="chart-content">
          {chartData.map((item, index) => {
            const barHeight = `${(item.value / yMax) * 100}%`;
            const barWidth = orientation === 'horizontal' ? barHeight : `${100 / (chartData.length * (hasComparison ? 1.5 : 1))}%`;
            const comparisonHeight = item.secondaryValue ? `${(item.secondaryValue / yMax) * 100}%` : '0%';
            
            return (
              <div 
                key={`bar-group-${index}`} 
                className="bar-group"
                style={{ 
                  width: orientation === 'horizontal' ? 'auto' : barWidth 
                }}
              >
                <div 
                  className={`bar primary-bar ${enableHover ? 'hoverable' : ''}`}
                  style={{ 
                    height: orientation === 'vertical' ? barHeight : '100%',
                    width: orientation === 'horizontal' ? barHeight : '100%',
                    backgroundColor: item.color || `hsl(${(index * 50) % 360}, 70%, 50%)`
                  }}
                  onClick={() => handleBarClick(item)}
                >
                  {showDataLabels && (
                    <span className="data-label">{item.value}</span>
                  )}
                </div>
                
                {hasComparison && item.secondaryValue !== undefined && (
                  <div 
                    className={`bar comparison-bar ${enableHover ? 'hoverable' : ''}`}
                    style={{ 
                      height: orientation === 'vertical' ? comparisonHeight : '100%',
                      width: orientation === 'horizontal' ? comparisonHeight : '100%'
                    }}
                    onClick={() => handleBarClick({...item, value: item.secondaryValue || 0 })}
                  >
                    {showDataLabels && (
                      <span className="data-label comparison-label">{item.secondaryValue}</span>
                    )}
                  </div>
                )}
                
                <span className="x-axis-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {showLegend && hasComparison && (
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color primary"></span>
            <span className="legend-label">Current Period</span>
          </div>
          <div className="legend-item">
            <span className="legend-color comparison"></span>
            <span className="legend-label">{comparisonLabel}</span>
          </div>
        </div>
      )}
      
      <p className="chart-note">Compare effectiveness ratings across different consumption methods</p>
    </div>
  );
};

export default BarChart; 

