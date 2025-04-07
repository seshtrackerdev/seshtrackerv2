import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sliders, BarChart3, Grid, Download } from 'lucide-react';
import { Card, CardBody, CardHeader, Button } from '../ui';
import { useAuth } from '../../hooks';
import { createApiClient } from '../../helpers/api';

interface DashboardOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  primaryColor: string;
  secondaryColor: string;
}

const DashboardSelector: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchProtected } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const apiClient = createApiClient(fetchProtected);

  const dashboardOptions: DashboardOption[] = [
    {
      id: 'basic',
      title: 'Basic Dashboard',
      description: 'Simple, clean interface with just the essentials. Perfect for getting started.',
      icon: <Sliders size={32} />,
      primaryColor: '#4F46E5',
      secondaryColor: '#818CF8'
    },
    {
      id: 'advanced',
      title: 'Advanced Dashboard',
      description: 'Data-rich layout with detailed analytics and insights for power users.',
      icon: <BarChart3 size={32} />,
      primaryColor: '#10B981',
      secondaryColor: '#34D399'
    },
    {
      id: 'scratch',
      title: 'Start From Scratch',
      description: 'Build your dashboard from the ground up with our drag and drop editor.',
      icon: <Grid size={32} />,
      primaryColor: '#F59E0B',
      secondaryColor: '#FBBF24'
    },
    {
      id: 'import',
      title: 'Import Previous Setup',
      description: 'Restore your previous dashboard configuration.',
      icon: <Download size={32} />,
      primaryColor: '#8B5CF6',
      secondaryColor: '#A78BFA'
    }
  ];

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleConfirm = async () => {
    if (!selectedOption) return;
    
    setIsLoading(true);
    
    try {
      // Save user preference for dashboard type using the API client
      // Don't wait for this to complete before navigating
      apiClient.updateUserPreferences({ dashboardType: selectedOption })
        .catch(error => console.error('Failed to save dashboard preference:', error));
    } catch (error) {
      console.error('Failed to save dashboard preference:', error);
    } finally {
      // Navigate to the appropriate dashboard regardless of preference saving
      switch (selectedOption) {
        case 'basic':
          navigate('/dashboard/basic');
          break;
        case 'advanced':
          navigate('/dashboard/advanced');
          break;
        case 'scratch':
          navigate('/dashboard/editor');
          break;
        case 'import':
          navigate('/dashboard/import');
          break;
        default:
          navigate('/dashboard/basic');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-selector-container">
      <div className="dashboard-selector-header">
        <h1>Choose Your Dashboard</h1>
        <p>Select the dashboard style that works best for you. You can always change this later.</p>
      </div>
      
      <div className="dashboard-options-grid">
        {dashboardOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`dashboard-option-card ${selectedOption === option.id ? 'selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              <CardHeader className="dashboard-option-header">
                <div 
                  className="option-icon-container"
                  style={{ 
                    background: `linear-gradient(135deg, ${option.primaryColor}, ${option.secondaryColor})` 
                  }}
                >
                  <div className="option-icon">
                    {option.icon}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="dashboard-selector-actions">
        <Button 
          variant="primary" 
          size="lg" 
          disabled={!selectedOption || isLoading}
          onClick={handleConfirm}
        >
          {isLoading ? 'Setting up...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSelector; 