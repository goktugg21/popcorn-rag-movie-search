/**
 * Authentication utility functions using localStorage
 */

/**
 * Check if user is logged in by checking localStorage
 * @returns {boolean} - True if user is logged in
 */
export const isLoggedIn = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  console.log('Checking auth status from localStorage:', isAuthenticated);
  return isAuthenticated;
};

/**
 * Set user as logged in
 */
export const setLoggedIn = () => {
  console.log('Setting user as logged in');
  localStorage.setItem('isAuthenticated', 'true');
};

/**
 * Get username from localStorage
 * @returns {string|null} - Username or null if not found
 */
export const getUsername = () => {
  return localStorage.getItem('username');
};

/**
 * Get full email from localStorage
 * @returns {string|null} - Full email or null if not found
 */
export const getEmail = () => {
  return localStorage.getItem('email');
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  console.log('Clearing authentication data...');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  console.log('Auth data cleared');
};

/**
 * Set authentication data
 * @param {string} username - Username to store (display name)
 * @param {string} email - Full email address to store
 */
export const setAuthData = (username, email) => {
  console.log('Setting auth data for user:', username, 'email:', email);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('username', username);
  localStorage.setItem('email', email);
};

/**
 * Debug function to log all auth information
 */
export const debugAuth = () => {
  console.log('=== AUTH DEBUG INFO ===');
  console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
  console.log('username:', localStorage.getItem('username'));
  console.log('email:', localStorage.getItem('email'));
  console.log('isLoggedIn():', isLoggedIn());
  console.log('======================');
};
