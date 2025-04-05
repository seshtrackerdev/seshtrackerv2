import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '../Text';

export interface Strain {
  id: string;
  name: string;
  type: 'sativa' | 'indica' | 'hybrid';
  thcContent?: number;
  cbdContent?: number;
  effects?: string[];
  flavors?: string[];
  description?: string;
  imageUrl?: string;
  rating?: number;
  favorite?: boolean;
  terpenes?: {
    name: string;
    percentage: number;
  }[];
}

export interface StrainLibraryProps {
  /**
   * Array of strains to display
   */
  strains?: Strain[];
  
  /**
   * Title for the library
   */
  title?: string;
  
  /**
   * Optional description
   */
  description?: string;
  
  /**
   * Number of strains to display per page
   */
  pageSize?: number;
  
  /**
   * Whether to allow selecting strains
   */
  selectable?: boolean;
  
  /**
   * Selected strain IDs (for controlled component)
   */
  selectedStrainIds?: string[];
  
  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedIds: string[]) => void;
  
  /**
   * Callback when a strain is clicked
   */
  onStrainClick?: (strain: Strain) => void;
  
  /**
   * Callback when a strain is favorited/unfavorited
   */
  onFavoriteToggle?: (strain: Strain, isFavorite: boolean) => void;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Display layout mode
   */
  layout?: 'grid' | 'list';
  
  /**
   * Show filter options
   */
  showFilters?: boolean;
  
  /**
   * Allow searching
   */
  searchable?: boolean;
  
  /**
   * Allow sorting
   */
  sortable?: boolean;
  
  /**
   * Display compact version
   */
  compact?: boolean;
}

/**
 * StrainLibrary component for displaying and managing cannabis strains
 */
const StrainLibrary: React.FC<StrainLibraryProps> = ({
  strains,
  title = 'Strain Library',
  description = 'Browse and manage your cannabis strain collection',
  pageSize = 12,
  selectable = false,
  selectedStrainIds = [],
  onSelectionChange,
  onStrainClick,
  onFavoriteToggle,
  className = '',
  layout = 'grid',
  showFilters = true,
  searchable = true,
  sortable = true,
  compact = false
}) => {
  // Sample strain data if none provided
  const sampleStrains: Strain[] = useMemo(() => [
    {
      id: 'strain-1',
      name: 'Blue Dream',
      type: 'hybrid',
      thcContent: 18,
      cbdContent: 0.5,
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Uplifted', 'Creative'],
      flavors: ['Blueberry', 'Sweet', 'Berry'],
      description: 'Blue Dream is a sativa-dominant hybrid with a sweet berry aroma.',
      rating: 4.5,
      favorite: true,
      terpenes: [
        { name: 'Myrcene', percentage: 0.5 },
        { name: 'Caryophyllene', percentage: 0.3 },
        { name: 'Pinene', percentage: 0.2 }
      ]
    },
    {
      id: 'strain-2',
      name: 'OG Kush',
      type: 'indica',
      thcContent: 24,
      cbdContent: 0.3,
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Uplifted', 'Hungry'],
      flavors: ['Earthy', 'Pine', 'Woody'],
      description: 'OG Kush is a potent indica with a distinctive earthy pine scent.',
      rating: 4.8,
      favorite: false,
      terpenes: [
        { name: 'Limonene', percentage: 0.7 },
        { name: 'Myrcene', percentage: 0.3 },
        { name: 'Linalool', percentage: 0.1 }
      ]
    },
    {
      id: 'strain-3',
      name: 'Sour Diesel',
      type: 'sativa',
      thcContent: 22,
      cbdContent: 0.2,
      effects: ['Energetic', 'Happy', 'Uplifted', 'Focused', 'Creative'],
      flavors: ['Diesel', 'Pungent', 'Earthy'],
      description: 'Sour Diesel is a fast-acting strain with energizing, dreamy cerebral effects.',
      rating: 4.3,
      favorite: true,
      terpenes: [
        { name: 'Caryophyllene', percentage: 0.4 },
        { name: 'Limonene', percentage: 0.3 },
        { name: 'Myrcene', percentage: 0.2 }
      ]
    },
    {
      id: 'strain-4',
      name: 'Girl Scout Cookies',
      type: 'hybrid',
      thcContent: 19,
      cbdContent: 0.1,
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Uplifted', 'Creative'],
      flavors: ['Sweet', 'Earthy', 'Dessert'],
      description: 'GSC is known for its sweet and earthy aroma and euphoric effects.',
      rating: 4.7,
      favorite: false,
      terpenes: [
        { name: 'Caryophyllene', percentage: 0.3 },
        { name: 'Limonene', percentage: 0.2 },
        { name: 'Humulene', percentage: 0.1 }
      ]
    },
    {
      id: 'strain-5',
      name: 'Northern Lights',
      type: 'indica',
      thcContent: 20,
      cbdContent: 0.1,
      effects: ['Relaxed', 'Sleepy', 'Happy', 'Euphoric', 'Hungry'],
      flavors: ['Sweet', 'Spicy', 'Pine'],
      description: 'Northern Lights provides strong physical effects with a sweet pine aroma.',
      rating: 4.6,
      favorite: true,
      terpenes: [
        { name: 'Myrcene', percentage: 0.6 },
        { name: 'Pinene', percentage: 0.2 },
        { name: 'Linalool', percentage: 0.1 }
      ]
    },
    {
      id: 'strain-6',
      name: 'Jack Herer',
      type: 'sativa',
      thcContent: 18,
      cbdContent: 0.2,
      effects: ['Happy', 'Uplifted', 'Creative', 'Energetic', 'Focused'],
      flavors: ['Earthy', 'Pine', 'Woody'],
      description: 'Jack Herer creates a clear-headed, creative experience.',
      rating: 4.5,
      favorite: false,
      terpenes: [
        { name: 'Terpinolene', percentage: 0.5 },
        { name: 'Pinene', percentage: 0.3 },
        { name: 'Caryophyllene', percentage: 0.1 }
      ]
    },
  ], []);

  // State for component
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    types: ('sativa' | 'indica' | 'hybrid')[];
    effects: string[];
    minThc: number | null;
    favorites: boolean;
  }>({
    types: [],
    effects: [],
    minThc: null,
    favorites: false
  });
  const [sortOption, setSortOption] = useState<'name' | 'thc' | 'rating'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedStrainIds || []);
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'list'>(layout);

  // Update local selection when prop changes
  useEffect(() => {
    if (JSON.stringify(selectedIds) !== JSON.stringify(selectedStrainIds)) {
      setSelectedIds(selectedStrainIds || []);
    }
  }, [selectedStrainIds]);

  // Get all available strains
  const allStrains = useMemo(() => strains || sampleStrains, [strains, sampleStrains]);

  // Get all unique effects
  const allEffects = useMemo(() => {
    const effectsSet = new Set<string>();
    allStrains.forEach(strain => {
      strain.effects?.forEach(effect => {
        effectsSet.add(effect);
      });
    });
    return Array.from(effectsSet);
  }, [allStrains]);

  // Filter strains based on search and filters
  const filteredStrains = useMemo(() => {
    return allStrains.filter(strain => {
      // Search query filter
      if (searchQuery && !strain.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (activeFilters.types.length > 0 && !activeFilters.types.includes(strain.type)) {
        return false;
      }

      // Effects filter
      if (activeFilters.effects.length > 0) {
        const hasSelectedEffect = activeFilters.effects.some(effect => 
          strain.effects?.includes(effect)
        );
        if (!hasSelectedEffect) return false;
      }

      // THC content filter
      if (activeFilters.minThc !== null && 
          (strain.thcContent === undefined || strain.thcContent < activeFilters.minThc)) {
        return false;
      }

      // Favorites filter
      if (activeFilters.favorites && !strain.favorite) {
        return false;
      }

      return true;
    });
  }, [allStrains, searchQuery, activeFilters]);

  // Sort strains
  const sortedStrains = useMemo(() => {
    return [...filteredStrains].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'thc':
          comparison = (a.thcContent || 0) - (b.thcContent || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredStrains, sortOption, sortDirection]);

  // Pagination
  const paginatedStrains = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedStrains.slice(startIndex, endIndex);
  }, [sortedStrains, currentPage, pageSize]);

  // Handle strain selection
  const handleStrainSelect = (strain: Strain) => {
    const newSelectedIds = [...selectedIds];
    const index = newSelectedIds.indexOf(strain.id);

    if (index > -1) {
      newSelectedIds.splice(index, 1);
    } else {
      newSelectedIds.push(strain.id);
    }

    setSelectedIds(newSelectedIds);
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
  };

  // Handle strain click
  const handleStrainClick = (strain: Strain) => {
    if (selectable) {
      handleStrainSelect(strain);
    } else if (onStrainClick) {
      onStrainClick(strain);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (strain: Strain, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the strain click
    if (onFavoriteToggle) {
      onFavoriteToggle(strain, !strain.favorite);
    }
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Update filters
  const updateFilters = (updates: Partial<typeof activeFilters>) => {
    setActiveFilters(prev => ({
      ...prev,
      ...updates
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Toggle strain type filter
  const toggleTypeFilter = (type: 'sativa' | 'indica' | 'hybrid') => {
    if (activeFilters.types.includes(type)) {
      updateFilters({ types: activeFilters.types.filter(t => t !== type) });
    } else {
      updateFilters({ types: [...activeFilters.types, type] });
    }
  };

  // Toggle effect filter
  const toggleEffectFilter = (effect: string) => {
    if (activeFilters.effects.includes(effect)) {
      updateFilters({ effects: activeFilters.effects.filter(e => e !== effect) });
    } else {
      updateFilters({ effects: [...activeFilters.effects, effect] });
    }
  };

  // Toggle favorites filter
  const toggleFavoritesFilter = () => {
    updateFilters({ favorites: !activeFilters.favorites });
  };

  // Update sort option
  const handleSortChange = (option: 'name' | 'thc' | 'rating') => {
    if (sortOption === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  // Toggle layout
  const toggleLayout = () => {
    setCurrentLayout(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Get pagination details
  const totalPages = Math.ceil(sortedStrains.length / pageSize);

  // Go to specific page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="strain-library-pagination">
        <button 
          className="page-button prev" 
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </button>
        
        <div className="page-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button 
                key={`page-${pageNum}`}
                className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="ellipsis">...</span>
              <button 
                className="page-number"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        <button 
          className="page-button next" 
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className={`strain-library ${className} ${compact ? 'compact' : ''}`}>
      <div className="strain-library-header">
        <div className="header-content">
          <Text variant="h3" className="library-title">{title}</Text>
          <Text variant="body" className="library-description">{description}</Text>
        </div>
        
        <div className="header-actions">
          {sortable && (
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select"
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="sort-select"
              >
                <option value="name">Name</option>
                <option value="thc">THC Content</option>
                <option value="rating">Rating</option>
              </select>
              
              <button 
                className="sort-direction-button"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}
          
          <button 
            className={`layout-toggle ${currentLayout}`}
            onClick={toggleLayout}
            title={`Switch to ${currentLayout === 'grid' ? 'list' : 'grid'} view`}
          >
            {currentLayout === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>
      
      <div className="strain-library-controls">
        {searchable && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search strains..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        )}
        
        {showFilters && (
          <div className="filter-container">
            <div className="filter-section">
              <Text variant="body-sm" className="filter-title">Type</Text>
              <div className="filter-options">
                <button
                  className={`filter-button type-indicator sativa ${activeFilters.types.includes('sativa') ? 'active' : ''}`}
                  onClick={() => toggleTypeFilter('sativa')}
                >
                  Sativa
                </button>
                <button
                  className={`filter-button type-indicator hybrid ${activeFilters.types.includes('hybrid') ? 'active' : ''}`}
                  onClick={() => toggleTypeFilter('hybrid')}
                >
                  Hybrid
                </button>
                <button
                  className={`filter-button type-indicator indica ${activeFilters.types.includes('indica') ? 'active' : ''}`}
                  onClick={() => toggleTypeFilter('indica')}
                >
                  Indica
                </button>
              </div>
            </div>
            
            <div className="filter-section">
              <Text variant="body-sm" className="filter-title">Effects</Text>
              <div className="filter-options scrollable">
                {allEffects.slice(0, 6).map(effect => (
                  <button
                    key={effect}
                    className={`filter-button effect ${activeFilters.effects.includes(effect) ? 'active' : ''}`}
                    onClick={() => toggleEffectFilter(effect)}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-section">
              <Text variant="body-sm" className="filter-title">THC Level</Text>
              <div className="filter-options">
                <button
                  className={`filter-button ${activeFilters.minThc === 15 ? 'active' : ''}`}
                  onClick={() => updateFilters({ minThc: activeFilters.minThc === 15 ? null : 15 })}
                >
                  15%+
                </button>
                <button
                  className={`filter-button ${activeFilters.minThc === 20 ? 'active' : ''}`}
                  onClick={() => updateFilters({ minThc: activeFilters.minThc === 20 ? null : 20 })}
                >
                  20%+
                </button>
                <button
                  className={`filter-button ${activeFilters.minThc === 25 ? 'active' : ''}`}
                  onClick={() => updateFilters({ minThc: activeFilters.minThc === 25 ? null : 25 })}
                >
                  25%+
                </button>
              </div>
            </div>
            
            <div className="filter-section">
              <button
                className={`filter-button favorite ${activeFilters.favorites ? 'active' : ''}`}
                onClick={toggleFavoritesFilter}
              >
                Favorites Only
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={`strain-library-content ${currentLayout}`}>
        {paginatedStrains.length === 0 ? (
          <div className="no-results">
            <Text variant="body">No strains found matching your criteria.</Text>
          </div>
        ) : (
          paginatedStrains.map(strain => (
            <div 
              key={strain.id}
              className={`strain-card ${currentLayout} ${selectable && selectedIds.includes(strain.id) ? 'selected' : ''}`}
              onClick={() => handleStrainClick(strain)}
            >
              <div className={`strain-type-indicator ${strain.type}`}></div>
              
              <div className="strain-image-container">
                {strain.imageUrl ? (
                  <img src={strain.imageUrl} alt={strain.name} className="strain-image" />
                ) : (
                  <div className="strain-image-placeholder">
                    <span className="strain-initial">{strain.name.charAt(0)}</span>
                  </div>
                )}
                
                <button 
                  className={`favorite-button ${strain.favorite ? 'favorited' : ''}`}
                  onClick={(e) => handleFavoriteToggle(strain, e)}
                  title={strain.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  ★
                </button>
              </div>
              
              <div className="strain-details">
                <div className="strain-header">
                  <Text variant="h4" className="strain-name">{strain.name}</Text>
                  <div className="strain-type-badge">{strain.type}</div>
                </div>
                
                <div className="strain-info">
                  {strain.thcContent !== undefined && (
                    <div className="strain-stat">
                      <span className="stat-label">THC</span>
                      <span className="stat-value">{strain.thcContent}%</span>
                    </div>
                  )}
                  
                  {strain.cbdContent !== undefined && (
                    <div className="strain-stat">
                      <span className="stat-label">CBD</span>
                      <span className="stat-value">{strain.cbdContent}%</span>
                    </div>
                  )}
                  
                  {strain.rating !== undefined && (
                    <div className="strain-rating">
                      <span className="rating-value">{strain.rating}</span>
                      <span className="rating-stars">
                        {'★'.repeat(Math.floor(strain.rating))}
                        {'☆'.repeat(5 - Math.floor(strain.rating))}
                      </span>
                    </div>
                  )}
                </div>
                
                {!compact && (
                  <>
                    {strain.effects && strain.effects.length > 0 && (
                      <div className="strain-effects">
                        {strain.effects.slice(0, 3).map(effect => (
                          <span key={effect} className="effect-tag">{effect}</span>
                        ))}
                        {strain.effects.length > 3 && (
                          <span className="effect-tag more">+{strain.effects.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {strain.description && (
                      <Text variant="body-sm" className="strain-description">
                        {strain.description.length > 100
                          ? `${strain.description.substring(0, 100)}...`
                          : strain.description}
                      </Text>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default StrainLibrary; 