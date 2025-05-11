/**
 * API Client utility for making authenticated requests
 * Handles token management and refresh automatically
 */

// Base API URL
const API_BASE_URL = '';

// Get auth token from localStorage
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Handle refresh token logic
const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('token', data.token);
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Generic request function with authentication and retry logic
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure headers object exists
  const headers = options.headers || {};
  
  // Add auth header if token exists
  const token = getToken();
  if (token) {
    Object.assign(headers, {
      Authorization: `Bearer ${token}`,
    });
  }
  
  // Make the request with authorization header
  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies in requests
  });
  
  // If unauthorized (401), try refreshing token once
  if (response.status === 401) {
    const refreshed = await refreshToken();
    
    // If refresh worked, retry the original request with new token
    if (refreshed) {
      const newToken = getToken();
      const newHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: newHeaders,
        credentials: 'include',
      });
    }
  }
  
  // Parse JSON response
  const data = await response.json();
  
  // If still not successful, throw error
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data as T;
}

// HTTP method wrappers
export const api = {
  get: <T>(url: string, options: RequestInit = {}): Promise<T> => 
    apiRequest<T>(url, { ...options, method: 'GET' }),
    
  post: <T>(url: string, body: any, options: RequestInit = {}): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    }),
    
  put: <T>(url: string, body: any, options: RequestInit = {}): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    }),
    
  patch: <T>(url: string, body: any, options: RequestInit = {}): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    }),
    
  delete: <T>(url: string, options: RequestInit = {}): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
}; 