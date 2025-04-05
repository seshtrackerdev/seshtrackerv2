# SeshTracker CSS Architecture

This directory contains the CSS architecture for the SeshTracker application, following a modular, mobile-first approach with a focus on maintainability and reusability.

## Structure Overview

```
styles/
├── README.md           # This documentation file
├── main.css            # Entry point that imports all styles
├── variables.css       # Design tokens and CSS variables
├── base.css            # Reset and base styles
└── snippets/           # Reusable component styles
    ├── navigation.css  # Header, footer, mobile nav styles
    ├── buttons.css     # Button variants and states
    ├── forms.css       # Form elements and layouts
    ├── cards.css       # Card styles and containers
    ├── utilities.css   # Utility classes and animations
    └── landing.css     # Landing page specific styles
```

## Key Principles

1. **Mobile-First**: All styles are written with a mobile-first approach, using `min-width` media queries to adapt for larger screens.
2. **Component-Based**: Styles are organized into logical components that can be reused throughout the application.
3. **CSS Variables**: Utilizing CSS custom properties for theming, consistency, and maintainability.
4. **Minimal Specificity**: Keeping selector specificity low to prevent specificity wars.
5. **Dark Mode Support**: Both media query and class-based theme switching support.

## How to Use

### Importing Styles

All styles are imported through the main entry point:

```css
/* In your app entry point */
import './styles/main.css';
```

### CSS Variables

Access design tokens through CSS variables defined in `variables.css`:

```css
.my-element {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}
```

### Component Classes

Use the predefined component classes:

```html
<button class="btn btn-primary">Primary Button</button>
<div class="card">Card Content</div>
<form class="form">Form Content</form>
```

### Utility Classes

Apply utility classes directly to HTML elements:

```html
<div class="mt-lg text-center">
  Centered content with large top margin
</div>
```

### Responsive Design

Styles automatically adapt to different screen sizes, following these breakpoints:

- Small: 640px and up
- Medium: 768px and up
- Large: 1024px and up
- XLarge: 1280px and up

### Theme Support

The app supports both automatic dark mode (via `prefers-color-scheme`) and manual theme toggling:

```html
<!-- For manual dark mode -->
<body class="dark-theme">
  <!-- content -->
</body>
```

## Adding New Styles

1. **For Component Styles**: Add component-specific styles to the appropriate snippet file.
2. **For Page-Specific Styles**: Consider if the styles are reusable. If not, create a page-specific CSS file.
3. **For New Design Tokens**: Add new variables to `variables.css` with appropriate documentation.

## Best Practices

1. **Avoid Inline Styles**: Use the CSS architecture instead of inline styles.
2. **Don't Use !important**: Maintain low specificity to avoid specificity issues.
3. **Follow Naming Conventions**: Use consistent, descriptive names for classes.
4. **Comment Complex Styles**: Add comments to explain complex or non-obvious styles.
5. **Use Existing Components**: Check if a component or utility already exists before creating new styles.
6. **Respect Mobile-First Approach**: Start with mobile styles, then adapt for larger screens.
7. **Keep Selectors Simple**: Avoid deep nesting of selectors.

## CSS Variables Reference

See `variables.css` for a complete list of CSS variables available in the application, including:

- Color palette (primary, secondary, semantic colors)
- Typography (font families, sizes, weights)
- Spacing values
- Breakpoints
- Shadows and elevations
- Animation timing
- Component-specific variables 