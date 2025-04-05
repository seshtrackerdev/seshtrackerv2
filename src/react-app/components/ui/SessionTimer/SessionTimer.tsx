import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';
import { Text } from '../Text';

export interface SessionTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  className?: string;
  onComplete?: () => void;
  onMilestone?: (seconds: number) => void;
  milestones?: number[];
  onTick?: (seconds: number) => void;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'standard' | 'circular' | 'minimal';
  onMarkerAdd?: (seconds: number, note: string) => void;
}

/**
 * SessionTimer provides a visual countdown with animated elements
 * that track active session time.
 */
const SessionTimer: React.FC<SessionTimerProps> = ({
  initialSeconds = 0,
  autoStart = false,
  className = '',
  onComplete,
  onMilestone,
  milestones = [300, 600, 900, 1800, 3600], // 5min, 10min, 15min, 30min, 1hr
  onTick,
  showControls = true,
  size = 'md',
  variant = 'circular',
  onMarkerAdd
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [markers, setMarkers] = useState<{time: number, note: string}[]>([]);
  const [showMarkerInput, setShowMarkerInput] = useState(false);
  const [markerNote, setMarkerNote] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousMilestoneIndexRef = useRef(-1);
  
  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  // Calculate progress for circular timer
  const calculateProgress = (): number => {
    if (variant !== 'circular') return 0;
    
    // We'll use modulo 3600 (1 hour) to make the circle repeat every hour
    const secondsInHour = 3600;
    const progress = (seconds % secondsInHour) / secondsInHour;
    return progress;
  };
  
  // CircularProgressPath calculation
  const getCircularProgressPath = (): string => {
    const progress = calculateProgress();
    const radius = 45; // SVG viewBox is 100x100, with center at 50,50
    const circumference = 2 * Math.PI * radius;
    
    // Start from the top (270 degrees)
    const startAngle = -90;
    const endAngle = startAngle + (progress * 360);
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate the end point of the arc
    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);
    
    // Determine if it's a long arc (> 180 degrees)
    const largeArcFlag = progress > 0.5 ? 1 : 0;
    
    return `M 50,50 L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
  };
  
  // Handle timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Check if we've hit a milestone
          if (onMilestone && milestones) {
            const milestoneIndex = milestones.findIndex(m => m === newSeconds);
            if (milestoneIndex !== -1 && milestoneIndex > previousMilestoneIndexRef.current) {
              previousMilestoneIndexRef.current = milestoneIndex;
              onMilestone(newSeconds);
            }
          }
          
          // Call onTick if provided
          if (onTick) {
            onTick(newSeconds);
          }
          
          return newSeconds;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, onMilestone, milestones, onTick]);
  
  // Start the timer
  const start = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  
  // Pause the timer
  const pause = () => {
    setIsPaused(true);
  };
  
  // Resume the timer
  const resume = () => {
    setIsPaused(false);
  };
  
  // Reset the timer
  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
    setIsPaused(false);
    previousMilestoneIndexRef.current = -1;
  };
  
  // Add a marker at the current time
  const addMarker = () => {
    if (showMarkerInput) {
      if (markerNote.trim()) {
        const newMarker = { time: seconds, note: markerNote };
        setMarkers([...markers, newMarker]);
        
        if (onMarkerAdd) {
          onMarkerAdd(seconds, markerNote);
        }
      }
      
      setShowMarkerInput(false);
      setMarkerNote('');
    } else {
      setShowMarkerInput(true);
    }
  };
  
  // Render the appropriate timer variant
  const renderTimer = () => {
    switch (variant) {
      case 'circular':
        return (
          <div className={`session-timer-circular session-timer-${size}`}>
            <svg viewBox="0 0 100 100" className="timer-svg">
              {/* Background circle */}
              <circle 
                cx="50" cy="50" r="45" 
                className="timer-circle-bg"
              />
              
              {/* Progress path */}
              <path 
                d={getCircularProgressPath()} 
                className="timer-progress-path"
              />
              
              {/* Center circle */}
              <circle 
                cx="50" cy="50" r="40" 
                className="timer-center"
              />
              
              {/* Small pulsing circle */}
              <circle 
                cx="50" cy="50" r="2" 
                className="timer-pulse"
              />
              
              {/* Animated tick markers (60 seconds) */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6) - 90; // 6 degrees per second, starting from top
                const rad = (angle * Math.PI) / 180;
                const x = 50 + 42 * Math.cos(rad);
                const y = 50 + 42 * Math.sin(rad);
                
                return (
                  <circle 
                    key={`tick-${i}`}
                    cx={x} cy={y} r="0.7"
                    className={`timer-tick ${i % 5 === 0 ? 'timer-tick-major' : ''}`}
                    style={{
                      opacity: seconds % 60 === i ? 1 : 0.3,
                      transform: seconds % 60 === i ? 'scale(1.5)' : 'scale(1)',
                    }}
                  />
                );
              })}
            </svg>
            
            <div className="timer-content">
              <Text variant="h3" className="timer-display">
                {formatTime(seconds)}
              </Text>
              
              {markers.length > 0 && (
                <div className="marker-indicator">
                  <span className="marker-dot"></span>
                  <span className="marker-count">{markers.length}</span>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'minimal':
        return (
          <div className={`session-timer-minimal session-timer-${size}`}>
            <Text variant={size === 'lg' ? 'h2' : size === 'md' ? 'h3' : 'h4'} className="timer-display">
              {formatTime(seconds)}
            </Text>
            
            <div className="timer-minimal-progress">
              <div 
                className="timer-minimal-bar"
                style={{ width: `${(seconds % 60) / 60 * 100}%` }}
              ></div>
            </div>
          </div>
        );
        
      case 'standard':
      default:
        return (
          <div className={`session-timer-standard session-timer-${size}`}>
            <div className="timer-standard-display">
              <Text variant={size === 'lg' ? 'h2' : size === 'md' ? 'h3' : 'h4'} className="timer-display">
                {formatTime(seconds)}
              </Text>
            </div>
            
            <div className="timer-progress-wrapper">
              <div 
                className="timer-progress-bar"
                style={{ width: `${(seconds % 60) / 60 * 100}%` }}
              ></div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className={`session-timer-container ${className}`}>
      {renderTimer()}
      
      {showControls && (
        <div className="timer-controls">
          {!isActive && (
            <Button variant="cannabis" size="sm" onClick={start}>
              Start
            </Button>
          )}
          
          {isActive && !isPaused && (
            <Button variant="secondary" size="sm" onClick={pause}>
              Pause
            </Button>
          )}
          
          {isActive && isPaused && (
            <Button variant="cannabis" size="sm" onClick={resume}>
              Resume
            </Button>
          )}
          
          {isActive && (
            <Button variant="outline" size="sm" onClick={reset}>
              Reset
            </Button>
          )}
          
          {isActive && onMarkerAdd && (
            <Button 
              variant={showMarkerInput ? "purple" : "outline"} 
              size="sm" 
              onClick={addMarker}
            >
              {showMarkerInput ? "Save Marker" : "Add Marker"}
            </Button>
          )}
        </div>
      )}
      
      {showMarkerInput && (
        <div className="marker-input-container">
          <input
            type="text"
            className="marker-input"
            placeholder="Note for this moment..."
            value={markerNote}
            onChange={(e) => setMarkerNote(e.target.value)}
            autoFocus
          />
        </div>
      )}
      
      {markers.length > 0 && (
        <div className="markers-list">
          <Text variant="body-sm" className="markers-header">
            Session Markers
          </Text>
          {markers.map((marker, index) => (
            <div key={index} className="marker-item">
              <span className="marker-time">{formatTime(marker.time)}</span>
              <span className="marker-note">{marker.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionTimer; 