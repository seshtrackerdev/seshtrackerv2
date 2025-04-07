import React, { useState } from 'react';
import { Upload, Check, X, AlertCircle } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Text, NotificationBanner } from '../ui';

const ImportDashboardPlaceholder: React.FC = () => {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleFileSelect = () => {
    // Simulate file upload process
    setUploadState('uploading');
    
    // Simulate success after 2 seconds
    setTimeout(() => {
      // For demo purposes only - in real implementation we would parse the file
      // and validate its contents
      setUploadState('success');
    }, 2000);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect();
  };
  
  const handleReset = () => {
    setUploadState('idle');
    setErrorMessage(null);
  };
  
  const renderUploadState = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="upload-state-container uploading">
            <div className="upload-spinner"></div>
            <Text>Processing configuration file...</Text>
          </div>
        );
      case 'success':
        return (
          <div className="upload-state-container success">
            <div className="upload-icon-container success">
              <Check size={32} />
            </div>
            <Text>Dashboard configuration imported successfully!</Text>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.location.href = '/dashboard/basic'}
              className="mt-4"
            >
              View Dashboard
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="upload-state-container error">
            <div className="upload-icon-container error">
              <X size={32} />
            </div>
            <Text>Failed to import dashboard configuration.</Text>
            {errorMessage && (
              <NotificationBanner type="error" message={errorMessage} className="mt-3" />
            )}
            <Button
              variant="outline"
              size="md"
              onClick={handleReset}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        );
      default:
        return (
          <div 
            className="upload-drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <h3>Upload Configuration File</h3>
            <p>Click or drag & drop your dashboard configuration file here</p>
            <p className="file-format-hint">Supported format: .json</p>
          </div>
        );
    }
  };
  
  return (
    <div className="import-dashboard">
      <div className="import-header">
        <h1>Import Dashboard</h1>
        <p className="import-description">
          Restore a previously exported dashboard configuration
        </p>
      </div>
      
      <Card className="import-card">
        <CardBody>
          {renderUploadState()}
        </CardBody>
      </Card>
      
      <Card className="note-card">
        <CardHeader>
          <div className="card-header-icon">
            <AlertCircle size={20} />
          </div>
          <h3>Important Notes</h3>
        </CardHeader>
        <CardBody>
          <ul className="note-list">
            <li>The dashboard import feature is currently in development</li>
            <li>Only configuration files exported from this application are supported</li>
            <li>Importing a configuration will replace your current dashboard setup</li>
            <li>Your session and inventory data will remain unchanged</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

export default ImportDashboardPlaceholder; 