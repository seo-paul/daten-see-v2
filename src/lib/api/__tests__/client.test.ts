/**
 * API Client Unit Tests - Streamlined
 * Testing core API client functionality only (Reduced from 97 → 20 tests)
 */

import { appLogger } from '@/lib/monitoring/logger.config';

import { apiClient, ApiClient, ApiClientError, NetworkError, TimeoutError } from '../client';

// Mock logger
jest.mock('@/lib/monitoring/logger.config', () => ({
  appLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  let client: ApiClient;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiClient('http://localhost:3001/api');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Constructor test
  it('should initialize with correct defaults', () => {
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(ApiClient);
  });

  // GET request test
  it('should make successful GET request', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response);

    const result = await client.get('/test');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockData);
  });

  // POST request test
  it('should make successful POST request with data', async () => {
    const postData = { name: 'Test Item' };
    const responseData = { id: 1, ...postData };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => responseData,
    } as Response);

    const result = await client.post('/test', postData);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
      })
    );
    expect(result).toEqual(responseData);
  });

  // PUT request test
  it('should make successful PUT request', async () => {
    const putData = { id: 1, name: 'Updated' };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => putData,
    } as Response);

    const result = await client.put('/test/1', putData);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test/1',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(result).toEqual(putData);
  });

  // DELETE request test
  it('should make successful DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    } as Response);

    await client.delete('/test/1');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // Authentication token test
  it('should include auth token in requests', async () => {
    client.setAuthToken('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.get('/protected');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/protected',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });

  // Clear auth token test
  it('should clear auth token from requests', async () => {
    client.setAuthToken('test-token');
    client.clearAuthToken();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.get('/test');
    
    const callArgs = mockFetch.mock.calls[0]?.[1];
    expect(callArgs?.headers).not.toHaveProperty('Authorization');
  });

  // 404 error handling test
  it('should handle 404 errors correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
    } as Response);

    await expect(client.get('/nonexistent')).rejects.toThrow(ApiClientError);
  });

  // Network error test
  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(client.get('/test')).rejects.toThrow(NetworkError);
  });

  // Timeout error test
  it('should handle timeout errors', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(resolve, 10000))
    );

    const shortTimeoutClient = new ApiClient('http://localhost:3001/api', 100);
    
    await expect(shortTimeoutClient.get('/test')).rejects.toThrow(TimeoutError);
  });

  // Custom headers test
  it('should accept custom headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.get('/test', { 'X-Custom-Header': 'custom-value' });
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'custom-value',
        }),
      })
    );
  });

  // JSON response parsing test
  it('should parse JSON responses correctly', async () => {
    const responseData = { message: 'success', data: [1, 2, 3] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => responseData,
    } as Response);

    const result = await client.get('/test');
    expect(result).toEqual(responseData);
  });

  // Error response parsing test
  it('should parse error responses with details', async () => {
    const errorResponse = { 
      message: 'Validation failed', 
      errors: { name: 'Required field' } 
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => errorResponse,
    } as Response);

    try {
      await client.post('/test', {});
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect((error as ApiClientError).message).toBe('Validation failed');
      expect((error as ApiClientError).details).toEqual(errorResponse.errors);
    }
  });

  // Content-Type header test
  it('should set correct Content-Type for JSON requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.post('/test', { data: 'test' });
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  // Empty response handling test
  it('should handle empty responses correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as Response);

    const result = await client.delete('/test/1');
    expect(result).toBeNull();
  });

  // Base URL handling test
  it('should construct URLs correctly with base URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.get('/endpoint');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/endpoint',
      expect.any(Object)
    );
  });

  // Query parameters test
  it('should handle query parameters in URLs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.get('/test?param1=value1&param2=value2');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test?param1=value1&param2=value2',
      expect.any(Object)
    );
  });

  // Logging test
  it('should log requests and responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    } as Response);

    await client.get('/test');
    
    expect(appLogger.debug).toHaveBeenCalled();
  });

  // Singleton instance test
  it('should provide singleton instance', () => {
    expect(apiClient).toBeInstanceOf(ApiClient);
  });

  // Error code mapping test
  it('should map HTTP status codes to appropriate errors', async () => {
    const testCases = [
      { status: 401, errorType: ApiClientError },
      { status: 403, errorType: ApiClientError },
      { status: 500, errorType: ApiClientError },
    ];

    for (const testCase of testCases) {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: testCase.status,
        statusText: 'Error',
        json: async () => ({ message: 'Error' }),
      } as Response);

      await expect(client.get('/test')).rejects.toThrow(testCase.errorType);
    }
  });
});