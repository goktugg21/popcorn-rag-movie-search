/**
 * API client for backend services
 * Organized by resource type
 */

// Base API URL - adjust as needed for your environment
const API_URL = 'http://localhost:5000';

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
async function handleResponse(response) {
  // For successful responses that don't return JSON
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

// ==================== Auth API ====================

/**
 * Auth API functions for user authentication
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @returns {Promise<string>} - Success message
   */
  async register({ username, password }) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  /**
   * Login a user
   * @param {Object} userData - User login data
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @returns {Promise<string>} - Success message with set-cookie for token
   */
  async login({ username, password }) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important to include cookies
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  /**
   * Logout the current user
   * @returns {Promise<string>} - Success message
   */
  async logout() {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'GET',
      credentials: 'include', // Important to include cookies
    });
    return handleResponse(response);
  },

  /**
   * Delete user account
   * @param {Object} userData - User data for account deletion
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @returns {Promise<string>} - Success message
   */
  async deleteAccount({ username, password }) {
    const response = await fetch(`${API_URL}/delete_account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  }
};

// ==================== Movies API ====================

/**
 * @typedef {Object} Movie
 * @property {number} id - Movie ID
 * @property {string} imdb_id - IMDB ID
 * @property {string} original_title - Original movie title
 * @property {number} popularity - Popularity score
 * @property {string} overview - Movie overview/description
 * @property {string} release_date - Release date
 * @property {number} budget - Movie budget
 * @property {string[]} character_tropes - Character tropes
 * @property {number} revenue - Movie revenue
 * @property {string} cast - Movie cast
 * @property {string} homepage - Movie homepage URL
 * @property {string} director - Movie director
 * @property {string} tagline - Movie tagline
 * @property {string} keywords - Movie keywords
 * @property {number} runtime - Movie runtime in minutes
 * @property {string} genres - Movie genres
 * @property {number} vote_count - Number of votes
 * @property {number} vote_average - Average vote score
 * @property {number} release_year - Release year
 */

/**
 * Movies API functions for movie-related operations
 */
export const moviesApi = {
  /**
   * Get a movie by ID or IMDB ID
   * @param {Object} params - Query parameters
   * @param {number} [params.id] - Movie ID
   * @param {string} [params.imdb_id] - IMDB ID
   * @returns {Promise<Movie>} - Movie data
   */
  async getMovie({ id, imdb_id }) {
    const params = new URLSearchParams();
    if (id) params.append('id', id.toString());
    if (imdb_id) params.append('imdb_id', imdb_id);
    
    const response = await fetch(`${API_URL}/movie?${params}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Search for movies with various filters
   * @param {Object} filters - Search filters
   * @param {string} [filters.query] - Search query
   * @param {string[]} [filters.keyword] - Keywords to filter by
   * @param {string[]} [filters.genres] - Genres to filter by
   * @param {string[]} [filters.year] - Years to filter by
   * @param {string[]} [filters.director] - Directors to filter by
   * @param {number} [filters.rating] - Minimum rating
   * @returns {Promise<Movie[]>} - List of movies matching filters
   */
  async searchMovies({ query, keyword, genres, year, director, rating }) {
    const response = await fetch(`${API_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query,
        keyword,
        genres,
        year,
        director,
        rating
      }),
    });
    return handleResponse(response);
  },

  /**
   * Chat with AI to find movies
   * @param {string} query - The search query for the AI
   * @returns {Promise<{response: string, movie_ids: string[]}>} - AI response and found movie IDs
   */
  async aiSearch(query) {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query }),
    });
    return handleResponse(response);
  }
};

// ==================== Favorites API ====================

/**
 * Favorites API functions for managing user favorites
 */
export const favoritesApi = {
  /**
   * Add a movie to favorites
   * @param {number} movie_id - Movie ID to add to favorites
   * @returns {Promise<string>} - Success message
   */
  async addFavorite(movie_id) {
    const response = await fetch(`${API_URL}/add_favourite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ movie_id }),
    });
    return handleResponse(response);
  },

  /**
   * Remove a movie from favorites
   * @param {number} movie_id - Movie ID to remove from favorites
   * @returns {Promise<string>} - Success message
   */
  async deleteFavorite(movie_id) {
    const response = await fetch(`${API_URL}/delete_favourite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ movie_id }),
    });
    return handleResponse(response);
  }
};

// ==================== Tropes API ====================

/**
 * @typedef {Object} MovieWithTrope
 * @property {number} id - Movie ID
 * @property {string[]} character_tropes - Character tropes
 * @property {string} original_title - Original movie title
 */

/**
 * Tropes API functions for managing movie tropes
 */
export const tropesApi = {
  /**
   * Add a character trope to a movie
   * @param {string} user_trope - Character trope to add
   * @param {number} selected_movie_id - Movie ID to add trope to
   * @returns {Promise<string>} - Success message
   */
  async addTrope(user_trope, selected_movie_id) {
    const response = await fetch(`${API_URL}/add_trope`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_trope, selected_movie_id }),
    });
    return handleResponse(response);
  },

  /**
   * Get movies filtered by character tropes
   * @returns {Promise<MovieWithTrope[]>} - List of movies with tropes
   */
  async getTropesFilter() {
    const response = await fetch(`${API_URL}/trope_filter`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get movies with a specific character trope
   * @param {string} user_trope - Character trope to filter by
   * @returns {Promise<MovieWithTrope[]>} - List of movies with the specified trope
   */
  async getMoviesWithTrope(user_trope) {
    const response = await fetch(`${API_URL}/movies_with_trope`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_trope }),
    });
    return handleResponse(response);
  }
};

// Default export for convenience
export default {
  auth: authApi,
  movies: moviesApi,
  favorites: favoritesApi,
  tropes: tropesApi
};
