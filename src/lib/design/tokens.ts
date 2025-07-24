/**
 * DATEN-SEE Design System Tokens
 * Comprehensive design foundation extracted from logo and design reference
 */

export const designTokens = {
  // Brand Colors - DATEN-SEE Blue Hierarchy (harmonized for better contrast)
  colors: {
    brand: {
      primary: '#2F4F73',      // Primary Blue - NUR für Text/Icons, nie als Fläche
      shade1: '#4A6B8A',       // Blue Shade 1 - Readable text colors
      shade2: '#6B9AC4',       // Blue Shade 2 - Interactive elements (buttons, links)
      shade3: '#A4C5E1',       // Blue Shade 3 - Light accents
      shade4: '#E8F2F9',       // Blue Shade 4 - Very light backgrounds/hovers
    },
    
    // Semantic Colors (from design system)
    semantic: {
      success: '#457345',      // Success Green - positive actions
      warning: '#f59e0b',      // amber-500
      danger: '#ef4444',       // red-500
      info: '#2F4F73',         // Primary Blue for info
    },

    // Neutral Palette (from design reference analysis)
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

    // Beige & Warm Tones (from design system)
    beige: {
      light: '#F8F4ED',        // Hellstes Beige
      DEFAULT: '#F2E8CF',      // Standard Warm Background
      dark: '#E6D7B8',         // Dunkleres Beige für Kontrast
    },

    // Gray Palette (extended neutral grays)
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

    // Background & Surface (Stacked Beige System - mit Hex-Codes)
    surface: {
      page: '#FCF9F4',          // 20% beige - sehr hell
      primary: '#F9F4EA',       // 40% beige - erste Card-Ebene
      secondary: '#F6F0E0',     // 60% beige - zweite Card-Ebene
      tertiary: '#F3EBD6',      // 80% beige - dritte Card-Ebene
      elevated: '#F0E7CC',      // 90% beige - höchste Ebene
      warm: '#F2E8CF',          // 100% beige für Legacy-Support
      warmLight: '#F8F4ED',     // Helles Beige
      warmDark: '#E6D7B8',      // Dunkles Beige für Borders
      overlay: 'rgba(15, 23, 42, 0.8)',
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
      primary: '#e2e8f0',      // neutral-200
      secondary: '#cbd5e1',    // neutral-300
      focus: '#365c83',        // brand-primary
      error: '#ef4444',        // danger
    },

    // Interactive States (harmonized)
    interactive: {
      primary: '#6B9AC4',      // Medium blue for buttons/actions
      primaryHover: '#5A89B3',  // Darker on hover
      primaryActive: '#4A7BA2', // Even darker on active
      primaryDisabled: '#A4C5E1',
      
      secondary: '#ffffff',     // White background
      secondaryHover: '#fafbfc',// Very subtle hover
      secondaryActive: '#f8f9fa',// Light active state
      
      ghost: 'transparent',
      ghostHover: '#fafbfc',
      ghostActive: '#f8f9fa',
    },
  },

  // Typography System (based on assets/fonts)
  typography: {
    fontFamily: {
      display: ['Fjalla One', 'sans-serif'],    // From assets/fonts/fjalla-one.*
      body: ['Poppins', 'sans-serif'],          // From assets/fonts/poppins-*
      accent: ['Barlow', 'sans-serif'],         // From assets/fonts/barlow-*
      mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
    },

    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1' }],           // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
    },

    fontWeight: {
      light: '300',      // Barlow Light
      normal: '400',     // Poppins Regular
      medium: '500',
      semibold: '600',   // Poppins Semibold  
      bold: '700',
      extrabold: '800',
      black: '900',      // Fjalla One
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing Scale (consistent with design reference)
  spacing: {
    0: '0px',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // Border Radius (from design reference UI elements)
  borderRadius: {
    none: '0',
    sm: '0.125rem',     // 2px
    base: '0.25rem',    // 4px - default
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px - buttons in design
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    full: '9999px',
  },

  // Shadows (based on design reference elevation)
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  // Animation & Timing
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px - from design reference
        lg: '3rem',      // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.625rem 1rem',     // from design reference buttons
        lg: '0.75rem 1.5rem',
      },
    },
    
    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
    },
    
    header: {
      height: '4rem',              // 64px - from design reference
      logoHeight: '2rem',          // 32px
    },

    widget: {
      minHeight: '12rem',          // 192px - from design reference
      borderRadius: '0.5rem',      // 8px
      padding: '1.5rem',           // 24px
    },
  },
} as const;

// Type exports for better TypeScript support
export type DesignTokens = typeof designTokens;
export type BrandColors = keyof typeof designTokens.colors.brand;
export type SemanticColors = keyof typeof designTokens.colors.semantic;
export type NeutralColors = keyof typeof designTokens.colors.neutral;