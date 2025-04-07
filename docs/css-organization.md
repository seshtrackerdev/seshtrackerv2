# SeshTracker CSS Organization

## Overview

This document outlines the CSS organization strategy for the SeshTracker application. It provides guidelines for organizing, naming, and importing CSS files to maintain consistency and avoid style conflicts.

## CSS Structure

The SeshTracker application uses a component-scoped CSS approach with the following directory structure:

```
src/
└── react-app/
    ├── styles/                  # Global styles
    │   ├── index.css            # Entry point for global styles
    │   ├── variables.css        # CSS variables (colors, spacing, etc.)
    │   ├── Dashboard.css        # Feature-specific shared styles
    │   └── LandingPage.css      # Page-specific styles
    └── components/
        └── [component-type]/
            ├── Component.tsx    # Component file
            └── Component.css    # Component-specific styles
```

## CSS Import Strategy

### Global Styles

Global styles are imported in the main entry point file:

```typescript
// src/react-app/main.tsx
import './styles/index.css';
```

### Component Styles

Component-specific styles should be co-located with their components:

```typescript
// src/react-app/components/ui/Button/Button.tsx
import './Button.css';
```

### Feature Styles

For shared styles across a feature, import them from the styles directory:

```typescript
// src/react-app/components/dashboard/Dashboard.tsx
import '../../styles/Dashboard.css';
```

## CSS Best Practices

1. **Component Scoping**: Use naming conventions to scope styles to components to avoid style conflicts:
   ```css
   /* Button.css */
   .button { /* ... */ }
   .button--primary { /* ... */ }
   .button__icon { /* ... */ }
   ```

2. **CSS Variables**: Use CSS variables for consistency:
   ```css
   /* variables.css */
   :root {
     --color-primary: #4a90e2;
     --spacing-sm: 8px;
     /* ... */
   }
   
   /* Component.css */
   .component {
     color: var(--color-primary);
     padding: var(--spacing-sm);
   }
   ```

3. **Media Queries**: Include responsive styles within the component CSS files:
   ```css
   .component {
     width: 100%;
   }
   
   @media (min-width: 768px) {
     .component {
       width: 50%;
     }
   }
   ```

4. **Shared Utility Classes**: Define utility classes in global styles:
   ```css
   /* utilities.css */
   .text-center { text-align: center; }
   .mt-1 { margin-top: 0.25rem; }
   /* ... */
   ```

## CSS Organization Improvements

Based on the current project structure, we recommend the following improvements:

1. **Centralize styles for UI components**:
   - Move component-specific styles (like `Button.css`) to a styles directory within the UI folder
   - Example: `src/react-app/components/ui/styles/Button.css`

2. **Create a style export barrel**:
   - Similar to the component barrel pattern, create an index.css file that imports all styles

3. **Update import paths**:
   - For individual components, use relative imports: `import './Component.css'`
   - For shared styles, use absolute imports from the styles directory: `import '@/styles/Feature.css'`

## Migration Plan

To migrate to this improved structure:

1. Create a centralized `styles` directory for each feature domain
2. Move CSS files into their appropriate directory
3. Update import paths in components
4. Create index files to re-export CSS where appropriate

## Theme Support

The application supports light and dark themes using CSS variables and the `ThemeProvider` component. 

1. **Define theme variables**:
   ```css
   /* themes.css */
   :root {
     /* Light theme (default) */
     --bg-primary: #ffffff;
     --text-primary: #333333;
   }
   
   [data-theme="dark"] {
     --bg-primary: #1f1f1f;
     --text-primary: #f0f0f0;
   }
   ```

2. **Apply theme variables** in component styles:
   ```css
   .component {
     background-color: var(--bg-primary);
     color: var(--text-primary);
   }
   ```

By following these guidelines, we can maintain a clean, organized CSS structure that scales well as the application grows. 