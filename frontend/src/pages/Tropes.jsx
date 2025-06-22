import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { isLoggedIn } from '../utils/auth';
import Button from '../components/Button';
import { withErrorBoundary } from '../components/ErrorBoundary';
import { Spinner } from '../components/LoadingAnimations';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatDate, safeString } from '../utils/formatters';

/**
 * Tropes page component
 * Search for movies by character tropes and browse available tropes
 */
const Tropes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tropeQuery, setTropeQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [allTropedMovies, setAllTropedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useDocumentTitle('Movie Tropes', true);

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/signin');
      return;
    }

    // Load all movies with tropes on component mount
    fetchAllTropedMovies();

    // If there's a query in URL, perform search
    const query = searchParams.get('q');
    if (query) {
      setTropeQuery(query);
      handleTropeSearch(query);
    }
  }, [navigate, searchParams]);

  // Fetch all movies that have tropes
  const fetchAllTropedMovies = async () => {
    try {
      const data = await api.tropes.getTropesFilter();
      setAllTropedMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching all troped movies:', err);
      // Don't show error for this background fetch
    }
  };

  // Search for movies with specific trope
  const handleTropeSearch = async (query = tropeQuery) => {
    if (!query.trim()) {
      setError('Please enter a character trope to search for.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await api.tropes.getMoviesWithTrope(query.trim());
      setSearchResults(Array.isArray(data) ? data : []);
      
      // Update URL
      setSearchParams({ q: query.trim() });
    } catch (err) {
      console.error('Error searching tropes:', err);
      if (err.status === 404) {
        setSearchResults([]);
        setError(`No movies found with the trope "${query}". Try a different character trope.`);
      } else if (err.status === 401 || err.status === 403) {
        navigate('/signin');
        return;
      } else {
        setError(err.message || 'Failed to search for movies with this trope. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleTropeSearch();
  };

  // Handle movie click
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  // Get unique tropes from all movies
  const getUniquetropes = () => {
    const tropesSet = new Set();
    allTropedMovies.forEach(movie => {
      if (movie.character_tropes) {
        // Split by common delimiters and clean up
        const tropes = movie.character_tropes
          .split(/[,;|]/)
          .map(trope => trope.trim())
          .filter(trope => trope.length > 0);
        tropes.forEach(trope => tropesSet.add(trope));
      }
    });
    return Array.from(tropesSet).sort();
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const uniqueTropes = getUniquetropes();

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Movie Character Tropes
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Search for movies by character tropes. Discover films featuring specific character archetypes and storytelling elements.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="trope-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by Character Trope
            </label>
            <input
              id="trope-search"
              type="text"
              value={tropeQuery}
              onChange={(e) => setTropeQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Hero, Villain, Mentor, Antihero..."
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !tropeQuery.trim()}
              className="px-8 py-3"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="white" />
                  Searching...
                </div>
              ) : (
                'Search Tropes'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Popular Tropes */}
      {uniqueTropes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Popular Character Tropes
          </h2>
          <div className="flex flex-wrap gap-2">
            {uniqueTropes.slice(0, 20).map((trope) => (
              <button
                key={trope}
                onClick={() => {
                  setTropeQuery(trope);
                  handleTropeSearch(trope);
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                {trope}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {searchResults.length > 0 
              ? `Movies with "${searchParams.get('q')}" trope (${searchResults.length})`
              : 'Search Results'
            }
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="xl" color="primary" />
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">
                  Searching for movies with this trope...
                </p>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {hasSearched ? 'No movies found' : 'Search for character tropes'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {hasSearched 
                  ? `Try searching for a different character trope or browse popular tropes above.`
                  : 'Enter a character trope to find movies featuring that archetype.'
                }
              </p>
              {hasSearched && (
                <Button variant="primary" onClick={() => navigate('/')}>
                  Discover Movies
                </Button>
              )}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {searchResults.map((movie) => (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  {/* Movie poster placeholder */}
                  <div className="relative pb-[150%] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4V2C7 1.45 7.45 1 8 1h8c.55 0 1 .45 1 1v2h5v2H2V4h5zM19 7H5l1.5 14c.1.9.9 1.6 1.8 1.6h7.4c.9 0 1.7-.7 1.8-1.6L19 7z" />
                      </svg>
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Movie info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2 mb-2">
                      {safeString(movie.original_title)}
                    </h3>
                    
                    {/* Character Tropes */}
                    {movie.character_tropes && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Character Tropes:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {movie.character_tropes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Browse all troped movies when no search */}
      {!hasSearched && allTropedMovies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Movies with Character Tropes ({allTropedMovies.length})
          </h2>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {allTropedMovies.slice(0, 20).map((movie) => (
              <motion.div
                key={movie.id}
                variants={itemVariants}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleMovieClick(movie.id)}
              >
                {/* Movie poster placeholder */}
                <div className="relative pb-[150%] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4V2C7 1.45 7.45 1 8 1h8c.55 0 1 .45 1 1v2h5v2H2V4h5zM19 7H5l1.5 14c.1.9.9 1.6 1.8 1.6h7.4c.9 0 1.7-.7 1.8-1.6L19 7z" />
                    </svg>
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Movie info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2 mb-2">
                    {safeString(movie.original_title)}
                  </h3>
                  
                  {/* Character Tropes */}
                  {movie.character_tropes && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Character Tropes:</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                        {movie.character_tropes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {allTropedMovies.length > 20 && (
            <div className="text-center mt-6">
              <p className="text-gray-500 dark:text-gray-400">
                Showing 20 of {allTropedMovies.length} movies. Use the search above to find specific tropes.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Export with error boundary
export default withErrorBoundary(Tropes);
