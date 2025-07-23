import { appLogger } from '@/lib/monitoring/logger.config';
import type { ApiError, ApiResponse } from '@/types/api.types';
import { ApiErrorSchema } from '@/types/api.types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Custom Error Classes
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, status: number, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Request timeout');
    this.name = 'TimeoutError';
  }
}

// Request/Response Types
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Set authentication token
  public setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  public clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  // Request interceptor
  private async prepareRequest(config: RequestConfig): Promise<RequestConfig> {
    const requestId = Math.random().toString(36).substring(7);
    
    appLogger.debug('API request starting', {
      requestId,
      method: config.method,
      url: config.url,
      hasData: !!config.data,
    });

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...config.headers,
      'X-Request-ID': requestId,
    };

    return {
      ...config,
      headers,
      timeout: config.timeout || this.defaultTimeout,
    };
  }

  // Response interceptor
  private async handleResponse<T>(
    response: Response,
    requestId: string,
    startTime: number
  ): Promise<T> {
    const duration = Date.now() - startTime;

    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        const rawError = await response.json();
        errorData = ApiErrorSchema.parse(rawError);
      } catch {
        // Fallback for non-JSON error responses
        errorData = {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: response.statusText || 'Unknown error',
          },
          timestamp: new Date().toISOString(),
        };
      }

      appLogger.error('API request failed', {
        requestId,
        status: response.status,
        errorCode: errorData.error.code,
        errorMessage: errorData.error.message,
        duration,
      });

      throw new ApiClientError(
        errorData.error.message,
        response.status,
        errorData.error.code,
        errorData.error.details
      );
    }

    const data = await response.json();

    appLogger.debug('API request completed', {
      requestId,
      status: response.status,
      duration,
    });

    return data;
  }

  // Core request method
  private async request<T>(config: RequestConfig): Promise<T> {
    const startTime = Date.now();
    const preparedConfig = await this.prepareRequest(config);
    const requestId = preparedConfig.headers?.['X-Request-ID'] as string;

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), preparedConfig.timeout);

      const response = await fetch(`${this.baseURL}${preparedConfig.url}`, {
        method: preparedConfig.method,
        headers: preparedConfig.headers,
        body: preparedConfig.data ? JSON.stringify(preparedConfig.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await this.handleResponse<T>(response, requestId, startTime);
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          appLogger.error('API request timeout', { requestId, duration });
          throw new TimeoutError();
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          appLogger.error('API network error', { requestId, error: error.message, duration });
          throw new NetworkError('Network connection failed');
        }
      }

      // Re-throw API client errors
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Log unknown errors
      appLogger.error('API request unknown error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      });

      throw error;
    }
  }

  // HTTP Methods
  public async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', url, headers });
  }

  public async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, headers });
  }

  public async put<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, headers });
  }

  public async patch<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, headers });
  }

  public async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, headers });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types and errors
export type { RequestConfig };
export { ApiClient };