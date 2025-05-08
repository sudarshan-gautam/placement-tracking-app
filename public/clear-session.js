// This script clears sessionStorage when loaded
// It will be loaded on the client side when the server starts

(function() {
  try {
    // Check if we already have an active user session
    const hasActiveUser = localStorage.getItem('user') !== null;
    
    // Get current URL to check if we're on a protected route
    const currentPath = window.location.pathname;
    const isProtectedRoute = 
      currentPath.startsWith('/admin') || 
      currentPath.startsWith('/dashboard') || 
      currentPath.startsWith('/mentor') ||
      currentPath.startsWith('/profile');
    
    // If we have an active user, don't clear their session on reload
    if (hasActiveUser) {
      console.log('Active user session detected, maintaining session state');
      
      // Still set server restart flag for tracking
      localStorage.setItem('server_restarted', 'true');
      return; // Don't clear session for active users
    }
    
    // Check if we're accessing a protected route directly without a user
    if (isProtectedRoute && !hasActiveUser) {
      console.log('Direct access to protected route detected, enforcing login requirement');
      sessionStorage.setItem('require_login', 'true');
      localStorage.setItem('require_login', 'true');
    }
    
    // Clear sessionStorage to ensure users are logged out when server restarts
    // This ensures server restarts don't maintain sessions (security feature)
    sessionStorage.clear();
    
    // Set flag to prevent auto-login after server restart
    localStorage.setItem('server_restarted', 'true');
    
    console.log('Session storage and security flags updated on server start');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
})(); 