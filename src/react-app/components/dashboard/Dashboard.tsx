import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { 
  createApiClient
} from '../../helpers/api';
import '../../styles/Dashboard.css';
import { format } from 'date-fns';
import { CalendarPlus, PlusCircle, Eye, Package, Clock, User, BarChart3, Calendar, History, FileText, LineChart, Star, Leaf, TrendingUp, Award } from 'lucide-react';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Text, 
  NotificationBanner, 
  Badge, 
  Modal 
} from '../ui';

// Temporary Tabs implementation until we fix the Tabs component
interface TabProps {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const Tab: React.FC<TabProps> = ({ children, isSelected, onClick }) => (
  <button 
    data-selected={isSelected}
    onClick={onClick}
    className="tab-button"
  >
    {children}
  </button>
);

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

const TabList: React.FC<TabListProps> = ({ children, className }) => (
  <div className={`tab-list ${className || ''}`}>
    {children}
  </div>
);

interface TabPanelProps {
  children: React.ReactNode;
  isSelected?: boolean;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, isSelected }) => {
  if (!isSelected) return null;
  return <div className="tab-panel">{children}</div>;
};

interface TabsProps {
  children: React.ReactNode;
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

// Simplified Tabs implementation without the React.cloneElement complexity
const Tabs: React.FC<TabsProps> = ({ children, selectedIndex, onChange, className }) => {
  // Extract TabList and TabPanels from children
  const childrenArray = React.Children.toArray(children);
  const tabList = childrenArray.find(child => 
    React.isValidElement(child) && child.type === TabList
  ) as React.ReactElement<TabListProps> | undefined;
  
  const tabPanels = childrenArray.filter(child => 
    React.isValidElement(child) && child.type === TabPanel
  ) as React.ReactElement<TabPanelProps>[];
  
  // Process the TabList to add isSelected and onClick props to Tabs
  const processedTabList = tabList && React.isValidElement(tabList) ? 
    React.cloneElement(tabList, {
      children: React.Children.map(tabList.props.children, (tab, tabIndex) => {
        if (React.isValidElement(tab) && tab.type === Tab) {
          return React.cloneElement(tab as React.ReactElement<TabProps>, {
            isSelected: tabIndex === selectedIndex,
            onClick: () => onChange(tabIndex)
          });
        }
        return tab;
      })
    }) : null;
  
  // Process TabPanels to add isSelected prop
  const processedTabPanels = tabPanels.map((panel, index) => {
    if (React.isValidElement(panel)) {
      return React.cloneElement(panel, {
        isSelected: index === selectedIndex
      });
    }
    return panel;
  });
  
  return (
    <div className={`tabs ${className || ''}`}>
      {processedTabList}
      {processedTabPanels}
    </div>
  );
};

// Helper for getting strain badge variant
const getStrainBadgeVariant = (strain: string): 'cannabis' | 'gold' | 'primary' | 'secondary' => {
  const strainLower = strain.toLowerCase();
  if (strainLower.includes('indica')) return 'cannabis';
  if (strainLower.includes('sativa')) return 'gold';
  if (strainLower.includes('hybrid')) return 'primary';
  return 'secondary';
};

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  avatarUrl?: string;
  isPremium?: boolean;
  preferences?: {
    theme: string;
    notifications: boolean;
  };
}

interface Session {
  id: string;
  strain: string;
  strainType?: 'indica' | 'sativa' | 'hybrid';
  startTime: string;
  endTime?: string;
  rating?: number;
  notes?: string;
  method?: string;
  effects?: string[];
  thcContent?: number;
  cbdContent?: number;
}

interface InventoryItem {
  id: string;
  strain: string;
  strainType?: 'indica' | 'sativa' | 'hybrid';
  purchaseDate: string;
  quantity: number;
  unit: string;
  price?: number;
  thcContent?: number;
  cbdContent?: number;
  notes?: string;
  dispensary?: string;
}

interface StrainTypeBadgeProps {
  type: string | undefined;
}

// Badge for strain type
const StrainTypeBadge: React.FC<StrainTypeBadgeProps> = ({ type }) => {
  if (!type) return null;
  
  let variant: 'cannabis' | 'gold' | 'primary' | 'secondary';
  let icon = <Leaf size={12} />;
  
  switch(type.toLowerCase()) {
    case 'indica':
      variant = 'cannabis';
      break;
    case 'sativa':
      variant = 'gold';
      break;
    case 'hybrid':
      variant = 'primary';
      break;
    default:
      variant = 'secondary';
  }
  
  return (
    <Badge variant={variant} size="sm" icon={icon} className="mr-1">
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

interface RatingBadgeProps {
  rating: number | undefined;
}

// Badge for rating
const RatingBadge: React.FC<RatingBadgeProps> = ({ rating }) => {
  if (!rating) return null;
  
  return (
    <Badge variant="purple" size="sm" icon={<Star size={12} />} className="mr-1">
      {rating}/10
    </Badge>
  );
};

const Dashboard: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState<boolean>(false);
  const [showNewInventoryModal, setShowNewInventoryModal] = useState<boolean>(false);
  
  // Get auth context and fetchProtected function
  const { fetchProtected } = useAuth();
  
  // Create API client (for components that can't use hooks directly)
  const apiClient = createApiClient(fetchProtected);

  // Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user profile, sessions, and inventory in parallel
        const [profileData, sessionsData, inventoryData] = await Promise.all([
          apiClient.fetchUserProfile(),
          apiClient.fetchSessions(10), // Limit to 10 most recent sessions
          apiClient.fetchInventory(10), // Limit to 10 most recent inventory items
        ]);
        
        setUserProfile(profileData);
        setSessions(sessionsData);
        setInventory(inventoryData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [fetchProtected]);

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return dateString;
    }
  };

  // Calculate stats
  const calculateStats = () => {
    let totalSessions = sessions.length;
    let avgRating = 0;
    let topStrain = '';
    let strainCounts: Record<string, number> = {};
    
    // Calculate average rating and top strain
    if (totalSessions > 0) {
      // Sum of all ratings (excluding undefined)
      const ratingSum = sessions.reduce((sum, session) => {
        return sum + (session.rating || 0);
      }, 0);
      
      // Count valid ratings
      const validRatings = sessions.filter(s => s.rating !== undefined).length;
      
      // Calculate average
      avgRating = validRatings > 0 ? ratingSum / validRatings : 0;
      
      // Count strains
      sessions.forEach(session => {
        if (!session.strain) return;
        strainCounts[session.strain] = (strainCounts[session.strain] || 0) + 1;
      });
      
      // Find top strain
      let maxCount = 0;
      Object.entries(strainCounts).forEach(([strain, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topStrain = strain;
        }
      });
    }
    
    return {
      totalSessions,
      avgRating: avgRating.toFixed(1),
      totalInventory: inventory.length,
      topStrain
    };
  };
  
  const stats = calculateStats();

  // Render loading state
  if (isLoading) {
    return (
      <div className="dashboard dashboard-loading">
        <Text>Loading dashboard data...</Text>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="dashboard">
        <NotificationBanner type="error" message={error} />
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>
            Welcome back, {userProfile?.name || 'User'}!
            {userProfile?.isPremium && (
              <Badge variant="gold" size="sm" className="ml-2">
                Premium
              </Badge>
            )}
          </h1>
          <p>Track your sessions, manage your inventory, and gain insights.</p>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="stats-overview">
        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Clock className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.totalSessions}</h3>
                <p className="stat-label">Sessions Tracked</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Star className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.avgRating}</h3>
                <p className="stat-label">Avg. Rating</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Package className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.totalInventory}</h3>
                <p className="stat-label">Inventory Items</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Award className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.topStrain || 'None'}</h3>
                <p className="stat-label">Top Strain</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs selectedIndex={activeTab} onChange={handleTabChange} className="dashboard-tabs">
        <TabList className="tab-list">
          <Tab>
            <History size={18} />
            <span>Recent Activity</span>
          </Tab>
          <Tab>
            <BarChart3 size={18} />
            <span>Analytics</span>
          </Tab>
          <Tab>
            <Calendar size={18} />
            <span>Calendar</span>
          </Tab>
        </TabList>

        {/* Recent Activity Tab */}
        <TabPanel isSelected={activeTab === 0}>
          <div className="dashboard-grid">
            {/* Session Summary */}
            <Card className="dashboard-card">
              <CardHeader>
                <div className="card-header-content">
                  <Clock size={20} />
                  <h2>Recent Sessions</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewSessionModal(true)}
                >
                  <PlusCircle size={16} className="mr-1" /> New
                </Button>
              </CardHeader>
              <CardBody>
                {sessions.length > 0 ? (
                  <div className="session-list">
                    {sessions.slice(0, 5).map((session) => (
                      <Link to={`/sessions/${session.id}`} key={session.id} className="session-item">
                        <div className="session-item-main">
                          <h3>{session.strain}</h3>
                          <div className="session-badges">
                            <StrainTypeBadge type={session.strainType} />
                            <RatingBadge rating={session.rating} />
                            {session.method && (
                              <Badge variant="secondary" size="sm" className="mr-1">
                                {session.method}
                              </Badge>
                            )}
                          </div>
                          <span className="session-date">{formatDate(session.startTime)}</span>
                        </div>
                        <div className="session-item-actions">
                          <Eye size={16} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Text>No sessions recorded yet.</Text>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowNewSessionModal(true)}
                    >
                      <PlusCircle size={16} className="mr-1" /> 
                      Start Your First Session
                    </Button>
                  </div>
                )}
                <div className="view-all-link">
                  <Link to="/sessions">View all sessions</Link>
                </div>
              </CardBody>
            </Card>

            {/* Inventory Summary */}
            <Card className="dashboard-card">
              <CardHeader>
                <div className="card-header-content">
                  <Package size={20} />
                  <h2>Inventory Highlights</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewInventoryModal(true)}
                >
                  <PlusCircle size={16} className="mr-1" /> Add
                </Button>
              </CardHeader>
              <CardBody>
                {inventory.length > 0 ? (
                  <div className="inventory-list">
                    {inventory.slice(0, 5).map((item) => (
                      <Link to={`/inventory/${item.id}`} key={item.id} className="inventory-item">
                        <div className="inventory-item-main">
                          <h3>{item.strain}</h3>
                          <div className="inventory-badges">
                            <StrainTypeBadge type={item.strainType} />
                            {item.thcContent && (
                              <Badge variant="success" size="sm" className="mr-1">
                                THC {item.thcContent}%
                              </Badge>
                            )}
                          </div>
                          <span className="inventory-meta">
                            {item.quantity} {item.unit} · {formatDate(item.purchaseDate)}
                          </span>
                        </div>
                        <div className="inventory-item-actions">
                          <Eye size={16} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Text>No inventory items added yet.</Text>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowNewInventoryModal(true)}
                    >
                      <PlusCircle size={16} className="mr-1" /> 
                      Add Your First Item
                    </Button>
                  </div>
                )}
                <div className="view-all-link">
                  <Link to="/inventory">View all inventory</Link>
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="dashboard-card quick-actions-card">
              <CardHeader>
                <h2>Quick Actions</h2>
              </CardHeader>
              <CardBody>
                <div className="quick-actions-grid">
                  <Button 
                    variant="outline" 
                    className="quick-action-button"
                    onClick={() => setShowNewSessionModal(true)}
                  >
                    <CalendarPlus size={20} />
                    <span>New Session</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="quick-action-button"
                    onClick={() => setShowNewInventoryModal(true)}
                  >
                    <PlusCircle size={20} />
                    <span>Add Inventory</span>
                  </Button>
                  <Link to="/strains" className="quick-action-link">
                    <Button variant="outline" className="quick-action-button">
                      <Leaf size={20} />
                      <span>Strain Library</span>
                    </Button>
                  </Link>
                  <Link to="/analytics" className="quick-action-link">
                    <Button variant="outline" className="quick-action-button">
                      <TrendingUp size={20} />
                      <span>Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel isSelected={activeTab === 1}>
          <div className="dashboard-grid">
            <Card className="dashboard-card full-width">
              <CardHeader>
                <div className="card-header-content">
                  <LineChart size={20} />
                  <h2>Usage Trends</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="analytics-placeholder">
                  <Text>Analytics data will be displayed here.</Text>
                  <Text className="text-muted">Coming soon: Consumption trends, strain preferences, and more.</Text>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabPanel>

        {/* Calendar Tab */}
        <TabPanel isSelected={activeTab === 2}>
          <div className="dashboard-grid">
            <Card className="dashboard-card full-width">
              <CardHeader>
                <div className="card-header-content">
                  <Calendar size={20} />
                  <h2>Session Calendar</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="calendar-placeholder">
                  <Text>Calendar view will be displayed here.</Text>
                  <Text className="text-muted">Coming soon: View your sessions in a calendar format.</Text>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabPanel>
      </Tabs>

      {/* Modals using the Modal component */}
      <Modal 
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        title="Start New Session"
        footer={
          <div>
            <Button 
              variant="outline" 
              onClick={() => setShowNewSessionModal(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button variant="cannabis">Start Session</Button>
          </div>
        }
      >
        <p>Form will be implemented here.</p>
      </Modal>

      <Modal 
        isOpen={showNewInventoryModal}
        onClose={() => setShowNewInventoryModal(false)}
        title="Add Inventory Item"
        footer={
          <div>
            <Button 
              variant="outline" 
              onClick={() => setShowNewInventoryModal(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button variant="cannabis">Add Item</Button>
          </div>
        }
      >
        <p>Form will be implemented here.</p>
      </Modal>
    </div>
  );
};

export default Dashboard;