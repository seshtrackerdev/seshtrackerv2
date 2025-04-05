import React from 'react';
import './TrendChart.css';
import { Card, CardBody } from '../Card';
import { Text } from '../Text';

export interface TrendChartProps {
  data?: TrendDataPoint[];
  title?: string;
  subtitle?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  height?: number;
  className?: string;
  highlightedStrain?: string;
  highlightedMethod?: string;
  showLegend?: boolean;
  onPointClick?: (dataPoint: TrendDataPoint) => void;
}

export interface TrendDataPoint {
  date: Date | string;
  value: number;
  strain?: string;
  method?: string;
  note?: string;
}

/**
 * TrendChart displays usage patterns over time, helping users identify trends in their consumption habits.
 */
const TrendChart: React.FC<TrendChartProps> = ({
  data = [],
  title = 'Usage Trend',
  subtitle = 'Track your consumption patterns over time',
  period = 'weekly',
  height = 300,
  className = '',
  highlightedStrain,
  highlightedMethod,
  showLegend = true,
  onPointClick
}) => {
  // This is a placeholder for the actual chart implementation
  // In the future, this would use a charting library like Chart.js, Recharts, or D3.js
  
  return (
    <div className={`trend-chart-container ${className}`}>
      {title && <Text variant="h4" className="chart-title">{title}</Text>}
      {subtitle && <Text variant="body-sm" className="chart-subtitle">{subtitle}</Text>}
      
      <div 
        className="trend-chart-placeholder" 
        style={{ height: `${height}px` }}
        data-period={period}
      >
        <div className="chart-axis chart-y-axis">
          <div className="axis-label">Usage</div>
          <div className="axis-tick">High</div>
          <div className="axis-tick">Medium</div>
          <div className="axis-tick">Low</div>
        </div>
        
        <div className="chart-visualization">
          <div className="chart-grid">
            {[...Array(7)].map((_, i) => (
              <div key={`grid-vertical-${i}`} className="grid-line-vertical"></div>
            ))}
            {[...Array(3)].map((_, i) => (
              <div key={`grid-horizontal-${i}`} className="grid-line-horizontal"></div>
            ))}
          </div>
          
          <div className="chart-line">
            {/* Placeholder for the trend line - would be calculated from actual data */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="trend-path">
              <path 
                d="M0,80 C20,40 30,90 40,60 S60,10 80,20 L100,30" 
                stroke="var(--cannabis-green)" 
                fill="none" 
                strokeWidth="2"
              />
              <path 
                d="M0,80 C20,40 30,90 40,60 S60,10 80,20 L100,30" 
                stroke="none" 
                fill="url(#trendGradient)" 
                opacity="0.2"
              />
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--cannabis-green)" />
                  <stop offset="100%" stopColor="var(--cannabis-green)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Placeholder data points */}
            <div className="data-point" style={{ left: '0%', bottom: '20%' }}></div>
            <div className="data-point" style={{ left: '20%', bottom: '60%' }}></div>
            <div className="data-point" style={{ left: '40%', bottom: '40%' }}></div>
            <div className="data-point" style={{ left: '60%', bottom: '90%' }}></div>
            <div className="data-point highlighted" style={{ left: '80%', bottom: '80%' }}></div>
            <div className="data-point" style={{ left: '100%', bottom: '70%' }}></div>
          </div>
        </div>
        
        <div className="chart-axis chart-x-axis">
          <div className="axis-label">Time ({period})</div>
          {period === 'daily' && (
            <>
              <div className="axis-tick">Mon</div>
              <div className="axis-tick">Tue</div>
              <div className="axis-tick">Wed</div>
              <div className="axis-tick">Thu</div>
              <div className="axis-tick">Fri</div>
              <div className="axis-tick">Sat</div>
              <div className="axis-tick">Sun</div>
            </>
          )}
          {period === 'weekly' && (
            <>
              <div className="axis-tick">Week 1</div>
              <div className="axis-tick">Week 2</div>
              <div className="axis-tick">Week 3</div>
              <div className="axis-tick">Week 4</div>
            </>
          )}
          {period === 'monthly' && (
            <>
              <div className="axis-tick">Jan</div>
              <div className="axis-tick">Feb</div>
              <div className="axis-tick">Mar</div>
              <div className="axis-tick">Apr</div>
              <div className="axis-tick">May</div>
              <div className="axis-tick">Jun</div>
            </>
          )}
        </div>
      </div>
      
      {showLegend && (
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--cannabis-green)' }}></span>
            <span className="legend-label">Usage Frequency</span>
          </div>
          {highlightedStrain && (
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'var(--cannabis-purple)' }}></span>
              <span className="legend-label">{highlightedStrain}</span>
            </div>
          )}
          {highlightedMethod && (
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'var(--cannabis-gold)' }}></span>
              <span className="legend-label">{highlightedMethod}</span>
            </div>
          )}
        </div>
      )}
      
      <Text variant="caption" className="chart-note">
        This is a visual representation. Actual data will be displayed when available.
      </Text>
    </div>
  );
};

export default TrendChart; 