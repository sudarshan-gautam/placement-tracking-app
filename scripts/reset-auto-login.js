// This script can be used to reset any auto-login behavior in the browser
// It needs to be run in the browser console

function resetAutoLogin() {
  console.log('Resetting auto-login behavior...');
  
  // Remove user data
  localStorage.removeItem('user');
  localStorage.removeItem('original_user');
  localStorage.removeItem('is_temporary_user');
  
  // Set the flag to disable auto-login in sessionStorage (will be cleared when browser is closed)
  sessionStorage.setItem('manually_logged_out', 'true');
  
  // Clear any session cookies
  document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  console.log('Auto-login has been disabled for this session');
  console.log('You may need to refresh the page for changes to take effect');
}

// If running in Node.js environment, just log a message
if (typeof window === 'undefined') {
  console.log('This script needs to be run in a browser environment.');
  console.log('Copy this code and run it in your browser console to reset auto-login behavior.');
} else {
  // If in browser, execute the function
  resetAutoLogin();
}

// Export for module usage if needed
if (typeof module !== 'undefined') {
  module.exports = { resetAutoLogin };
} 