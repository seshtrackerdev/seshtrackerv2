# UI Component Library Plan

Based on the existing design patterns and UI components in the Sesh-Tracker application, this document outlines a plan for creating a comprehensive, reusable UI component library. This structured approach will help maintain consistency, improve development efficiency, and ensure a cohesive user experience.

## 📋 Component Library Structure

The component library will follow a hierarchical structure:

```
src/
├── components/
│   ├── ui/              # Base UI primitives
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Container/
│   │   ├── Grid/
│   │   └── ...
│   ├── composite/       # Combined components
│   │   ├── Form/
│   │   ├── NavMenu/
│   │   └── ...
│   └── features/        # Feature-specific components
│       ├── auth/
│       ├── dashboard/
│       ├── sessions/
│       └── ...
```

## 🧩 Base UI Components

These are the foundational elements that will be used throughout the application.

### Button Component

Standardize on button variants from the existing design patterns:

```tsx
// Button.tsx
import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'icon';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
};
```

### Input Component

Create a flexible input component based on the existing form styles:

```tsx
// Input.tsx
import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  id,
  className = '',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
      {helpText && <div className="form-help-text">{helpText}</div>}
    </div>
  );
});
```

### Card Component

Extract the card pattern from the existing styles:

```tsx
// Card.tsx
import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  return (
    <div 
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = '',
}) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = '',
}) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = '',
}) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
```

### Text Component

Standardize typography with a Text component:

```tsx
// Text.tsx
import React from 'react';
import './Text.css';

type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body' | 'body-sm' | 'body-lg'
  | 'caption';

interface TextProps {
  variant?: TextVariant;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  gradient?: 'green' | 'purple' | 'none';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  as,
  children,
  className = '',
  gradient = 'none',
  ...props
}) => {
  const Component = as || (
    variant.startsWith('h') ? variant : 
    variant === 'body' || variant === 'body-sm' || variant === 'body-lg' ? 'p' : 'span'
  );
  
  const gradientClass = gradient !== 'none' 
    ? gradient === 'green' 
      ? 'brand-gradient' 
      : 'brand-gradient-purple'
    : '';
  
  return (
    <Component 
      className={`text-${variant} ${gradientClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
```

## 📝 Form Components

Create a cohesive form library based on the current form styles:

### Form Container

```tsx
// Form.tsx
import React from 'react';
import './Form.css';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = '',
  ...props
}) => {
  return (
    <form 
      className={`form ${className}`}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
};
```

### Form Elements

Additional form-related components to standardize:

```tsx
// FormGroup.tsx
export const FormGroup: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = '',
}) => (
  <div className={`form-group ${className}`}>{children}</div>
);

// FormError.tsx
export const FormError: React.FC<{message: string}> = ({ message }) => (
  <div className="auth-error">{message}</div>
);

// FormSuccess.tsx
export const FormSuccess: React.FC<{message: string}> = ({ message }) => (
  <div className="auth-success">{message}</div>
);
```

## 🧭 Navigation Components

Create reusable navigation components based on existing patterns:

### Header Component

```tsx
// Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  brandLink: string;
  showMobileMenu?: boolean;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  brandLink,
  showMobileMenu = true,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  children,
}) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  
  const isMenuOpen = onToggleMobileMenu ? isMobileMenuOpen : internalMobileMenuOpen;
  
  const handleToggleMenu = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalMobileMenuOpen(!internalMobileMenuOpen);
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to={brandLink} className="header-brand">
          <img src="/images/favicon.png" alt="SeshTracker" className="header-logo" />
          <span className="brand-text">
            <span className="brand-gradient">Sesh</span>-Tracker<span className="domain">.com</span>
          </span>
        </Link>
        
        <div className="header-actions">
          {showMobileMenu && (
            <button
              className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={handleToggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                  <small className="cannabis-icon" aria-hidden="true">🍃</small>
                </>
              )}
            </button>
          )}
          {children}
        </div>
      </div>
    </header>
  );
};
```

### Mobile Navigation

```tsx
// MobileNavigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './MobileNavigation.css';

interface MobileNavLink {
  to: string;
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface MobileNavSection {
  title: string;
  links: (MobileNavLink | React.ReactNode)[];
}

interface MobileNavigationProps {
  isOpen: boolean;
  sections: MobileNavSection[];
  onLinkClick?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  sections,
  onLinkClick,
}) => {
  return (
    <nav className={`mobile-nav ${isOpen ? 'open' : ''}`}>
      {/* Cannabis leaf decorations */}
      <div className="menu-decoration" aria-hidden="true">
        <div className="menu-leaf menu-leaf-1">🍃</div>
        <div className="menu-leaf menu-leaf-2">🍃</div>
        <div className="menu-leaf menu-leaf-3">🍃</div>
      </div>
      
      {sections.map((section, index) => (
        <React.Fragment key={`section-${index}`}>
          <div className="nav-section">{section.title}</div>
          
          {section.links.map((link, linkIndex) => {
            if (React.isValidElement(link)) {
              return React.cloneElement(link as React.ReactElement, { 
                key: `custom-link-${linkIndex}`,
                onClick: () => onLinkClick?.()
              });
            }
            
            const navLink = link as MobileNavLink;
            return (
              <Link 
                key={`link-${linkIndex}`}
                to={navLink.to} 
                onClick={onLinkClick}
                className={navLink.isActive ? 'active' : ''}
              >
                <span>
                  {navLink.icon}
                  {navLink.label}
                </span>
              </Link>
            );
          })}
        </React.Fragment>
      ))}
    </nav>
  );
};
```

## 🖌️ Layout Components

Create consistent layout components:

### Container

```tsx
// Container.tsx
import React from 'react';
import './Container.css';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`container ${className}`} {...props}>
      {children}
    </div>
  );
};
```

### Grid

```tsx
// Grid.tsx
import React from 'react';
import './Grid.css';

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`grid grid-cols-${columns} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
```

## 🌿 Cannabis-Themed Decorative Components

Create standardized decorative elements based on the cannabis theme:

```tsx
// LeafDecoration.tsx
import React from 'react';
import './LeafDecoration.css';

interface LeafDecorationProps {
  count?: number;
  animated?: boolean;
  className?: string;
}

export const LeafDecoration: React.FC<LeafDecorationProps> = ({
  count = 3,
  animated = true,
  className = '',
}) => {
  return (
    <div className={`leaf-animation ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={`leaf-${index}`}
          className={`leaf leaf-${index + 1} ${animated ? 'animated' : ''}`}
        />
      ))}
    </div>
  );
};
```

## 🔄 Transition Components

Standardize the page transition effects:

```tsx
// PageTransition.tsx
import React from 'react';
import { motion } from 'framer-motion';
import './PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };
  
  return (
    <motion.div
      className={`page-transition ${className}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
```

## 🎨 Component Theming

Support for both dark and light modes through a ThemeProvider:

```tsx
// ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' ? 'light' : 'dark');
  });
  
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

## 📱 Feature-Specific Components

Build higher-level components for specific features:

### Authentication Components

```tsx
// AuthForm.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Form, FormGroup, FormError, Button, Input } from '../ui';
import './AuthForm.css';

interface AuthFormProps {
  title: string;
  subtitle: string;
  formContent: React.ReactNode;
  error?: string;
  footerContent?: React.ReactNode;
  className?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  formContent,
  error,
  footerContent,
  className = '',
}) => {
  return (
    <div className={`auth-form-container ${className}`}>
      <div className="auth-form-content">
        <div className="auth-form-header">
          <h2 className="auth-form-title">{title}</h2>
          <p className="auth-form-subtitle">{subtitle}</p>
        </div>
        
        {error && <FormError message={error} />}
        
        {formContent}
      </div>
      
      {footerContent && (
        <div className="auth-footer">
          {footerContent}
        </div>
      )}
    </div>
  );
};
```

## 📊 Implementation Plan

1. **Phase 1: Base Components**
   - Implement the basic UI primitives (Button, Input, Card, Text)
   - Create CSS files for each component
   - Document props and usage

2. **Phase 2: Layout and Structural Components**
   - Implement Container, Grid, and other layout components
   - Build navigation components (Header, MobileNavigation)
   - Create ThemeProvider for consistent theming

3. **Phase 3: Composite Components**
   - Build Form-related components
   - Create transition components
   - Implement decorative elements

4. **Phase 4: Feature Components**
   - Build authentication-related components
   - Create dashboard widgets
   - Add session and inventory components

5. **Phase 5: Documentation and Testing**
   - Document all components with examples
   - Create unit tests for components
   - Build a simple component showcase

## 📐 Component Guidelines

1. **Composition Over Inheritance**: Prefer composition patterns over inheritance.
2. **Prop Drilling Minimization**: Use context where appropriate to avoid excessive prop drilling.
3. **Consistent Naming**: Follow consistent naming patterns for props and components.
4. **Accessibility**: Ensure all components meet WCAG 2.1 AA standards.
5. **Responsive Design**: All components should work across all device sizes.
6. **Performance**: Keep components lightweight and avoid unnecessary re-renders.
7. **Testing**: Each component should have appropriate tests.

## 🔍 Next Steps

1. Create component templates and boilerplate
2. Refactor existing UI code to use the new component library
3. Document each component with usage examples
4. Add type definitions for all components
5. Build a simple component showcase page for development 