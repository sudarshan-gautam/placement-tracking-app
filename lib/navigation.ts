/**
 * Navigation utility for handling transitions between different layouts
 * This helps prevent blank screens when navigating between route groups
 */

/**
 * Navigate to a URL with a full page reload
 * Use this for navigating between different layout groups
 * @param url The URL to navigate to
 */
export function navigateWithReload(url: string): void {
  // Small delay to ensure proper cleanup before navigation
  setTimeout(() => {
    window.location.href = url;
  }, 10);
}

/**
 * Navigate to the home page with a full page reload
 * This is specifically for the "Back to home" functionality
 */
export function navigateToHome(): void {
  navigateWithReload('/');
}

/**
 * Navigate to the dashboard with a full page reload
 */
export function navigateToDashboard(): void {
  navigateWithReload('/dashboard');
}

/**
 * Navigate to the sign-in page with a full page reload
 */
export function navigateToSignIn(): void {
  navigateWithReload('/auth/signin');
}

/**
 * Navigate to the sign-up page with a full page reload
 */
export function navigateToSignUp(): void {
  navigateWithReload('/auth/signup');
}

// Add basePath to all navigation links
export function getSubdirectoryPath(path: string): string {
  // If path already includes basePath, or it's an external link, return as is
  if (path.startsWith('http') || path.startsWith('/practitionerpassport')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/practitionerpassport${normalizedPath}`;
}

// Use this function when redirecting or navigating
export function getNavigationPath(path: string): string {
  return getSubdirectoryPath(path);
} 