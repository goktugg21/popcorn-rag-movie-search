/**
 * Higher-order function to create an API client with consistent error handling
 * and response processing for backend services
 */

// Base API URL - adjust as needed for your environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Generic API error class
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {any} data - Additional error data
   */
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handle API response
 * @param {Response} response - Fetch Response object
 * @returns {Promise<any>} - Parsed response data
 * @throws {ApiError} - If response is not ok
 */
export async function handleResponse(response) {
  // Handle no-content responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  // Try to parse JSON response
  let data;
  try {
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // For non-JSON responses (like plain text)
      data = await response.text();
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new ApiError('Failed to parse response', response.status);
  }

  // Handle error responses
  if (!response.ok) {
    throw new ApiError(
      typeof data === 'string' ? data : 'API request failed',
      response.status,
      data
    );
  }

  return data;
}

/**
 * Creates an API client factory that automatically applies error handling
 * and response parsing
 * 
 * @param {string} baseUrl - Base API URL
 * @returns {Object} - API client factory methods
 */
export function createApiClient(baseUrl = API_URL) {
  /**
   * Make a fetch request with standardized error handling
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - Parsed response data
   */
  async function fetchWithErrorHandling(endpoint, options = {}) {
    // Add credentials to include cookies by default
    const fetchOptions = {
      credentials: 'include',
      ...options,
    };
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);
      return handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Network errors, etc.
      console.error('Fetch error:', error);
      throw new ApiError(
        'Network error. Please check your connection.',
        0,
        error
      );
    }
  }

  return {
    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint path
     * @param {Object} [options] - Additional fetch options
     * @returns {Promise<any>} - Response data
     */
    get: (endpoint, options = {}) => {
      return fetchWithErrorHandling(endpoint, {
        method: 'GET',
        ...options,
      });
    },

    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint path
     * @param {Object} data - Request body data
     * @param {Object} [options] - Additional fetch options
     * @returns {Promise<any>} - Response data
     */
    post: (endpoint, data, options = {}) => {
      return fetchWithErrorHandling(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    },

    /**
     * Make a PUT request
     * @param {string} endpoint - API endpoint path
     * @param {Object} data - Request body data
     * @param {Object} [options] - Additional fetch options
     * @returns {Promise<any>} - Response data
     */
    put: (endpoint, data, options = {}) => {
      return fetchWithErrorHandling(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    },

    /**
     * Make a DELETE request
     * @param {string} endpoint - API endpoint path
     * @param {Object} [options] - Additional fetch options
     * @returns {Promise<any>} - Response data
     */
    delete: (endpoint, options = {}) => {
      return fetchWithErrorHandling(endpoint, {
        method: 'DELETE',
        ...options,
      });
    },

    /**
     * Make a GET request with body (non-standard but sometimes needed)
     * @param {string} endpoint - API endpoint path
     * @param {Object} data - Request body data
     * @param {Object} [options] - Additional fetch options
     * @returns {Promise<any>} - Response data
     */
    getWithBody: (endpoint, data, options = {}) => {
      return fetchWithErrorHandling(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    }
  };
}

export default createApiClient();
