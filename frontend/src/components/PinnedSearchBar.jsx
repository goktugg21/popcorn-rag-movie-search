import React, { useState } from 'react';
import SearchBar from './SearchBar';
import api from '../utils/api';

/**
 * Advanced search bar component that is pinned to the top of the page
 */
const PinnedSearchBar = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle regular search with filters
   * @param {Object} searchData - Search data including query and filters
   */
  const handleSearch = async (searchData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract filters in the format expected by the API
      const { query, filters } = searchData;
      const { genre, year, rating, director } = filters;
      
      // Convert filters to arrays as expected by the backend
      const genres = genre ? [genre] : undefined;
      const years = year ? [year] : undefined;
      const directors = director ? [director] : undefined;
      
      // Call the search API
      const results = await api.movies.searchMovies({
        query,
        genres,
        year: years,
        director: directors,
        rating: rating ? parseFloat(rating) : undefined
      });
      
      setSearchResults({
        query,
        results: Array.isArray(results) ? results : [] // Ensure results is an array
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search movies. Please try again.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle AI search
   * @param {string} query - AI search query
   */
  const handleAiSearch = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the AI search API
      const { response, movie_ids } = await api.movies.aiSearch(query);
      
      // If we have movie IDs, fetch the movie details
      let movieResults = [];
      if (Array.isArray(movie_ids) && movie_ids.length > 0) {
        // For simplicity, we'll just use the first few movie IDs
        const moviesToFetch = movie_ids.slice(0, 5);
        
        // Fetch movie details in parallel
        const moviePromises = moviesToFetch.map(imdb_id => 
          api.movies.getMovie({ imdb_id }).catch(err => {
            console.error(`Error fetching movie ${imdb_id}:`, err);
            return null;
          })
        );
        
        // Wait for all movie details to be fetched
        const movies = await Promise.all(moviePromises);
        movieResults = movies.filter(movie => movie !== null);
      }
      
      setSearchResults({
        query,
        aiResponse: response,
        results: movieResults
      });
    } catch (error) {
      console.error('AI Search error:', error);
      setError('Failed to perform AI search. Please try again.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <SearchBar onSearch={handleSearch} onAiSearch={handleAiSearch} />
          
          {/* Loading indicator */}
          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
            </div>
          )}
          
          {/* Error message */}
          {!loading && error && (
            <div className="mt-4 w-full max-w-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {/* Search results preview */}
          {!loading && !error && searchResults && (
            <div className="mt-4 w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2">
                {searchResults.aiResponse 
                  ? 'AI Search Results' 
                  : `Results for "${searchResults.query}"`}
              </h2>
              
              {searchResults.aiResponse && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  {searchResults.aiResponse}
                </p>
              )}
              
              {searchResults.results.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.results.map((movie) => (
                    <li key={movie.id || movie.imdb_id} className="py-2">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {movie.title || movie.original_title}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {movie.release_date && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(movie.release_date).getFullYear()}
                              </p>
                            )}
                            {movie.vote_average && (
                              <p className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                                ★ {movie.vote_average.toFixed(1)}
                              </p>
                            )}
                            {movie.genres && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {typeof movie.genres === 'string' 
                                  ? movie.genres.split(',')[0]
                                  : Array.isArray(movie.genres) 
                                    ? movie.genres[0]
                                    : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No results found. Try adjusting your search terms.
                </p>
              )}
              
              {searchResults.results.length > 0 && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-sm text-primary-dark dark:text-primary-light hover:underline"
                  >
                    View all results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedSearchBar;
