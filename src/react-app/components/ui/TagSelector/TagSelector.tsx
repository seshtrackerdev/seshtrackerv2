import React, { useState, useEffect, useRef } from 'react';
import "../../../styles/.css";

export interface Tag {
  id: string;
  label: string;
  color?: string;
  category?: string;
}

export interface TagSelectorProps {
  /**
   * Array of available tags to select from
   */
  availableTags?: Tag[];
  
  /**
   * Currently selected tag IDs
   */
  selectedTagIds?: string[];
  
  /**
   * Callback when selected tags change
   */
  onChange?: (selectedTags: Tag[]) => void;
  
  /**
   * Whether to allow adding new tags that aren't in the available list
   */
  allowNewTags?: boolean;
  
  /**
   * Callback when a new tag is created
   */
  onNewTag?: (tag: Omit<Tag, 'id'>) => void;
  
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  
  /**
   * Maximum number of tags that can be selected
   */
  maxTags?: number;
  
  /**
   * Whether to show tag categories
   */
  showCategories?: boolean;
  
  /**
   * Whether to allow searching tags
   */
  searchable?: boolean;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Label text to display above the selector
   */
  label?: string;
  
  /**
   * Helper text to display below the selector
   */
  helperText?: string;
  
  /**
   * Required field indicator
   */
  required?: boolean;
}

/**
 * TagSelector component for selecting and managing tags
 */
const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags = [],
  selectedTagIds = [],
  onChange,
  allowNewTags = true,
  onNewTag,
  placeholder = 'Add tags...',
  maxTags,
  showCategories = false,
  searchable = true,
  className = '',
  size = 'md',
  disabled = false,
  error,
  label,
  helperText,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selected tags from IDs
  useEffect(() => {
    // Compare current selectedTags with what it would be after mapping
    const newTags = selectedTagIds.map(id => 
      availableTags.find(tag => tag.id === id)
    ).filter((tag): tag is Tag => !!tag);
    
    // Only update if they're different to prevent infinite loops
    if (JSON.stringify(newTags.map(t => t.id)) !== JSON.stringify(selectedTags.map(t => t.id))) {
      setSelectedTags(newTags);
    }
  }, [selectedTagIds, availableTags, selectedTags]);

  // Update filtered tags based on input value
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredTags(availableTags.filter(tag => 
        !selectedTagIds.includes(tag.id)
      ));
      return;
    }
    
    const lowerCaseInput = inputValue.toLowerCase();
    const filtered = availableTags.filter(tag => 
      tag.label.toLowerCase().includes(lowerCaseInput) && 
      !selectedTagIds.includes(tag.id)
    );
    
    setFilteredTags(filtered);
  }, [inputValue, availableTags, selectedTagIds]);

  // Handle adding a tag
  const handleAddTag = (tag: Tag) => {
    if (maxTags && selectedTags.length >= maxTags) {
      return;
    }
    
    const newSelectedTags = [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
    
    if (onChange) {
      onChange(newSelectedTags);
    }
    
    setInputValue('');
  };

  // Handle removing a tag
  const handleRemoveTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag.id !== tagId);
    setSelectedTags(newSelectedTags);
    
    if (onChange) {
      onChange(newSelectedTags);
    }
  };

  // Handle creating a new tag
  const handleCreateTag = () => {
    if (!inputValue.trim() || !allowNewTags) return;
    
    // Generate a temporary ID (would be replaced by the server)
    const tempId = `temp-${Date.now()}`;
    const newTag: Tag = {
      id: tempId,
      label: inputValue.trim(),
      color: getRandomColor(),
    };
    
    handleAddTag(newTag);
    
    if (onNewTag) {
      onNewTag({
        label: newTag.label,
        color: newTag.color,
      });
    }
  };

  // Generate a random color for new tags
  const getRandomColor = (): string => {
    const colors = [
      '#4CAF50', // Green
      '#2196F3', // Blue
      '#9C27B0', // Purple
      '#F44336', // Red
      '#FF9800', // Orange
      '#795548', // Brown
      '#607D8B', // Blue Grey
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle input keydown events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there are filtered results, add the first one
      if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0]);
      } else if (inputValue.trim() && allowNewTags) {
        handleCreateTag();
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed with empty input
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Group tags by category if showCategories is true
  const groupedTags = showCategories 
    ? filteredTags.reduce<Record<string, Tag[]>>((acc, tag) => {
        const category = tag.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tag);
        return acc;
      }, {})
    : { 'All Tags': filteredTags };

  return (
    <div className={`tag-selector-container ${className} ${size} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}>
      {label && (
        <label className="tag-selector-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="tag-selector">
        <div className="tag-input-container" onClick={() => inputRef.current?.focus()}>
          <div className="selected-tags">
            {selectedTags.map(tag => (
              <div 
                key={tag.id} 
                className="tag"
                style={{ backgroundColor: tag.color }}
              >
                <span className="tag-label">{tag.label}</span>
                <button 
                  className="tag-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag.id);
                  }}
                  disabled={disabled}
                  type="button"
                  aria-label={`Remove ${tag.label}`}
                >
                  ×
                </button>
              </div>
            ))}
            
            <input
              ref={inputRef}
              type="text"
              className="tag-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              placeholder={selectedTags.length === 0 ? placeholder : ''}
              disabled={disabled || (maxTags !== undefined && selectedTags.length >= maxTags)}
            />
          </div>
        </div>
        
        {isFocused && !disabled && (
          <div className="tag-dropdown" ref={dropdownRef}>
            {Object.entries(groupedTags).map(([category, tags]) => (
              <div key={category} className="tag-group">
                {showCategories && tags.length > 0 && (
                  <div className="tag-category">{category}</div>
                )}
                
                {tags.length > 0 ? (
                  <div className="tag-options">
                    {tags.map(tag => (
                      <div 
                        key={tag.id} 
                        className="tag-option"
                        onClick={() => handleAddTag(tag)}
                      >
                        <span 
                          className="tag-color-indicator" 
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="tag-option-label">{tag.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  inputValue.trim() && allowNewTags ? (
                    <div className="create-tag-option" onClick={handleCreateTag}>
                      <span className="create-tag-icon">+</span>
                      <span className="create-tag-label">Create "{inputValue}"</span>
                    </div>
                  ) : (
                    <div className="no-tags-message">No matching tags</div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error ? (
        <div className="tag-selector-error">{error}</div>
      ) : helperText ? (
        <div className="tag-selector-helper">{helperText}</div>
      ) : maxTags ? (
        <div className="tag-selector-helper">
          {selectedTags.length} of {maxTags} tags selected
        </div>
      ) : null}
    </div>
  );
};

export default TagSelector; 
