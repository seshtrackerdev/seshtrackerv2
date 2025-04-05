# Sesh-Tracker Design System

This document outlines the design system for Sesh-Tracker.com, standardizing the existing design patterns, colors, typography, and UI components. This system is based on the current implementation and serves as a guide for maintaining consistency throughout the application.

## 🎨 Color Palette

### Cannabis-themed Colors

| Name | Variable | Value | Usage |
|------|----------|-------|-------|
| Cannabis Green | `--cannabis-green` | `#43a047` | Primary brand color |
| Cannabis Green Light | `--cannabis-green-light` | `#76d275` | Hover states, highlights |
| Cannabis Green Dark | `--cannabis-green-dark` | `#00701a` | Accents, focus states |
| Cannabis Purple | `--cannabis-purple` | `#7b2cbf` | Secondary brand color |
| Cannabis Purple Light | `--cannabis-purple-light` | `#ae52f4` | Highlights, special elements |
| Cannabis Purple Dark | `--cannabis-purple-dark` | `#4a148c` | Accents, deep contrast |
| Cannabis Earth | `--cannabis-earth` | `#795548` | Earthy tones, neutrals |
| Cannabis Gold | `--cannabis-gold` | `#ffc107` | Highlights, warnings |

### Theme-Based Colors

#### Dark Theme (Default)

| Name | Variable | Value | Usage |
|------|----------|-------|-------|
| Background Primary | `--bg-primary` | `var(--color-dark)` | Main background |
| Background Secondary | `--bg-secondary` | `var(--color-dark-accent)` | Card backgrounds, containers |
| Text Primary | `--text-primary` | `var(--text-primary-dark)` | Main text content |
| Text Secondary | `--text-secondary` | `var(--text-secondary-dark)` | Subtle text, captions |
| Accent Color | `--accent-color` | `var(--cannabis-green)` | Primary interactive elements |
| Accent Hover | `--accent-hover` | `var(--cannabis-green-light)` | Hover states |
| Accent Secondary | `--accent-secondary` | `var(--cannabis-purple)` | Secondary interactive elements |

#### Light Theme

| Name | Variable | Value | Usage |
|------|----------|-------|-------|
| Background Primary | `--bg-primary` | `var(--color-light)` | Main background |
| Background Secondary | `--bg-secondary` | `var(--color-light-accent)` | Card backgrounds, containers |
| Text Primary | `--text-primary` | `var(--text-primary-light)` | Main text content |
| Text Secondary | `--text-secondary` | `var(--text-secondary-light)` | Subtle text, captions |
| Accent Color | `--accent-color` | `var(--cannabis-green-dark)` | Primary interactive elements |
| Accent Hover | `--accent-hover` | `var(--cannabis-green)` | Hover states |
| Accent Secondary | `--accent-secondary` | `var(--cannabis-purple-dark)` | Secondary interactive elements |

## 🔤 Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|------------|-------|
| xs | 0.75rem | 1rem | Fine print, captions |
| sm | 0.875rem | 1.25rem | Secondary text, labels |
| base | 1rem | 1.5rem | Body text |
| lg | 1.125rem | 1.75rem | Emphasized body text |
| xl | 1.25rem | 1.75rem | Subheadings |
| 2xl | 1.5rem | 2rem | Section headings |
| 3xl | 1.875rem | 2.25rem | Page titles |
| 4xl | 2.25rem | 2.5rem | Hero text |

### Headings

```css
h1, h2, h3, h4, h5, h6 {
  margin-bottom: var(--spacing-xs);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h1 { font-size: 1.75rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
```

### Text Styles

| Class | Description | Example Usage |
|-------|-------------|--------------|
| `brand-gradient` | Green gradient text | Brand name, highlights |
| `brand-gradient-purple` | Purple gradient text | Special elements |
| `text-center` | Centered text | Section headings |

## 📏 Spacing

| Name | Value | Usage |
|------|-------|-------|
| xs | 0.25rem | Tiny spacing (4px) |
| sm | 0.5rem | Small spacing (8px) |
| md | 1rem | Standard spacing (16px) |
| lg | 1.5rem | Large spacing (24px) |
| xl | 2rem | Extra large spacing (32px) |
| 2xl | 3rem | Double extra large spacing (48px) |

## 🔄 Borders & Radius

| Name | Value | Usage |
|------|-------|-------|
| Border Color | `var(--border-color)` | Container borders |
| Radius Small | `var(--radius-sm)` | Small elements |
| Radius Medium | `var(--radius-md)` | Buttons, inputs |
| Radius Large | `var(--radius-lg)` | Cards, dialogs |

## 🔳 Shadows

| Name | Value | Usage |
|------|-------|-------|
| Shadow Small | `var(--shadow-sm)` | Subtle elevation |
| Shadow Medium | `var(--shadow-md)` | Cards, dropdowns |
| Shadow Large | `var(--shadow-lg)` | Modals, popovers |

## ⏱️ Animation & Transitions

| Name | Value | Usage |
|------|-------|-------|
| Transition Fast | 150ms ease | Micro-interactions |
| Transition Normal | 250ms ease | Standard transitions |
| Transition Slow | 350ms ease | Emphasized transitions |

## 🧩 UI Components

### Buttons

#### Primary Button

```css
.btn-primary {
  background: linear-gradient(90deg, var(--cannabis-green), var(--cannabis-green-light));
  color: var(--bg-primary);
  font-weight: 600;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-position: right center;
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button

```css
.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  background-color: var(--accent-color);
  color: var(--bg-primary);
}
```

#### Tertiary Button (Text Link)

```css
.btn-tertiary {
  background-color: transparent;
  color: var(--accent-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  transition: color var(--transition-fast);
}

.btn-tertiary:hover {
  color: var(--accent-hover);
}
```

### Form Elements

#### Input Fields

```css
.form-input {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  width: 100%;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
}
```

#### Form Groups

```css
.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
```

### Cards

```css
.card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
```

### Navigation

#### App Header

```css
.app-header {
  position: sticky;
  top: 0;
  height: var(--header-height);
  width: 100%;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 50;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(var(--bg-primary-rgba), 0.85);
}

.header-content {
  max-width: var(--max-content-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--page-margin);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

#### Mobile Navigation

```css
.mobile-nav {
  position: fixed;
  top: var(--header-height);
  right: 0;
  width: 100%;
  max-width: 300px;
  height: calc(100vh - var(--header-height));
  background-color: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  transform: translateX(100%);
  transition: transform var(--transition-normal);
  overflow-y: auto;
  z-index: 40;
}

.mobile-nav.open {
  transform: translateX(0);
  box-shadow: var(--shadow-lg);
}
```

## 📱 Responsive Behavior

### Breakpoints

| Name | Size | Description |
|------|------|-------------|
| sm | 640px | Small devices, phones |
| md | 768px | Medium devices, tablets |
| lg | 1024px | Large devices, laptops |
| xl | 1280px | Extra large devices, desktops |
| 2xl | 1536px | Extra extra large devices |

### Mobile-First Approach

All styles in the codebase are built with a mobile-first approach, using min-width media queries to apply styles for larger screens.

```css
/* Mobile (default) */
.element {
  font-size: 1rem;
}

/* Tablet and above */
@media (min-width: 768px) {
  .element {
    font-size: 1.25rem;
  }
}

/* Desktop and above */
@media (min-width: 1024px) {
  .element {
    font-size: 1.5rem;
  }
}
```

## 🖼️ Icons & Images

### SVG Icons

Use stroke-based SVG icons from libraries such as Feather Icons, with consistent sizing:

```html
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <!-- Icon path data -->
</svg>
```

### Cannabis Theme Decorations

Cannabis-themed decorations like leaf emojis (🍃) are used throughout the interface for branding and visual interest.

## 🎭 Animation Patterns

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Pulse

```css
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(67, 160, 71, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(67, 160, 71, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(67, 160, 71, 0);
  }
}
```

### Page Transitions

The application uses Framer Motion for page transitions with the `PageTransition` component:

```tsx
<PageTransition>
  <Component />
</PageTransition>
```

## 📝 Implementation Guidelines

1. **CSS Variables**: Use the established CSS variables for colors, spacing, etc. instead of hard-coded values.
2. **BEM Naming Convention**: Follow the Block-Element-Modifier pattern for class names.
3. **TailwindCSS Classes**: When using Tailwind, prioritize using the theme extensions in the tailwind.config.js file.
4. **Mobile-First**: Always start with mobile layouts and use min-width queries to enhance for larger screens.
5. **Animation Moderation**: Use animations purposefully and sparingly to enhance the user experience.
6. **Dark Mode Priority**: Design for dark mode first, then ensure proper light mode adaptation.

## 🔧 Implementation with Tailwind

The design system is integrated with Tailwind CSS through the tailwind.config.js file. Use Tailwind utility classes that leverage these variables:

```html
<!-- Button Example -->
<button class="bg-accent hover:bg-accent-hover text-background rounded px-md py-sm transition-default">
  Click Me
</button>

<!-- Card Example -->
<div class="bg-card rounded-lg shadow p-lg border border-border hover:shadow-lg">
  Card Content
</div>
```

## 📊 Examples

### Component Composition

```tsx
// Button Component
const Button = ({ children, variant = 'primary', ...props }) => {
  const variantClasses = {
    primary: 'bg-accent text-background hover:bg-accent-hover',
    secondary: 'border border-accent text-accent hover:bg-accent hover:text-background',
    tertiary: 'text-accent hover:text-accent-hover'
  };
  
  return (
    <button 
      className={`px-md py-sm rounded transition-default ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
``` 