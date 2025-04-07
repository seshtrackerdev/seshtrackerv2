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
  BarChart,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronsRight,
  Filter
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
  mood_before?: string;
  mood_after?: string;
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
  original_quantity?: number;
}

interface AnalyticsData {
  consumption: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    labels: string[];
  };
  ratings: {
    distribution: number[];
    average: number;
  };
  strains: {
    topStrains: Array<{name: string, count: number}>;
    typeDistribution: {indica: number, sativa: number, hybrid: number};
  };
  methods: {
    distribution: Record<string, number>;
  };
  effects: {
    positive: Array<{name: string, count: number}>;
    negative: Array<{name: string, count: number}>;
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    usage: number[];
    labels: string[];
  };
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

// Placeholder chart component (to be replaced with a real chart library)
interface ChartProps {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any;
  labels?: string[];
  height?: number;
}

const ChartPlaceholder: React.FC<ChartProps> = ({ type, title, height = 200 }) => {
  const getIcon = () => {
    switch (type) {
      case 'line':
        return <LineChart size={32} />;
      case 'bar':
        return <BarChart size={32} />;
      case 'pie':
        return <PieChart size={32} />;
      default:
        return <LineChart size={32} />;
    }
  };
  
  return (
    <div className="chart-placeholder" style={{ height: `${height}px` }}>
      <div className="chart-icon">
        {getIcon()}
      </div>
      <p>{title}</p>
      <p className="chart-note">Interactive chart will appear here</p>
    </div>
  );
};

// Filter selector component
interface FilterSelectorProps {
  options: string[];
  selectedOption: string;
  onChange: (option: string) => void;
  label: string;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ options, selectedOption, onChange, label }) => {
  return (
    <div className="filter-selector">
      <label>
        {label}:
        <select 
          value={selectedOption} 
          onChange={(e) => onChange(e.target.value)}
          className="filter-select"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

const AdvancedDashboard: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState<boolean>(false);
  const [showNewInventoryModal, setShowNewInventoryModal] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<string>('month');
  
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
        // Fetch sessions, inventory, and analytics data in parallel
        const [sessionsData, inventoryData, analyticsResult] = await Promise.all([
          apiClient.fetchSessions(5), // Limit to 5 most recent sessions
          apiClient.fetchInventory(5), // Limit to 5 most recent inventory items
          apiClient.fetchUserAnalytics(timeframe)
        ]);
        
        setSessions(sessionsData);
        setInventory(inventoryData);
        setAnalyticsData(analyticsResult);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeframe]);

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
    
    // Use analytics data if available for additional stats
    let sessionTrend = analyticsData?.consumption?.weekly 
      ? ((analyticsData.consumption.weekly[analyticsData.consumption.weekly.length - 1] - 
          analyticsData.consumption.weekly[analyticsData.consumption.weekly.length - 2]) / 
          analyticsData.consumption.weekly[analyticsData.consumption.weekly.length - 2] * 100).toFixed(1)
      : '0.0';
      
    const ratingTrend = analyticsData?.ratings?.average
      ? analyticsData.ratings.average.toFixed(1)
      : avgRating.toFixed(1);
    
    return {
      totalSessions,
      avgRating: avgRating.toFixed(1),
      totalInventoryItems,
      lowStockItems,
      topStrain: topStrain || 'None',
      sessionTrend: sessionTrend + '%',
      ratingTrend
    };
  };
  
  const stats = calculateStats();
  
  // Get trending data for display
  const getTrendingInsight = () => {
    if (!analyticsData) return "No trends available yet";
    
    // Placeholder logic - in a real implementation, this would analyze the data
    // and return meaningful insights
    if (analyticsData.ratings.average > 7) {
      return "Your recent sessions have been highly rated. Keep using these strains!";
    } else if (analyticsData.ratings.average < 5) {
      return "Your recent ratings are lower than usual. Try different strains or methods.";
    } else {
      return "Your consumption pattern is consistent with previous weeks.";
    }
  };

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
    <div className="dashboard advanced-dashboard">
      {/* Analytics Controls */}
      <div className="analytics-controls">
        <div className="analytics-filters">
          <FilterSelector
            label="Timeframe"
            options={['week', 'month', 'year', 'all']}
            selectedOption={timeframe}
            onChange={setTimeframe}
          />
        </div>
        <div className="analytics-actions">
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
              <TrendingUp className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.sessionTrend}</h3>
                <p className="stat-label">Session Trend</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="stat-card">
          <CardBody>
            <div className="stat-content">
              <Star className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.ratingTrend}</h3>
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
              <AlertTriangle className="stat-icon" />
              <div>
                <h3 className="stat-value">{stats.lowStockItems}</h3>
                <p className="stat-label">Low Stock Items</p>
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
        {/* Trending Insights */}
        <Card className="dashboard-card trending-insights-card">
          <CardHeader>
            <h2>Trending Insights</h2>
          </CardHeader>
          <CardBody>
            <div className="insight-content">
              <div className="insight-icon"><TrendingUp size={24} /></div>
              <p className="insight-text">{getTrendingInsight()}</p>
            </div>
          </CardBody>
        </Card>
        
        {/* Consumption Analytics */}
        <Card className="dashboard-card consumption-analytics-card">
          <CardHeader>
            <div className="card-header-content">
              <h2>Consumption Over Time</h2>
              <Link to="/analytics" className="view-all-link">
                Full Analytics <ChevronsRight size={16} />
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <ChartPlaceholder 
              type="line" 
              title="Sessions Frequency" 
              data={analyticsData?.consumption}
              height={200}
            />
          </CardBody>
        </Card>
        
        {/* Strain Distribution */}
        <Card className="dashboard-card strain-distribution-card">
          <CardHeader>
            <h2>Strain Distribution</h2>
          </CardHeader>
          <CardBody>
            <ChartPlaceholder 
              type="pie" 
              title="Strain Types" 
              data={analyticsData?.strains?.typeDistribution}
              height={180}
            />
          </CardBody>
        </Card>
        
        {/* Rating Distribution */}
        <Card className="dashboard-card rating-distribution-card">
          <CardHeader>
            <h2>Rating Distribution</h2>
          </CardHeader>
          <CardBody>
            <ChartPlaceholder 
              type="bar" 
              title="Session Ratings" 
              data={analyticsData?.ratings?.distribution}
              labels={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}
              height={180}
            />
          </CardBody>
        </Card>
        
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
                      <div className="inventory-quantity">
                        <span>{item.currentQuantity || item.quantity} {item.unit}</span>
                        {item.currentQuantity && item.original_quantity && (
                          <div className="quantity-bar">
                            <div 
                              className="quantity-remaining" 
                              style={{ width: `${(item.currentQuantity / item.original_quantity) * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
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
      </div>
      
      {/* Modal placeholders - these would be implemented with proper Modal components */}
      {/* Session modal implementation would go here */}
      {/* Inventory modal implementation would go here */}
    </div>
  );
};

export default AdvancedDashboard; 