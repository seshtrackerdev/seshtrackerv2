# SeshTracker Mobile-First Theme System

This document outlines the mobile-first theming approach for SeshTracker, designed to provide a cohesive, cannabis-friendly design system that works well across all devices.

## Core Principles

1. **Mobile-First Design**: All components are designed for mobile first, then enhanced for larger screens
2. **Cannabis-Friendly Aesthetics**: Theme uses colors and elements that resonate with the cannabis community
3. **Consistent User Experience**: Common UI patterns and interactions across the entire application
4. **Performance Focused**: Optimized CSS and minimal JS for fast load times on mobile devices

## Color System

Our color system is based on a cannabis-themed palette, with sensible defaults for both dark and light modes:

### Cannabis-Themed Colors

- **Green Palette**: Main branding color representing cannabis
  - `--cannabis-green`: #43a047 (Primary)
  - `--cannabis-green-light`: #76d275 
  - `--cannabis-green-dark`: #00701a

- **Purple Palette**: Secondary/accent color representing relaxation
  - `--cannabis-purple`: #7b2cbf
  - `--cannabis-purple-light`: #ae52f4
  - `--cannabis-purple-dark`: #4a148c

- **Earth Tones**: Representing natural, earthy cannabis vibes
  - `--cannabis-earth`: #795548
  - `--cannabis-earth-light`: #a98274
  - `--cannabis-earth-dark`: #4b2c20

- **Gold Accent**: For highlights and accents
  - `--cannabis-gold`: #ffc107

### Semantic Colors

These are mapped to the cannabis colors but provide semantic meaning in the UI:

- `--accent-color`: Main brand/action color (green)
- `--accent-hover`: Hover state for main accent
- `--accent-secondary`: Secondary accent (purple)
- `--success-color`: Success states
- `--warning-color`: Warning states
- `--error-color`: Error states

## Typography

Typography is designed to be readable on all devices with an increasing scale for larger screens:

- **Font Family**: 'Inter', with system font fallbacks
- **Base Size**: 16px (1rem)
- **Scale**: Typography scales up proportionally on larger screens

### Heading Sizes (Mobile → Desktop)

- **H1**: 1.75rem → 2.5rem
- **H2**: 1.5rem → 2.25rem
- **H3**: 1.25rem → 1.75rem

## Spacing System

We use a consistent spacing scale throughout the application:

- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)

The page margin (`--page-margin`) adapts based on screen size:
- Mobile: 1rem
- Tablet: 1.5rem
- Desktop: 2rem+

## Components

### Buttons

We have three main button types:

1. **Primary**: Green, filled buttons for main actions
2. **Secondary**: Outlined buttons for secondary actions
3. **Tertiary**: Text buttons for less prominent actions

All buttons have accessible tap targets (min 44px height) on mobile.

### Cards

Cards are used for grouping related content:

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```

### Forms

Form elements are designed for ease of use on touch devices:

```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" />
</div>
```

## Responsive Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Using with Tailwind CSS

The theme system works with Tailwind through CSS variables. Use Tailwind classes for layout and spacing, combined with our theme classes for components.

### Example

```jsx
<button className="btn btn-primary">
  Click Me
</button>

// With Tailwind:
<button className="btn btn-primary mt-4 w-full md:w-auto">
  Click Me
</button>
```

## Mobile Navigation

The mobile navigation is toggled through a hamburger menu and animates in from the top. All navigation items are sized appropriately for touch interaction.

## Dark/Light Mode

The theme supports both dark and light modes. The default is dark mode, which is preferred by many cannabis users for evening sessions.

Toggle between modes using the sun/moon button in the header.

## Best Practices

1. **Always design for mobile first**
   - Start with mobile layout then enhance for larger screens
   - Use the responsive utility classes and media queries

2. **Maintain consistent spacing**
   - Use the spacing variables instead of custom values
   - Maintain rhythm with consistent spacing between elements

3. **Use the color system semantically**
   - Use accent colors for interactive elements
   - Maintain sufficient contrast for accessibility

4. **Optimize images**
   - Use appropriate sizes and formats
   - Consider lazy loading for non-critical images

5. **Keep tap targets large enough**
   - Minimum 44px height for interactive elements on mobile
   - Provide adequate spacing between interactive elements

6. **Test on real devices**
   - Test the app on various screen sizes and devices
   - Pay special attention to touch interactions

## Cannabis-Specific Considerations

1. **Relaxed, laid-back feel**
   - Smooth animations (not too fast)
   - Adequate whitespace
   - Readable typography

2. **Theming for night use**
   - Dark theme default is preferred
   - Not too bright or jarring
   - Reduced blue light when possible

3. **Simple interactions**
   - Don't overcomplicate the UI for users who may be in an altered state
   - Clear labels and instructions
   - Forgiving UI that prevents mistakes 