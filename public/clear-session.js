// This script clears sessionStorage when loaded
// It will be loaded on the client side when the server starts

(function() {
  try {
    // Clear sessionStorage to ensure users are logged out when server restarts
    sessionStorage.clear();
    console.log('Session storage cleared on server start');
  } catch (error) {
    console.error('Error clearing session storage:', error);
  }
})(); 