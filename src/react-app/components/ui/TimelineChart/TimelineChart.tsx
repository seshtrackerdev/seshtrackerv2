import React, { useMemo } from 'react';
import "../../../styles/TimelineChart.css";

interface TimelineEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  duration?: number; // in minutes
  category?: string;
  color?: string;
  icon?: string;
  details?: string;
}

interface TimelinePeriod {
  start: Date;
  end: Date;
  label: string;
}

interface TimelineChartProps {
  /**
   * Array of events to display on the timeline
   */
  events?: TimelineEvent[];
  
  /**
   * Title of the chart
   */
  title?: string;
  
  /**
   * Subtitle or description
   */
  subtitle?: string;
  
  /**
   * Time period to display (calculated from events if not provided)
   */
  period?: TimelinePeriod;
  
  /**
   * Whether to group events by day
   */
  groupByDay?: boolean;
  
  /**
   * Whether to show a legend for categories
   */
  showLegend?: boolean;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Callback fired when an event is clicked
   */
  onEventClick?: (event: TimelineEvent) => void;
  
  /**
   * Format to display dates (default: day-month)
   */
  dateFormat?: 'day-month' | 'month-day' | 'full-date' | 'time-only';
  
  /**
   * Whether to highlight the current day
   */
  highlightToday?: boolean;
  
  /**
   * Height of the chart
   */
  height?: string;
}

/**
 * TimelineChart component for visualizing session durations and patterns over time
 */
const TimelineChart: React.FC<TimelineChartProps> = ({
  events,
  title = 'Session Timeline',
  subtitle = 'Track your session patterns over time',
  period,
  groupByDay = true,
  showLegend = true,
  className = '',
  onEventClick,
  dateFormat = 'day-month',
  highlightToday = true,
  height = '400px'
}) => {
  // Generate sample data if none provided
  const timelineEvents = useMemo(() => {
    if (events && events.length > 0) return events;
    
    // Current date for reference
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Generate events for the past 14 days
    const sampleEvents: TimelineEvent[] = [];
    const categories = ['Relaxation', 'Creativity', 'Pain Management', 'Sleep'];
    const colors = ['#4CAF50', '#2196F3', '#F44336', '#9C27B0'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random number of sessions per day (0-3)
      const sessionsCount = Math.floor(Math.random() * 4);
      
      for (let j = 0; j < sessionsCount; j++) {
        const categoryIndex = Math.floor(Math.random() * categories.length);
        const startHour = 12 + Math.floor(Math.random() * 10); // Between 12pm and 10pm
        const duration = 15 + Math.floor(Math.random() * 90); // 15-105 minutes
        
        const startDate = new Date(date);
        startDate.setHours(startHour, Math.floor(Math.random() * 60));
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + duration);
        
        sampleEvents.push({
          id: `event-${i}-${j}`,
          title: categories[categoryIndex],
          startDate,
          endDate,
          duration,
          category: categories[categoryIndex],
          color: colors[categoryIndex],
          details: `${duration} min session for ${categories[categoryIndex].toLowerCase()}`
        });
      }
    }
    
    return sampleEvents;
  }, [events]);
  
  // Calculate the time period to display
  const timelinePeriod = useMemo(() => {
    if (period) return period;
    
    // Find the earliest and latest dates in the events
    let earliest = new Date();
    let latest = new Date(0);
    
    timelineEvents.forEach(event => {
      if (event.startDate < earliest) earliest = new Date(event.startDate);
      if (event.endDate && event.endDate > latest) latest = new Date(event.endDate);
      else if (event.startDate > latest) latest = new Date(event.startDate);
    });
    
    // Default to last 14 days if no events or period specified
    if (latest.getTime() === 0) {
      latest = new Date();
      earliest = new Date();
      earliest.setDate(earliest.getDate() - 13);
    }
    
    // Ensure we have at least 14 days
    const daysDiff = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 14) {
      earliest = new Date(latest);
      earliest.setDate(earliest.getDate() - 13);
    }
    
    // Round to full days
    earliest.setHours(0, 0, 0, 0);
    latest.setHours(23, 59, 59, 999);
    
    return {
      start: earliest,
      end: latest,
      label: `${formatDate(earliest)} - ${formatDate(latest)}`
    };
  }, [period, timelineEvents]);
  
  // Format date based on the specified format
  function formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    switch (dateFormat) {
      case 'day-month':
        return `${day}/${month}`;
      case 'month-day':
        return `${month}/${day}`;
      case 'full-date':
        return `${day}/${month}/${year}`;
      case 'time-only':
        return `${hours}:${minutes}`;
      default:
        return `${day}/${month}`;
    }
  }
  
  // Group events by day
  const groupedEvents = useMemo(() => {
    if (!groupByDay) return timelineEvents;
    
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    timelineEvents.forEach(event => {
      const dateKey = `${event.startDate.getFullYear()}-${event.startDate.getMonth() + 1}-${event.startDate.getDate()}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    
    return Object.values(groups).flat();
  }, [timelineEvents, groupByDay]);
  
  // Get unique categories for the legend
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    timelineEvents.forEach(event => {
      if (event.category) uniqueCategories.add(event.category);
    });
    return Array.from(uniqueCategories);
  }, [timelineEvents]);
  
  // Get category color
  const getCategoryColor = (category: string): string => {
    const event = timelineEvents.find(e => e.category === category);
    return event?.color || '#777';
  };
  
  // Handle event click
  const handleEventClick = (event: TimelineEvent) => {
    if (onEventClick) onEventClick(event);
  };
  
  // Generate day markers for the timeline
  const dayMarkers = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(timelinePeriod.start);
    const end = new Date(timelinePeriod.end);
    
    while (start <= end) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    
    return days;
  }, [timelinePeriod]);
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className={`timeline-chart-container ${className}`}>
      {title && <h3 className="chart-title">{title}</h3>}
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      
      <div className="timeline-period">
        <span className="period-label">{timelinePeriod.label}</span>
      </div>
      
      <div className="timeline-chart" style={{ height }}>
        <div className="timeline-days">
          {dayMarkers.map((day, index) => (
            <div 
              key={`day-${index}`} 
              className={`timeline-day ${highlightToday && isToday(day) ? 'today' : ''}`}
            >
              <span className="day-label">{formatDate(day)}</span>
            </div>
          ))}
        </div>
        
        <div className="timeline-events">
          {groupedEvents.map((event, index) => {
            // Calculate position on the timeline
            const totalDays = Math.ceil((timelinePeriod.end.getTime() - timelinePeriod.start.getTime()) / (1000 * 60 * 60 * 24));
            const daysSinceStart = Math.ceil((event.startDate.getTime() - timelinePeriod.start.getTime()) / (1000 * 60 * 60 * 24));
            const positionPercentage = (daysSinceStart / totalDays) * 100;
            
            return (
              <div 
                key={`event-${event.id || index}`}
                className="timeline-event"
                style={{ 
                  left: `${positionPercentage}%`,
                  backgroundColor: event.color || '#4CAF50'
                }}
                onClick={() => handleEventClick(event)}
                title={`${event.title}: ${event.details || ''}`}
              >
                <div className="event-duration">
                  {event.duration ? `${event.duration}m` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {showLegend && categories.length > 0 && (
        <div className="timeline-legend">
          {categories.map((category, index) => (
            <div key={`legend-${index}`} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: getCategoryColor(category) }}
              ></span>
              <span className="legend-label">{category}</span>
            </div>
          ))}
        </div>
      )}
      
      <p className="chart-note">View your session duration patterns over time</p>
    </div>
  );
};

export default TimelineChart; 

