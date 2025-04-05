import React, { useState } from 'react';
import Button from '../Button';

// Define prop types for the wizard
export interface SessionWizardProps {
  onComplete?: (data: any) => void;
  onCancel?: () => void;
  initialStep?: number;
  className?: string;
}

interface WizardStep {
  title: string;
  description: string;
}

/**
 * SessionWizard component - A step-by-step wizard for creating or editing a session
 * This is a placeholder implementation that will be expanded with proper functionality later
 */
const SessionWizard: React.FC<SessionWizardProps> = ({
  onComplete,
  onCancel,
  initialStep = 0,
  className = '',
}) => {
  // Sample steps for the wizard
  const steps: WizardStep[] = [
    {
      title: 'Session Details',
      description: 'Enter basic information about your session'
    },
    {
      title: 'Product Selection',
      description: 'Choose products consumed during the session'
    },
    {
      title: 'Effects & Notes',
      description: 'Record effects, ratings, and additional notes'
    },
    {
      title: 'Review',
      description: 'Review and confirm your session details'
    }
  ];

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, complete the wizard
      if (onComplete) {
        onComplete(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={`session-wizard ${className}`} style={{ 
      padding: '20px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-card)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Wizard header */}
      <div className="wizard-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>{steps[currentStep].title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {steps[currentStep].description}
        </p>
        
        {/* Progress indicator */}
        <div className="wizard-progress" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: index <= currentStep ? 'var(--accent-color)' : 'var(--bg-secondary)',
              transition: 'background-color 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}>
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '100%',
                  width: `${100 / (steps.length - 1)}%`,
                  height: '2px',
                  backgroundColor: index < currentStep ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  transition: 'background-color 0.3s ease',
                  transform: 'translateY(-50%)'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder content for each step */}
      <div className="wizard-content" style={{ 
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px'
      }}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          This is a placeholder for the {steps[currentStep].title.toLowerCase()} step.
          <br /><br />
          Session Wizard implementation coming soon...
        </p>
      </div>

      {/* Wizard navigation buttons */}
      <div className="wizard-actions" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '20px'
      }}>
        <Button
          onClick={currentStep === 0 ? onCancel : handleBack}
          variant="secondary"
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        <Button
          onClick={handleNext}
          variant="primary"
        >
          {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
        </Button>
      </div>
    </div>
  );
};

export default SessionWizard; 