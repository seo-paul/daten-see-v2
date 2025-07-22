// API-related TypeScript Types

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  headers: Record<string, string>;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ApiError {
  status: number;
  statusText: string;
  data: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

// HTTP Status Code Types
export type HttpStatusCode = 
  | 200 | 201 | 204 // Success
  | 400 | 401 | 403 | 404 | 409 | 422 // Client Errors  
  | 500 | 502 | 503 | 504; // Server Errors

// Google APIs Types (will be expanded in later phases)
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GoogleApiCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
}