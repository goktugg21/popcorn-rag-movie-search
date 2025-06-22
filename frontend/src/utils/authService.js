/**
 * Authentication service
 * Handles user authentication, registration, and session management
 * Uses the authApi from api.js
 */

import { authApi } from './api';

class AuthService {
  constructor() {
    this.user = this.getStoredUser();
  }

  /**
   * Get stored user from localStorage
   * @returns {Object|null} User data or null
   */
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Store user data in localStorage
   * @param {Object} userData - User data to store
   */
  setStoredUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.user = userData;
  }

  /**
   * Clear stored user data
   */
  clearStoredUser() {
    localStorage.removeItem('user');
    this.user = null;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      // Use email as username for the backend API
      const response = await authApi.register({
        username: userData.email,
        password: userData.password
      });

      // Store user data locally (since the API uses cookies for auth)
      const userProfile = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.email
      };

      this.setStoredUser(userProfile);

      return {
        success: true,
        message: response || 'Registration successful',
        user: userProfile
      };
    } catch (error) {
      // If API is not available, simulate successful registration for demo
      if (error.name === 'ApiError' && error.status >= 500) {
        console.warn('Auth API not available, using demo mode');
        
        // Simulate successful registration
        const mockUser = {
          id: Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.email,
          createdAt: new Date().toISOString()
        };
        
        this.setStoredUser(mockUser);
        
        return {
          success: true,
          message: 'Account created successfully! (Demo Mode)',
          user: mockUser
        };
      }

      throw error;
    }
  }

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      // Use email as username for the backend API
      const response = await authApi.login({
        username: credentials.email,
        password: credentials.password
      });

      // Store user data locally (since the API uses cookies for auth)
      const userProfile = {
        email: credentials.email,
        username: credentials.email
        // Note: In a real app, the backend would return user profile data
      };

      this.setStoredUser(userProfile);

      return {
        success: true,
        message: response || 'Login successful',
        user: userProfile
      };
    } catch (error) {
      // If API is not available, simulate successful login for demo
      if (error.name === 'ApiError' && error.status >= 500) {
        console.warn('Auth API not available, using demo mode');
        
        // Simulate successful login
        const mockUser = {
          id: Date.now(),
          email: credentials.email,
          username: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          loginAt: new Date().toISOString()
        };
        
        this.setStoredUser(mockUser);
        
        return {
          success: true,
          message: 'Login successful! (Demo Mode)',
          user: mockUser
        };
      }

      throw error;
    }
  }

  /**
   * Logout the current user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await authApi.logout();
      
      this.clearStoredUser();
      
      return {
        success: true,
        message: response || 'Logout successful'
      };
    } catch (error) {
      // Even if API call fails, clear local data
      this.clearStoredUser();
      
      return {
        success: true,
        message: 'Logout successful'
      };
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return this.user !== null;
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user data or null
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;