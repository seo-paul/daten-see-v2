// Application-wide Constants

export const APP_NAME = 'Daten See';
export const APP_DESCRIPTION = 'SaaS Analytics Dashboard with Google API integrations';
export const APP_VERSION = '0.1.0';

// URL Constants
export const APP_URLS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// API Constants
export const API_ROUTES = {
  AUTH: '/api/auth',
  DASHBOARDS: '/api/dashboards',
  WIDGETS: '/api/widgets',
  INTEGRATIONS: '/api/integrations',
  ANALYTICS: '/api/integrations/google-analytics',
  ADS: '/api/integrations/google-ads',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'daten-see-user',
  DASHBOARD_STATE: 'daten-see-dashboard-state',
  THEME: 'daten-see-theme',
  PREFERENCES: 'daten-see-preferences',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Performance Constants
export const PERFORMANCE = {
  WEB_VITALS_THRESHOLDS: {
    LCP_GOOD: 2500,
    LCP_POOR: 4000,
    FID_GOOD: 100,
    FID_POOR: 300,
    CLS_GOOD: 0.1,
    CLS_POOR: 0.25,
  },
  API_TIMEOUT: 10000, // 10 seconds
  DEBOUNCE_DELAY: 300, // 300ms
} as const;