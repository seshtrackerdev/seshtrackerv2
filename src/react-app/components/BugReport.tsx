import React, { useState, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';

// Styles for the bug report modal
const bugReportStyles: Record<string, CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9998,
  },
  triggerButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    fontSize: '24px',
    transition: 'all 0.2s ease',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9997,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#333',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #999',
    fontSize: '14px',
    color: '#333',
    backgroundColor: '#fff',
    width: '100%',
    zIndex: 10000,
    position: 'relative',
  },
  textarea: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #999',
    fontSize: '14px',
    minHeight: '120px',
    resize: 'vertical',
    color: '#333',
    backgroundColor: '#fff',
    width: '100%',
    zIndex: 10000,
    position: 'relative',
  },
  select: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #999',
    fontSize: '14px',
    color: '#333',
    backgroundColor: '#fff',
    cursor: 'pointer',
    width: '100%',
    zIndex: 10001,
    position: 'relative',
    appearance: 'menulist', // Forces native dropdown appearance
    WebkitAppearance: 'menulist', // For Safari
    MozAppearance: 'menulist', // For Firefox
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #999',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  detailsSection: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px',
    maxHeight: '150px',
    overflowY: 'auto',
    border: '1px solid #999',
    color: '#333',
  },
  detailItem: {
    margin: '4px 0',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#333',
  },
  successMessage: {
    backgroundColor: '#dff2d8',
    color: '#3c763d',
    padding: '16px',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '16px',
  },
  errorMessage: {
    backgroundColor: '#f2dede',
    color: '#a94442',
    padding: '16px',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '16px',
  },
  captureToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '12px 0',
    color: '#333',
    userSelect: 'none',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 10001,
    margin: '0 8px 0 0',
    accentColor: '#4CAF50',
  },
  checkboxLabel: {
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '5px 0',
  },
  checkpoint: {
    cursor: 'pointer',
    color: '#2196F3',
    textDecoration: 'underline',
    fontSize: '14px',
    marginTop: '8px',
  },
  markerMode: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    color: 'white',
    textAlign: 'center',
    zIndex: 10000,
    fontSize: '14px',
    fontWeight: 'bold',
  },
  marker: {
    position: 'absolute',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(244, 67, 54, 0.5)',
    border: '2px solid #f44336',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 9999,
  },
  markerCenter: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  markerInner: {
    position: 'absolute',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};

// Bug severity levels
const severityLevels = [
  { value: 'low', label: 'Low - Minor issue, doesn\'t affect functionality' },
  { value: 'medium', label: 'Medium - Functionality partially impaired' },
  { value: 'high', label: 'High - Major feature broken' },
  { value: 'critical', label: 'Critical - Application completely unusable' }
];

interface ErrorData {
  message: string;
  stack?: string;
  time: string;
  type: 'error' | 'unhandledrejection' | 'console';
  source?: string;
  line?: number;
  column?: number;
}

interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: string;
  contentType?: string;
  size?: number;
  error?: string;
}

interface BugReportProps {
  enabled?: boolean;
}

interface SystemInfo {
  userAgent: string;
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  screenResolution: string;
  viewport: string;
  url: string;
  referrer: string;
  timestamp: string;
  localStorageAvailable: boolean;
  cookiesEnabled: boolean;
  connection?: string;
  memoryInfo?: any;
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  errors?: ErrorData[];
  networkRequests?: NetworkRequest[];
}

const BugReport: React.FC<BugReportProps> = ({ enabled = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [email, setEmail] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const [includeStorageData, setIncludeStorageData] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [userActions, setUserActions] = useState<string[]>([]);
  const [isMarkerMode, setIsMarkerMode] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{ x: number, y: number } | null>(null);
  const [markerImage, setMarkerImage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [includeErrorData, setIncludeErrorData] = useState(true);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [includeNetworkData, setIncludeNetworkData] = useState(true);

  const location = useLocation();

  // Collect system information when component mounts
  useEffect(() => {
    if (enabled) {
      collectSystemInfo();
    }
  }, [enabled]);

  // Update system info when location changes
  useEffect(() => {
    if (enabled) {
      collectSystemInfo();
    }
  }, [location, enabled]);

  // Track user actions for reproduction steps
  useEffect(() => {
    if (enabled) {
      const trackableEvents = ['click', 'input', 'change', 'submit'];
      
      const handleUserAction = (e: Event) => {
        const target = e.target as HTMLElement;
        const elementType = target.tagName.toLowerCase();
        const elementId = target.id ? `#${target.id}` : '';
        const elementClass = target.className && typeof target.className === 'string' 
          ? `.${target.className.split(' ')[0]}` 
          : '';
        const elementText = target.textContent ? 
          (target.textContent.length > 20 ? 
            `"${target.textContent.substring(0, 20)}..."` : 
            `"${target.textContent}"`) 
          : '';
        
        let actionDescription = `${e.type} on ${elementType}${elementId}${elementClass} ${elementText}`;
        
        if (e.type === 'input' || e.type === 'change') {
          if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
            const inputElement = target as HTMLInputElement;
            actionDescription = `${e.type} "${inputElement.value.substring(0, 10)}${inputElement.value.length > 10 ? '...' : ''}" on ${elementType}${elementId}${elementClass}`;
          }
        }
        
        setUserActions(prev => {
          const newActions = [...prev, actionDescription];
          // Keep only the last 20 actions
          return newActions.slice(-20);
        });
      };
      
      trackableEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUserAction, { capture: true });
      });
      
      return () => {
        trackableEvents.forEach(eventType => {
          document.removeEventListener(eventType, handleUserAction, { capture: true });
        });
      };
    }
  }, [enabled]);

  // Listen for clicks when in marker mode
  useEffect(() => {
    if (!isMarkerMode) return;
    
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      setMarkerPosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isMarkerMode]);

  // Add a new function to confirm marker position
  const confirmMarkerPosition = async () => {
    if (!markerPosition) return;
    
    // Capture screenshot with marker
    const screenshot = await captureScreenshot();
    if (screenshot) {
      setMarkerImage(screenshot);
    }
    
    setIsMarkerMode(false);
    setIsOpen(true);
  };

  // Track JS errors for debugging
  useEffect(() => {
    if (!enabled) return;
    
    const errorListener = (event: ErrorEvent) => {
      const errorData: ErrorData = {
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        time: new Date().toISOString(),
        type: 'error',
        source: event.filename,
        line: event.lineno,
        column: event.colno
      };
      
      setErrors(prev => {
        // Keep only the last 10 errors to avoid excessive data
        const newErrors = [...prev, errorData];
        if (newErrors.length > 10) {
          return newErrors.slice(-10);
        }
        return newErrors;
      });
    };
    
    const rejectionListener = (event: PromiseRejectionEvent) => {
      let message = 'Promise rejected';
      let stack = undefined;
      
      if (event.reason) {
        if (typeof event.reason === 'string') {
          message = event.reason;
        } else if (event.reason instanceof Error) {
          message = event.reason.message;
          stack = event.reason.stack;
        } else {
          try {
            message = JSON.stringify(event.reason);
          } catch (e) {
            message = 'Unhandled promise rejection (unable to stringify reason)';
          }
        }
      }
      
      const errorData: ErrorData = {
        message,
        stack,
        time: new Date().toISOString(),
        type: 'unhandledrejection'
      };
      
      setErrors(prev => {
        const newErrors = [...prev, errorData];
        if (newErrors.length > 10) {
          return newErrors.slice(-10);
        }
        return newErrors;
      });
    };
    
    // Capture console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      try {
        let message = '';
        if (args.length > 0) {
          if (args[0] instanceof Error) {
            message = args[0].message;
          } else if (typeof args[0] === 'string') {
            message = args[0];
          } else {
            try {
              message = JSON.stringify(args[0]);
            } catch (e) {
              message = 'Error (unable to stringify)';
            }
          }
          
          if (args.length > 1) {
            message += ' ' + args.slice(1).join(' ');
          }
        }
        
        const errorData: ErrorData = {
          message: message || 'Console error',
          time: new Date().toISOString(),
          type: 'console'
        };
        
        setErrors(prev => {
          const newErrors = [...prev, errorData];
          if (newErrors.length > 10) {
            return newErrors.slice(-10);
          }
          return newErrors;
        });
      } catch (e) {
        // Ignore errors in our error handler
      }
    };
    
    window.addEventListener('error', errorListener);
    window.addEventListener('unhandledrejection', rejectionListener);
    
    return () => {
      window.removeEventListener('error', errorListener);
      window.removeEventListener('unhandledrejection', rejectionListener);
      console.error = originalConsoleError;
    };
  }, [enabled]);

  // Monitor network requests
  useEffect(() => {
    if (!enabled) return;
    
    // Create XHR proxy to track all XHR requests
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string) {
      // @ts-ignore - Add debugging properties
      this._debugStartTime = Date.now();
      // @ts-ignore
      this._debugMethod = method;
      // @ts-ignore
      this._debugUrl = url;
      return originalXHROpen.apply(this, arguments as any);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
      const xhr = this;
      
      xhr.addEventListener('load', function() {
        try {
          // @ts-ignore
          const duration = Date.now() - xhr._debugStartTime;
          const newRequest: NetworkRequest = {
            // @ts-ignore
            url: xhr._debugUrl,
            // @ts-ignore
            method: xhr._debugMethod,
            status: xhr.status,
            duration,
            timestamp: new Date().toISOString(),
            contentType: xhr.getResponseHeader('Content-Type') || undefined,
            size: xhr.responseText?.length || 0,
          };
          
          setNetworkRequests(prev => {
            const newRequests = [...prev, newRequest];
            // Keep last 20 requests
            return newRequests.slice(-20);
          });
        } catch (e) {
          console.error('Error tracking XHR request', e);
        }
      });
      
      xhr.addEventListener('error', function() {
        try {
          // @ts-ignore
          const duration = Date.now() - xhr._debugStartTime;
          const newRequest: NetworkRequest = {
            // @ts-ignore
            url: xhr._debugUrl,
            // @ts-ignore
            method: xhr._debugMethod,
            status: 0,
            duration,
            timestamp: new Date().toISOString(),
            error: 'Network error',
          };
          
          setNetworkRequests(prev => {
            const newRequests = [...prev, newRequest];
            return newRequests.slice(-20);
          });
        } catch (e) {
          console.error('Error tracking XHR request error', e);
        }
      });
      
      return originalXHRSend.apply(this, arguments as any);
    };
    
    // Track fetch requests if available
    const originalFetch = window.fetch;
    if (originalFetch) {
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const startTime = Date.now();
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const method = init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET');
        
        return originalFetch
          .apply(this, arguments as any)
          .then(async (response) => {
            try {
              const duration = Date.now() - startTime;
              const respClone = response.clone();
              
              const newRequest: NetworkRequest = {
                url: url,
                method: method || 'GET',
                status: response.status,
                duration,
                timestamp: new Date().toISOString(),
                contentType: response.headers.get('Content-Type') || undefined,
              };
              
              // Try to get size if possible
              try {
                const text = await respClone.text();
                newRequest.size = text.length;
              } catch {
                // Ignore if we can't get the text
              }
              
              setNetworkRequests(prev => {
                const newRequests = [...prev, newRequest];
                return newRequests.slice(-20);
              });
            } catch (e) {
              console.error('Error tracking fetch request', e);
            }
            
            return response;
          })
          .catch((err) => {
            try {
              const duration = Date.now() - startTime;
              const newRequest: NetworkRequest = {
                url: url,
                method: method || 'GET',
                status: 0,
                duration,
                timestamp: new Date().toISOString(),
                error: err.message || 'Fetch error',
              };
              
              setNetworkRequests(prev => {
                const newRequests = [...prev, newRequest];
                return newRequests.slice(-20);
              });
            } catch (e) {
              console.error('Error tracking fetch request error', e);
            }
            
            throw err;
          });
      };
    }
    
    return () => {
      // Restore original methods
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      if (originalFetch) {
        window.fetch = originalFetch;
      }
    };
  }, [enabled]);

  const collectSystemInfo = () => {
    try {
      const userAgent = navigator.userAgent;
      const browserInfo = detectBrowser(userAgent);
      
      const systemInfo: SystemInfo = {
        userAgent,
        browserName: browserInfo.name,
        browserVersion: browserInfo.version,
        operatingSystem: detectOS(userAgent),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toISOString(),
        localStorageAvailable: isLocalStorageAvailable(),
        cookiesEnabled: navigator.cookieEnabled,
        errors: includeErrorData ? errors : undefined,
        networkRequests: includeNetworkData ? networkRequests : undefined,
      };
      
      // Add connection info if available
      if ('connection' in navigator && navigator.connection) {
        const conn = (navigator as any).connection;
        systemInfo.connection = `${conn.effectiveType || 'unknown'} (Downlink: ${conn.downlink || 'unknown'} Mbps)`;
      }
      
      // Add memory info if available
      if ('memory' in performance) {
        systemInfo.memoryInfo = (performance as any).memory;
      }
      
      setSystemInfo(systemInfo);
    } catch (error) {
      console.error('Error collecting system info:', error);
      setSystemInfo({
        userAgent: navigator.userAgent,
        browserName: 'Unknown',
        browserVersion: 'Unknown',
        operatingSystem: 'Unknown',
        screenResolution: 'Unknown',
        viewport: 'Unknown',
        url: window.location.href,
        referrer: 'Unknown',
        timestamp: new Date().toISOString(),
        localStorageAvailable: false,
        cookiesEnabled: false,
        errors: includeErrorData ? errors : undefined,
        networkRequests: includeNetworkData ? networkRequests : undefined,
      });
    }
  };

  const detectBrowser = (userAgent: string) => {
    const browsers = [
      { name: 'Edge', regex: /Edg\/([\d.]+)/ },
      { name: 'Chrome', regex: /Chrome\/([\d.]+)/ },
      { name: 'Firefox', regex: /Firefox\/([\d.]+)/ },
      { name: 'Safari', regex: /Version\/([\d.]+).*Safari/ },
      { name: 'Opera', regex: /OPR\/([\d.]+)/ },
      { name: 'IE', regex: /Trident.*rv:([\d.]+)/ }
    ];
    
    for (const browser of browsers) {
      const match = userAgent.match(browser.regex);
      if (match) {
        return { name: browser.name, version: match[1] };
      }
    }
    
    return { name: 'Unknown', version: 'Unknown' };
  };

  const detectOS = (userAgent: string) => {
    const os = [
      { name: 'Windows', regex: /Windows NT ([\d.]+)/ },
      { name: 'Mac', regex: /Mac OS X ([\d_]+)/ },
      { name: 'iOS', regex: /iPhone OS ([\d_]+)/ },
      { name: 'Android', regex: /Android ([\d.]+)/ },
      { name: 'Linux', regex: /Linux/ }
    ];
    
    for (const system of os) {
      const match = userAgent.match(system.regex);
      if (match) {
        const version = match[1] ? match[1].replace(/_/g, '.') : '';
        return `${system.name}${version ? ' ' + version : ''}`;
      }
    }
    
    return 'Unknown';
  };

  const isLocalStorageAvailable = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  };

  const collectStorageData = () => {
    if (!systemInfo) return;
    
    const updatedSystemInfo = { ...systemInfo };
    
    try {
      if (isLocalStorageAvailable()) {
        const localStorageData: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              // Try to parse as JSON, if not possible, store as string
              const value = localStorage.getItem(key) || '';
              localStorageData[key] = value;
            } catch (e) {
              localStorageData[key] = '[Error: Unable to read value]';
            }
          }
        }
        updatedSystemInfo.localStorage = localStorageData;
      }

      // Collect session storage
      const sessionStorageData: Record<string, string> = {};
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            const value = sessionStorage.getItem(key) || '';
            sessionStorageData[key] = value;
          }
        }
        updatedSystemInfo.sessionStorage = sessionStorageData;
      } catch (e) {
        console.error('Error accessing session storage:', e);
      }
      
      setSystemInfo(updatedSystemInfo);
    } catch (error) {
      console.error('Error collecting storage data:', error);
    }
  };

  const toggleIncludeStorageData = () => {
    const newValue = !includeStorageData;
    setIncludeStorageData(newValue);
    
    if (newValue && systemInfo && (!systemInfo.localStorage || !systemInfo.sessionStorage)) {
      collectStorageData();
    }
  };

  const captureScreenshot = async () => {
    try {
      // Use html2canvas to capture the current view
      const canvas = await html2canvas(document.body);
      const imageData = canvas.toDataURL('image/png');
      return imageData;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return undefined;
    }
  };

  const enableMarkerMode = () => {
    // Reset any existing marker if re-marking
    if (markerImage) {
      setMarkerImage(undefined);
    }
    setIsMarkerMode(true);
    setIsOpen(false); // Close the bug report form temporarily
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please fill out all required fields.');
      setSubmitStatus('error');
      return;
    }
    
    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      let reportData: any = {
        title,
        description,
        steps: steps || 'Not provided',
        severity,
        email: email || 'Not provided',
        userActions: userActions.length > 0 ? userActions : ['No tracked actions'],
        timestamp: new Date().toISOString(),
        url: window.location.href,
        markerPosition,
        performanceData: detectPerformanceIssues(),
      };
      
      if (includeSystemInfo && systemInfo) {
        reportData.systemInfo = systemInfo;
      }
      
      // If storage data is requested but not yet collected
      if (includeStorageData && systemInfo && (!systemInfo.localStorage || !systemInfo.sessionStorage)) {
        collectStorageData();
      }
      
      if (includeScreenshot) {
        // Use the marker image if available, otherwise capture a fresh screenshot
        const screenshot = markerImage || await captureScreenshot();
        if (screenshot) {
          reportData.screenshot = screenshot;
        }
      }
      
      // For demo purposes, we're just logging to console
      // In a real app, you would send this data to your backend
      console.log('Bug report submitted:', reportData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSteps('');
        setSeverity('medium');
        setEmail('');
        setMarkerPosition(null);
        setMarkerImage(undefined);
        setSubmitStatus('idle');
        setIsOpen(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setErrorMessage('There was an error submitting your report. Please try again.');
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const addCheckpoint = () => {
    const timestamp = new Date().toLocaleTimeString();
    const currentUrl = window.location.href;
    const checkpointText = `[${timestamp}] Checkpoint at ${currentUrl}`;
    
    setSteps(prev => prev ? `${prev}\n${checkpointText}` : checkpointText);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSteps('');
    setSeverity('medium');
    setEmail('');
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  // Try to detect performance issues
  const detectPerformanceIssues = () => {
    try {
      const performanceData: Record<string, any> = {};
      
      // Navigation timing data
      if (performance && performance.timing) {
        const timing = performance.timing;
        performanceData.loadTime = timing.loadEventEnd - timing.navigationStart;
        performanceData.domReadyTime = timing.domComplete - timing.domLoading;
        performanceData.networkLatency = timing.responseEnd - timing.requestStart;
      }
      
      // Performance entries
      if (performance && performance.getEntriesByType) {
        // Get resource load times
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources
          .filter(res => res.duration > 1000) // Resources taking more than 1s
          .map(res => ({
            name: res.name.split('/').pop() || res.name,
            duration: Math.round(res.duration),
            type: (res as PerformanceResourceTiming).initiatorType
          }))
          .slice(0, 5); // Limit to top 5 slow resources
        
        if (slowResources.length > 0) {
          performanceData.slowResources = slowResources;
        }
      }
      
      return performanceData;
    } catch (e) {
      console.error('Error detecting performance issues:', e);
      return {};
    }
  };

  // Add a cancel marker mode function
  const cancelMarkerMode = () => {
    setIsMarkerMode(false);
    setIsOpen(true);
  };

  if (!enabled) {
    return null;
  }

  return (
    <>
      <div style={bugReportStyles.container}>
        <button 
          style={bugReportStyles.triggerButton}
          onClick={() => {
            setIsOpen(true);
            collectSystemInfo();
          }}
          aria-label="Report a bug"
          title="Report a bug"
        >
          🐛
        </button>
      </div>

      {isMarkerMode && (
        <div style={{
          ...bugReportStyles.markerMode,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px'
        }}>
          <span>Click anywhere on the page to mark where the issue occurred</span>
          <button 
            onClick={cancelMarkerMode}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {markerPosition && (
        <>
          <div 
            style={{
              ...bugReportStyles.marker,
              left: `${markerPosition.x}px`,
              top: `${markerPosition.y}px`,
              display: isOpen ? 'none' : 'block',
            }}
          >
            <div style={bugReportStyles.markerInner}></div>
            <div style={bugReportStyles.markerCenter}></div>
          </div>
          
          {isMarkerMode && (
            <div 
              style={{
                position: 'fixed',
                left: `${markerPosition.x + 40}px`,
                top: `${markerPosition.y}px`,
                zIndex: 10000,
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                transform: 'translateY(-50%)',
              }}
              onClick={confirmMarkerPosition}
            >
              Confirm
            </div>
          )}
        </>
      )}

      {isOpen && createPortal(
        <>
          <div style={bugReportStyles.overlay} onClick={() => setIsOpen(false)} />
          <div style={bugReportStyles.modal}>
            <div style={bugReportStyles.header}>
              <h2 style={bugReportStyles.title}>Report a Bug</h2>
              <button 
                style={bugReportStyles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {submitStatus === 'success' && (
              <div style={bugReportStyles.successMessage}>
                Thank you for your report! We'll look into it soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={bugReportStyles.errorMessage}>
                {errorMessage || 'There was an error submitting your report. Please try again.'}
              </div>
            )}

            <form style={bugReportStyles.form} onSubmit={handleSubmit}>
              <div style={bugReportStyles.formGroup}>
                <label style={bugReportStyles.label} htmlFor="bug-title">
                  Bug Title *
                </label>
                <input
                  id="bug-title"
                  style={bugReportStyles.input}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div style={bugReportStyles.formGroup}>
                <label style={bugReportStyles.label} htmlFor="bug-description">
                  Description *
                </label>
                <textarea
                  id="bug-description"
                  style={bugReportStyles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened and what you expected to happen"
                  required
                />
              </div>

              <div style={bugReportStyles.formGroup}>
                <label style={bugReportStyles.label} htmlFor="bug-steps">
                  Steps to Reproduce
                </label>
                <div>
                  <textarea
                    id="bug-steps"
                    style={bugReportStyles.textarea}
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
                  />
                  <div style={bugReportStyles.checkpoint} onClick={addCheckpoint}>
                    + Add current page as checkpoint
                  </div>
                </div>
              </div>

              <div style={bugReportStyles.formGroup}>
                <label style={bugReportStyles.label} htmlFor="bug-severity">
                  Severity
                </label>
                <select
                  id="bug-severity"
                  style={bugReportStyles.select}
                  value={severity}
                  onChange={(e) => {
                    setSeverity(e.target.value);
                    console.log("Severity changed to:", e.target.value); // Add logging
                  }}
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={bugReportStyles.formGroup}>
                <label style={bugReportStyles.label} htmlFor="bug-email">
                  Your Email (optional)
                </label>
                <input
                  id="bug-email"
                  style={bugReportStyles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For follow-up questions (optional)"
                />
              </div>

              <div style={bugReportStyles.formGroup}>
                <label style={bugReportStyles.label}>
                  Diagnostic Information
                </label>
                
                <label
                  htmlFor="include-system-info"
                  style={bugReportStyles.checkboxLabel}
                >
                  <input
                    id="include-system-info"
                    type="checkbox"
                    style={bugReportStyles.checkbox}
                    checked={includeSystemInfo}
                    onChange={() => setIncludeSystemInfo(!includeSystemInfo)}
                  />
                  Include system information
                </label>
                
                <label
                  htmlFor="include-storage-data"
                  style={bugReportStyles.checkboxLabel}
                >
                  <input
                    id="include-storage-data"
                    type="checkbox"
                    style={bugReportStyles.checkbox}
                    checked={includeStorageData}
                    onChange={() => setIncludeStorageData(!includeStorageData)}
                  />
                  Include local storage data
                </label>
                
                <label
                  htmlFor="include-screenshot"
                  style={bugReportStyles.checkboxLabel}
                >
                  <input
                    id="include-screenshot"
                    type="checkbox"
                    style={bugReportStyles.checkbox}
                    checked={includeScreenshot}
                    onChange={() => setIncludeScreenshot(!includeScreenshot)}
                  />
                  Include screenshot
                </label>

                <label
                  htmlFor="include-error-data"
                  style={bugReportStyles.checkboxLabel}
                >
                  <input
                    id="include-error-data"
                    type="checkbox"
                    style={bugReportStyles.checkbox}
                    checked={includeErrorData}
                    onChange={() => setIncludeErrorData(!includeErrorData)}
                  />
                  Include JavaScript error data
                </label>

                <label
                  htmlFor="include-network-data"
                  style={bugReportStyles.checkboxLabel}
                >
                  <input
                    id="include-network-data" 
                    type="checkbox"
                    style={bugReportStyles.checkbox}
                    checked={includeNetworkData}
                    onChange={() => setIncludeNetworkData(!includeNetworkData)}
                  />
                  Include network request data
                </label>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    style={{
                      ...bugReportStyles.cancelButton,
                      backgroundColor: markerImage || markerPosition ? '#4CAF50' : '#2196F3',
                      color: 'white',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      border: 'none',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={enableMarkerMode}
                  >
                    {markerImage || markerPosition ? '✓ Issue location marked (click to change)' : '🎯 Click to mark issue location'}
                  </button>
                </div>
                
                {includeSystemInfo && systemInfo && (
                  <div style={{
                    ...bugReportStyles.detailsSection,
                    marginTop: '10px',
                    color: '#333',
                    border: '1px solid #999'
                  }}>
                    <div style={{...bugReportStyles.detailItem, fontWeight: 'bold'}}>Browser: {systemInfo.browserName} {systemInfo.browserVersion}</div>
                    <div style={{...bugReportStyles.detailItem}}>OS: {systemInfo.operatingSystem}</div>
                    <div style={{...bugReportStyles.detailItem}}>Screen: {systemInfo.screenResolution}</div>
                    <div style={{...bugReportStyles.detailItem}}>Viewport: {systemInfo.viewport}</div>
                    <div style={{...bugReportStyles.detailItem}}>URL: {systemInfo.url}</div>
                    <div style={{...bugReportStyles.detailItem}}>Time: {new Date(systemInfo.timestamp).toLocaleString()}</div>
                    {systemInfo.connection && (
                      <div style={{...bugReportStyles.detailItem}}>Connection: {systemInfo.connection}</div>
                    )}
                    
                    {includeErrorData && errors.length > 0 && (
                      <>
                        <div style={{...bugReportStyles.detailItem, fontWeight: 'bold', marginTop: '10px', color: '#d32f2f'}}>
                          Recent Errors:
                        </div>
                        {errors.slice(-3).map((error, index) => (
                          <div key={index} style={{...bugReportStyles.detailItem, color: '#d32f2f'}}>
                            [{new Date(error.time).toLocaleTimeString()}] {error.type}: {error.message.substring(0, 60)}
                            {error.message.length > 60 ? '...' : ''}
                          </div>
                        ))}
                      </>
                    )}

                    {includeNetworkData && networkRequests.length > 0 && (
                      <>
                        <div style={{...bugReportStyles.detailItem, fontWeight: 'bold', marginTop: '10px', color: '#333'}}>
                          Recent Network Requests:
                        </div>
                        {networkRequests.slice(-3).map((req, index) => (
                          <div key={index} style={{
                            ...bugReportStyles.detailItem, 
                            color: req.status >= 400 || req.error ? '#d32f2f' : '#2e7d32'
                          }}>
                            [{new Date(req.timestamp).toLocaleTimeString()}] {req.method} {req.url.split('/').pop() || req.url} - 
                            {req.error ? ` Error: ${req.error}` : ` ${req.status} (${req.duration}ms)`}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div style={{
                ...bugReportStyles.buttonGroup,
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <button
                  type="button"
                  style={{
                    ...bugReportStyles.cancelButton,
                    padding: '12px 20px',
                    minWidth: '120px',
                  }}
                  onClick={() => {
                    resetForm();
                    setMarkerPosition(null);
                    setMarkerImage(undefined);
                    setIsOpen(false);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...bugReportStyles.submitButton,
                    padding: '12px 20px',
                    minWidth: '160px',
                    backgroundColor: submitting ? '#999' : '#4CAF50',
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Bug Report'}
                </button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default BugReport; 