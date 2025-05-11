// Centralized JWT configuration
// This ensures we use the same JWT secret across the entire application

// Set a standard JWT_SECRET for the application
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_for_development_only';

// JWT token expiration time (24 hours)
export const JWT_EXPIRES_IN = '24h';

// JWT cookie options
export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 86400 // 24 hours in seconds
}; 