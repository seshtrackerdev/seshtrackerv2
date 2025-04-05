import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Simple Bug Report component with reliable form controls
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
        className="fixed z-50 bottom-5 right-5 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center w-14 h-14 transition-all"
        aria-label="Report a bug"
      >
        <span className="text-2xl">🐛</span>
      </button>
      
      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-3">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Report a Bug</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
              
              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <p className="font-medium">Thank you for your report!</p>
                  <p>We'll look into this issue as soon as possible.</p>
                </div>
              )}
              
              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <p className="font-medium">Something went wrong!</p>
                  <p>Please try again or contact support directly.</p>
                </div>
              )}
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bug Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Please describe what happened and what you expected to happen"
                  ></textarea>
                </div>
                
                {/* Steps to Reproduce */}
                <div>
                  <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="steps"
                    name="steps"
                    value={formData.steps}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
                  ></textarea>
                </div>
                
                {/* Severity */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-menulist"
                  >
                    <option value="low">Low - Minor issue, doesn't affect functionality</option>
                    <option value="medium">Medium - Functionality partially impaired</option>
                    <option value="high">High - Major feature broken</option>
                    <option value="critical">Critical - Application unusable</option>
                  </select>
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Email (optional)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="For follow-up questions (optional)"
                  />
                </div>
                
                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="includeSystemInfo"
                        name="includeSystemInfo"
                        type="checkbox"
                        checked={formData.includeSystemInfo}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="includeSystemInfo" className="font-medium text-gray-700 dark:text-gray-300">
                        Include system information
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">Browser, OS, screen size, etc.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="includeScreenshot"
                        name="includeScreenshot"
                        type="checkbox"
                        checked={formData.includeScreenshot}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="includeScreenshot" className="font-medium text-gray-700 dark:text-gray-300">
                        Include screenshot
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">Automatically capture current view</p>
                    </div>
                  </div>
                </div>
                
                {/* System Info Display */}
                {formData.includeSystemInfo && systemInfo && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-mono overflow-x-auto">
                    <div className="mb-1 font-semibold text-gray-700 dark:text-gray-300">System Information:</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <div>URL: {systemInfo.url}</div>
                      <div>Browser: {systemInfo.userAgent.split(') ')[0].split(' (')[0]}</div>
                      <div>Screen: {systemInfo.screenWidth}x{systemInfo.screenHeight}</div>
                      <div>Window: {systemInfo.innerWidth}x{systemInfo.innerHeight}</div>
                      <div>Platform: {systemInfo.platform}</div>
                    </div>
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-3 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReport; 