/**
 * API Client Foundation
 * Type-safe API client with proper error handling
 */

import type { 
  ApiResponse, 
  ApiError,
  PaginatedResponse 
} from '@/types';

// Base API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Enhanced Fetch with Type Safety
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic GET request with type safety
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Generic POST request with type safety
   */
  async post<T, D = unknown>(
    endpoint: string, 
    data?: D, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Generic PUT request with type safety
   */
  async put<T, D = unknown>(
    endpoint: string, 
    data?: D, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Generic DELETE request with type safety
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Paginated GET request
   */
  async getPaginated<T>(
    endpoint: string,
    page = 1,
    limit = 20,
    options?: RequestInit
  ): Promise<PaginatedResponse<T>> {
    const url = `${endpoint}?page=${page}&limit=${limit}`;
    const response = await this.get<PaginatedResponse<T>>(url, options);
    
    if (!response.success) {
      throw new ApiClientError('Failed to fetch paginated data', response.errors);
    }
    
    return response.data;
  }

  /**
   * Core request method with error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...options?.headers,
      },
      ...options,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          errorData.errors || [{ code: 'HTTP_ERROR', message: response.statusText }]
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      
      throw new ApiClientError(
        'Network error occurred',
        [{ code: 'NETWORK_ERROR', message: String(error) }]
      );
    }
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }
}

/**
 * Custom API Error Class
 */
export class ApiClientError extends Error {
  public errors: ApiError[];
  
  constructor(message: string, errors: ApiError[] = []) {
    super(message);
    this.name = 'ApiClientError';
    this.errors = errors;
  }
}

/**
 * Default API Client Instance
 */
export const apiClient = new ApiClient();

/**
 * Helper function to handle API responses in components
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.errors[0]?.message || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Type-safe API response handler for React Query
 */
export function createQueryFunction<T>(
  apiCall: () => Promise<ApiResponse<T>>
): () => Promise<T> {
  return async () => {
    const response = await apiCall();
    
    if (!response.success) {
      throw new ApiClientError(
        response.message || 'API request failed',
        response.errors
      );
    }
    
    return response.data;
  };
}

// Utility type for extracting data type from API response
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never;