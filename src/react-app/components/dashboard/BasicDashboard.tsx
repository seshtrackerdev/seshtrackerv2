import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { createApiClient } from '../../helpers/api';
import { format } from 'date-fns';
import { 
  CalendarPlus, 
  PlusCircle, 
  Package, 
  Clock, 
  Star, 
  Leaf, 
  Award,
  LineChart,
  Calendar,
  ChevronsRight
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader,
  CardBody, 
  Text, 
  NotificationBanner,
  Badge
} from '../ui';

// Types
interface Session {
  id: string;
  title?: string;
  strain?: string;
  strainType?: string;
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
  name: string;
  strain?: string;
  strainType?: string;
  purchaseDate: string;
  quantity: number;
  unit: string;
  price?: number;
  thcContent?: number;
  cbdContent?: number;
  notes?: string;
  dispensary?: string;
  currentQuantity?: number;
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

const BasicDashboard: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState<boolean>(false);
  const [showNewInventoryModal, setShowNewInventoryModal] = useState<boolean>(false);
  
  // Get auth context
  const { fetchProtected } = useAuth();
  
  // Create API client
  const apiClient = createApiClient(fetchProtected);

  // Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch sessions and inventory in parallel
        const [sessionsData, inventoryData] = await Promise.all([
          apiClient.fetchSessions(5), // Limit to 5 most recent sessions
          apiClient.fetchInventory(5), // Limit to 5 most recent inventory items
        ]);
        
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
  }, []);

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
    if (sessions.length > 0) {
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
    
    // Calculate inventory usage
    let totalInventoryItems = inventory.length;
    let lowStockItems = inventory.filter(item => {
      if (!item.currentQuantity || !item.quantity) return false;
      return (item.currentQuantity / item.quantity) < 0.2; // Less than 20% remaining
    }).length;
    
    return {
      totalSessions,
      avgRating: avgRating.toFixed(1),
      totalInventoryItems,
      lowStockItems,
      topStrain: topStrain || 'None'
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
    <div className="dashboard basic-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome to Your Dashboard</h1>
          <p>Track your sessions, manage your inventory, and gain insights.</p>
        </div>
        
        <div className="welcome-actions">
          <Button 
            variant="primary" 
            size="md"
            icon={<CalendarPlus size={16} />}
            onClick={() => setShowNewSessionModal(true)}
          >
            Log Session
          </Button>
          <Button 
            variant="outline" 
            size="md"
            icon={<PlusCircle size={16} />}
            onClick={() => setShowNewInventoryModal(true)}
          >
            Add Inventory
          </Button>
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
                <h3 className="stat-value">{stats.totalInventoryItems}</h3>
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
                <h3 className="stat-value">{stats.topStrain}</h3>
                <p className="stat-label">Top Strain</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="dashboard-grid">
        {/* Recent Sessions */}
        <Card className="dashboard-card recent-sessions-card">
          <CardHeader>
            <div className="card-header-content">
              <h2>Recent Sessions</h2>
              <Link to="/sessions" className="view-all-link">
                View All <ChevronsRight size={16} />
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>No sessions recorded yet.</p>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowNewSessionModal(true)}
                >
                  Log Your First Session
                </Button>
              </div>
            ) : (
              <div className="sessions-list">
                {sessions.map((session) => (
                  <Link to={`/sessions/${session.id}`} key={session.id} className="session-item">
                    <div className="session-header">
                      <h3>{session.title || 'Untitled Session'}</h3>
                      <span className="session-date">{formatDate(session.startTime)}</span>
                    </div>
                    <div className="session-details">
                      {session.strain && (
                        <div className="session-strain">
                          <StrainTypeBadge type={session.strainType} />
                          <span>{session.strain}</span>
                        </div>
                      )}
                      {session.rating !== undefined && (
                        <RatingBadge rating={session.rating} />
                      )}
                      {session.method && (
                        <Badge variant="secondary" size="sm" className="mr-1">
                          {session.method}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Inventory Overview */}
        <Card className="dashboard-card inventory-card">
          <CardHeader>
            <div className="card-header-content">
              <h2>Inventory</h2>
              <Link to="/inventory" className="view-all-link">
                View All <ChevronsRight size={16} />
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {inventory.length === 0 ? (
              <div className="empty-state">
                <p>No inventory items added yet.</p>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowNewInventoryModal(true)}
                >
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="inventory-list">
                {inventory.map((item) => (
                  <Link to={`/inventory/${item.id}`} key={item.id} className="inventory-item">
                    <div className="inventory-header">
                      <h3>{item.name}</h3>
                      <span>{item.currentQuantity || item.quantity} {item.unit}</span>
                    </div>
                    <div className="inventory-details">
                      {item.strain && (
                        <div className="inventory-strain">
                          <StrainTypeBadge type={item.strainType} />
                          <span>{item.strain}</span>
                        </div>
                      )}
                      {item.thcContent && (
                        <Badge variant="secondary" size="sm" className="mr-1">
                          THC: {item.thcContent}%
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Quick Actions */}
        <Card className="dashboard-card quick-actions-card">
          <CardHeader>
            <h2>Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="quick-actions-grid">
              <Link to="/sessions/new" className="quick-action-item">
                <div className="quick-action-icon">
                  <CalendarPlus size={24} />
                </div>
                <span>Log Session</span>
              </Link>
              
              <Link to="/inventory/new" className="quick-action-item">
                <div className="quick-action-icon">
                  <PlusCircle size={24} />
                </div>
                <span>Add Inventory</span>
              </Link>
              
              <Link to="/analytics" className="quick-action-item">
                <div className="quick-action-icon">
                  <LineChart size={24} />
                </div>
                <span>Analytics</span>
              </Link>
              
              <Link to="/calendar" className="quick-action-item">
                <div className="quick-action-icon">
                  <Calendar size={24} />
                </div>
                <span>Calendar</span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Modal placeholders - these would be implemented with proper Modal components */}
      {/* Session modal implementation would go here */}
      {/* Inventory modal implementation would go here */}
    </div>
  );
};

export default BasicDashboard; 