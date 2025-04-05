/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cannabis-themed colors
        cannabis: {
          green: {
            DEFAULT: "var(--cannabis-green)",
            light: "var(--cannabis-green-light)",
            dark: "var(--cannabis-green-dark)",
          },
          purple: {
            DEFAULT: "var(--cannabis-purple)",
            light: "var(--cannabis-purple-light)",
            dark: "var(--cannabis-purple-dark)",
          },
          earth: {
            DEFAULT: "var(--cannabis-earth)",
            light: "var(--cannabis-earth-light)",
            dark: "var(--cannabis-earth-dark)",
          },
          gold: "var(--cannabis-gold)",
        },
        // Theme UI colors
        background: "var(--bg-primary)",
        "background-secondary": "var(--bg-secondary)",
        foreground: "var(--text-primary)",
        "foreground-secondary": "var(--text-secondary)",
        accent: {
          DEFAULT: "var(--accent-color)",
          hover: "var(--accent-hover)",
          secondary: "var(--accent-secondary)",
        },
        card: "var(--card-bg)",
        border: "var(--border-color)",
        input: "var(--input-bg)",
        success: "var(--success-color)",
        warning: "var(--warning-color)",
        error: "var(--error-color)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        DEFAULT: "var(--transition-normal)",
        slow: "var(--transition-slow)",
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      height: {
        header: "var(--header-height)",
      },
      maxWidth: {
        content: "var(--max-content-width)",
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}; 