/**
 * DATEN-SEE Font Loading System
 * Optimized loading for custom fonts from assets/fonts/
 */

import localFont from 'next/font/local';

// Poppins Font Family (Body Text)
export const poppins = localFont({
  src: [
    {
      path: '../../../assets/fonts/poppins-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/poppins-semibold.woff2', 
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif'],
});

// Barlow Font Family (Accent Text)
export const barlow = localFont({
  src: [
    {
      path: '../../../assets/fonts/barlow-light.woff2',
      weight: '300', 
      style: 'normal',
    },
  ],
  variable: '--font-barlow',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif'],
});

// Fjalla One Font Family (Display/Headings)
export const fjallaOne = localFont({
  src: [
    {
      path: '../../../assets/fonts/fjalla-one.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-fjalla',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif'],
});

// Combined font class names for easy application
export const fontVariables = [
  poppins.variable,
  barlow.variable, 
  fjallaOne.variable,
].join(' ');

// Font utility functions
export const getFontClass = (font: 'body' | 'accent' | 'display'): string => {
  switch (font) {
    case 'body':
      return poppins.className;
    case 'accent':
      return barlow.className;
    case 'display':
      return fjallaOne.className;
    default:
      return poppins.className;
  }
};

// CSS Custom Properties for design system
export const fontCSSVariables = `
  :root {
    --font-body: ${poppins.style.fontFamily};
    --font-accent: ${barlow.style.fontFamily};
    --font-display: ${fjallaOne.style.fontFamily};
  }
`;

const fontConfig = {
  poppins,
  barlow,
  fjallaOne,
  fontVariables,
  getFontClass,
  fontCSSVariables,
};

export default fontConfig;