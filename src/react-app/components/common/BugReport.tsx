import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Simple Bug Report component with reliable form controls and inline styles
 */
const BugReport: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: '',
    severity: 'medium',
    email: '',
    includeSystemInfo: true,
    includeScreenshot: false
  });
  
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Styles
  const styles = {
    bugButton: {
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      backgroundColor: '#f44336',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      zIndex: 9999,
      cursor: 'pointer',
      fontSize: '24px',
      transition: 'background-color 0.2s ease'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto'
    },
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 10001
    },
    modalContent: {
      position: 'relative' as const,
      backgroundColor: '#1e1e1e',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      zIndex: 10002,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '12px',
      borderBottom: '1px solid #333'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#f0f0f0'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#b3b3b3'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#e0e0e0'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #444',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#2a2a2a',
      color: '#e0e0e0'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #444',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical' as const,
      backgroundColor: '#2a2a2a',
      color: '#e0e0e0'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #444',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#2a2a2a',
      color: '#e0e0e0'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    checkbox: {
      marginRight: '10px',
      width: '18px',
      height: '18px',
      accentColor: '#43a047'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#e0e0e0'
    },
    checkboxDescription: {
      fontSize: '12px',
      color: '#b3b3b3',
      marginTop: '2px'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid #333'
    },
    cancelButton: {
      padding: '8px 16px',
      backgroundColor: '#333',
      color: '#e0e0e0',
      border: '1px solid #444',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '8px 16px',
      backgroundColor: '#43a047',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    systemInfo: {
      backgroundColor: '#2a2a2a',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      marginTop: '10px',
      color: '#b3b3b3'
    },
    successMessage: {
      padding: '12px',
      backgroundColor: 'rgba(67, 160, 71, 0.2)',
      color: '#76d275',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid rgba(67, 160, 71, 0.3)'
    },
    errorMessage: {
      padding: '12px',
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      color: '#f44336',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid rgba(244, 67, 54, 0.3)'
    }
  };
  
  // Collect system information when the form is opened
  useEffect(() => {
    if (isOpen) {
      collectSystemInfo();
    }
  }, [isOpen]);
  
  const collectSystemInfo = () => {
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      url: window.location.href,
      pathname: location.pathname,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      timestamp: new Date().toISOString()
    };
    
    setSystemInfo(browserInfo);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate sending the bug report
      console.log('Submitting bug report:', {
        ...formData,
        systemInfo: formData.includeSystemInfo ? systemInfo : null
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success!
      setSubmitStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus('idle');
        setFormData({
          title: '',
          description: '',
          steps: '',
          severity: 'medium',
          email: '',
          includeSystemInfo: true,
          includeScreenshot: false
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Bug Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={styles.bugButton}
        aria-label="Report a bug"
      >
        🐛
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div style={styles.modal}>
          <div style={styles.backdrop} onClick={() => setIsOpen(false)}></div>
          <div style={styles.modalContent}>
            {/* Header */}
            <div style={styles.header}>
              <h2 style={styles.title}>Report a Bug</h2>
              <button style={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            {/* Success Message */}
            {submitStatus === 'success' && (
              <div style={styles.successMessage}>
                <p><strong>Thank you for your report!</strong></p>
                <p>We'll look into this issue as soon as possible.</p>
              </div>
            )}
            
            {/* Error Message */}
            {submitStatus === 'error' && (
              <div style={styles.errorMessage}>
                <p><strong>Something went wrong!</strong></p>
                <p>Please try again or contact support directly.</p>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="title">
                  Bug Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Brief description of the issue"
                />
              </div>
              
              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Please describe what happened and what you expected to happen"
                ></textarea>
              </div>
              
              {/* Steps to Reproduce */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="steps">
                  Steps to Reproduce
                </label>
                <textarea
                  id="steps"
                  name="steps"
                  value={formData.steps}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
                ></textarea>
              </div>
              
              {/* Severity */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="severity">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="low">Low - Minor issue, doesn't affect functionality</option>
                  <option value="medium">Medium - Functionality partially impaired</option>
                  <option value="high">High - Major feature broken</option>
                  <option value="critical">Critical - Application unusable</option>
                </select>
              </div>
              
              {/* Email */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="email">
                  Your Email (optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="For follow-up questions (optional)"
                />
              </div>
              
              {/* Checkboxes */}
              <div style={styles.formGroup}>
                <div style={styles.checkboxContainer}>
                  <input
                    id="includeSystemInfo"
                    name="includeSystemInfo"
                    type="checkbox"
                    checked={formData.includeSystemInfo}
                    onChange={handleCheckboxChange}
                    style={styles.checkbox}
                  />
                  <div>
                    <label style={styles.checkboxLabel} htmlFor="includeSystemInfo">
                      Include system information
                    </label>
                    <div style={styles.checkboxDescription}>
                      Browser, OS, screen size, etc.
                    </div>
                  </div>
                </div>
                
                <div style={styles.checkboxContainer}>
                  <input
                    id="includeScreenshot"
                    name="includeScreenshot"
                    type="checkbox"
                    checked={formData.includeScreenshot}
                    onChange={handleCheckboxChange}
                    style={styles.checkbox}
                  />
                  <div>
                    <label style={styles.checkboxLabel} htmlFor="includeScreenshot">
                      Include screenshot
                    </label>
                    <div style={styles.checkboxDescription}>
                      Automatically capture current view
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Info Display */}
              {formData.includeSystemInfo && systemInfo && (
                <div style={styles.systemInfo}>
                  <div style={{fontWeight: 'bold', marginBottom: '5px'}}>System Information:</div>
                  <div>URL: {systemInfo.url}</div>
                  <div>Browser: {systemInfo.userAgent.split(') ')[0].split(' (')[0]}</div>
                  <div>Screen: {systemInfo.screenWidth}x{systemInfo.screenHeight}</div>
                  <div>Window: {systemInfo.innerWidth}x{systemInfo.innerHeight}</div>
                  <div>Platform: {systemInfo.platform}</div>
                </div>
              )}
              
              {/* Buttons */}
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReport; 