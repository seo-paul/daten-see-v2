/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // DATEN-SEE Brand Colors (from logo.svg)
      colors: {
        // DATEN-SEE Primary Color Scale (harmonized for better contrast)
        primary: {
          50: '#f8fafc',
          100: '#E8F2F9',  // Very light blue for backgrounds
          200: '#d1e7f0',
          300: '#A4C5E1',  // Light accents
          400: '#8bb3d6',
          500: '#6B9AC4',  // Main interactive color
          600: '#5A89B3',  // Hover states
          700: '#4A7BA2',  // Active states
          800: '#4A6B8A',  // Readable text colors
          900: '#2F4F73',  // Dark blue - only for text/icons
        },

        // Brand Colors (legacy support)
        brand: {
          primary: '#2F4F73',
          shade1: '#365C83', 
          shade2: '#3D6992',
          shade3: '#4375A2',
          shade4: '#4A82B1',
        },
        
        // Semantic Colors (from design system)
        success: '#457345',  // Success Green
        warning: '#f59e0b', 
        danger: '#ef4444',
        info: '#2F4F73',     // Primary Blue

        // Enhanced Neutral Palette
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',  
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },

        // Surface Colors (Stacked Beige System - mit Hex-Codes)
        surface: {
          page: '#FCF9F4',          // 20% beige - sehr hell
          primary: '#F9F4EA',       // 40% beige - erste Card-Ebene
          secondary: '#F6F0E0',     // 60% beige - zweite Card-Ebene
          tertiary: '#F3EBD6',      // 80% beige - dritte Card-Ebene
          elevated: '#F0E7CC',      // 90% beige - höchste Ebene
          warm: '#F2E8CF',          // 100% beige (legacy)
          'warm-light': '#F8F4ED',  // Helles Beige
          'warm-dark': '#E6D7B8',   // Dunkles Beige für Borders
        },

        // Beige & Warm Tones
        beige: {
          light: '#F8F4ED',
          DEFAULT: '#F2E8CF',
          dark: '#E6D7B8',
        },

        // Extended Gray Palette
        gray: {
          50: '#fafafa',
          100: '#f5f5f5', 
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },

        // Text Colors (Consistent gray system)
        text: {
          primary: '#3d3d3d',      // Alle Überschriften und Haupttext
          secondary: '#3d3d3d',    // Alle Texte in gleichem Grau
          tertiary: '#3d3d3d',     // Konsistenter Grauton überall
          disabled: '#A4B5C6',     // Nur disabled anders
          inverse: '#ffffff',      // Weißer Text auf dunklem Hintergrund
          brand: '#3d3d3d',        // Brand text auch in Grau
        },

        // Border Colors  
        border: {
          primary: '#e2e8f0',
          secondary: '#cbd5e1',
          focus: '#365c83',
          error: '#ef4444',
        },

        // Interactive States
        interactive: {
          primary: '#365c83',
          'primary-hover': '#2d4a6b',
          'primary-active': '#243a54',
          'primary-disabled': '#94a3b8',
          secondary: '#f1f5f9',
          'secondary-hover': '#e2e8f0',
          'secondary-active': '#cbd5e1',
          ghost: 'transparent',
          'ghost-hover': '#f1f5f9',
          'ghost-active': '#e2e8f0',
        },

        // Legacy support
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },

      // Typography (from assets/fonts/)
      fontFamily: {
        display: ['Fjalla One', 'sans-serif'],    // From assets/fonts/fjalla-one.*
        body: ['Poppins', 'sans-serif'],          // From assets/fonts/poppins-*
        accent: ['Barlow', 'sans-serif'],         // From assets/fonts/barlow-*
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
        
        // Legacy support
        poppins: ['Poppins', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
        fjalla: ['Fjalla One', 'sans-serif'],
      },

      // Enhanced Font Sizes
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // Box Shadows (design reference elevation)
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },

      // Animation Durations
      transitionDuration: {
        '150': '150ms',
        '200': '200ms', 
        '300': '300ms',
        '500': '500ms',
      },

      // Component-specific sizing
      height: {
        'header': '4rem',           // 64px header height
        'button-sm': '2rem',        // 32px
        'button-md': '2.5rem',      // 40px 
        'button-lg': '3rem',        // 48px
        'input-sm': '2rem',
        'input-md': '2.5rem',
        'input-lg': '3rem',
        'widget-min': '12rem',      // 192px minimum widget height
      },

      // Spacing for widgets and layouts
      spacing: {
        'widget': '1.5rem',         // 24px widget padding
        'header-logo': '2rem',      // 32px logo height
      },
    },
  },
  plugins: [],
};