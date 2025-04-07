import React from 'react';
import "../../../styles/.css";

// Tab component props
export interface TabProps {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

// Tab component
const Tab = ({ children, isSelected, onClick }: TabProps) => {
  return (
    <button 
      data-selected={isSelected}
      onClick={onClick}
      className="tab-button"
    >
      {children}
    </button>
  );
};

// TabList component props
export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

// TabList component
const TabList = ({ children, className }: TabListProps) => {
  return (
    <div className={`tab-list ${className || ''}`}>
      {children}
    </div>
  );
};

// TabPanel component props
export interface TabPanelProps {
  children: React.ReactNode;
  isSelected?: boolean;
}

// TabPanel component
const TabPanel = ({ children, isSelected }: TabPanelProps) => {
  if (!isSelected) return null;
  return <div className="tab-panel">{children}</div>;
};

// Tabs component props
export interface TabsProps {
  children: React.ReactNode;
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

// Tabs container component
const Tabs = ({ children, selectedIndex, onChange, className }: TabsProps) => {
  // Clone children as needed to pass props
  const modifiedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
    // Handle TabList
    if (child.type === TabList) {
      const tabListChildren = React.Children.map(child.props.children, (tab, tabIndex) => {
        if (!React.isValidElement(tab) || tab.type !== Tab) return tab;
        
        // Type assertion to avoid TypeScript errors
        return React.cloneElement(tab as React.ReactElement<TabProps>, {
          isSelected: tabIndex === selectedIndex,
          onClick: () => onChange(tabIndex)
        });
      });
      
      // Type assertion to avoid TypeScript errors 
      return React.cloneElement(child as React.ReactElement<TabListProps>, {
        children: tabListChildren
      });
    }
    
    // Handle TabPanel
    if (child.type === TabPanel) {
      // Type assertion to avoid TypeScript errors
      return React.cloneElement(child as React.ReactElement<TabPanelProps>, {
        isSelected: React.Children.toArray(children).findIndex(
          (c) => React.isValidElement(c) && c === child
        ) - 1 === selectedIndex // Adjust for TabList being first child
      });
    }
    
    return child;
  });

  return <div className={`tabs ${className || ''}`}>{modifiedChildren}</div>;
};

export { Tab, TabList, TabPanel };
export default Tabs; 
