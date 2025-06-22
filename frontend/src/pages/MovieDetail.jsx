import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { isLoggedIn } from '../utils/auth';
import Button from '../components/Button';
import { withErrorBoundary } from '../components/ErrorBoundary';
import { DetailSkeleton } from '../components/Skeletons';
import { Spinner } from '../components/LoadingAnimations';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { 
  formatDate, 
  formatCurrency, 
  formatRuntime,
  parseList,
  safeString,
  safeNumber,
  safeArrayJoin
} from '../utils/formatters';

/**
 * Movie Detail page component
 * Displays detailed information about a movie
 */
const MovieDetail = () => {
  const { id } = useParams(); // Get movie ID from URL params
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showAddTropeModal, setShowAddTropeModal] = useState(false);
  const [newTrope, setNewTrope] = useState('');
  const [tropeLoading, setTropeLoading] = useState(false);
  
  // Dynamic document title based on movie title
  useDocumentTitle(movie ? movie.title : 'Movie Details', true);

  // Fetch movie details when component mounts
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        // Determine if we have an IMDB ID (starts with 'tt') or a numeric ID
        const params = id.startsWith('tt') ? { imdb_id: id } : { id: parseInt(id) };
        const data = await api.movies.getMovie(params);
        setMovie(data);
        
        // Check if movie is favorited after getting movie data
        if (isLoggedIn() && data?.id) {
          await checkIfFavorited(data.id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // Check favorite status when authentication status might change
  useEffect(() => {
    if (movie?.id && isLoggedIn()) {
      checkIfFavorited(movie.id);
    } else {
      setIsFavorited(false);
    }
  }, [movie?.id, isLoggedIn()]);

  // Check if the current movie is in user's favorites
  const checkIfFavorited = async (movieId) => {
    if (!isLoggedIn()) {
      setIsFavorited(false);
      return;
    }

    try {
      console.log('Checking if movie is favorited:', movieId);
      const favorites = await api.favorites.getFavorites();
      
      if (Array.isArray(favorites)) {
        const isFav = favorites.some(fav => 
          fav.id == movieId || fav.movie_id == movieId
        );
        console.log('Movie is favorited:', isFav);
        setIsFavorited(isFav);
      } else {
        setIsFavorited(false);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setIsFavorited(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle add/remove favorites
  const handleFavoriteToggle = async () => {
    if (!movie?.id) return;
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      navigate('/signin');
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        console.log('Removing from favorites:', movie.id);
        await api.favorites.deleteFavorite(movie.id);
        setIsFavorited(false);
      } else {
        console.log('Adding to favorites:', movie.id);
        await api.favorites.addFavorite(movie.id);
        setIsFavorited(true);
      }
      
      // Re-check favorite status to ensure consistency
      await checkIfFavorited(movie.id);
      
    } catch (err) {
      console.error('Error toggling favorite:', err);
      
      // If it's an auth error, redirect to login
      if (err.status === 401 || err.status === 403) {
        navigate('/signin');
        return;
      }
      
      // Show error to user
      setError(`Failed to ${isFavorited ? 'remove from' : 'add to'} favorites. Please try again.`);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle add trope
  const handleAddTrope = async () => {
    if (!newTrope.trim() || !movie?.id) return;

    // Check if user is logged in
    if (!isLoggedIn()) {
      navigate('/signin');
      return;
    }

    setTropeLoading(true);
    try {
      await api.tropes.addTrope(newTrope.trim(), movie.id);
      
      // Refresh movie data to show new trope
      const params = id.startsWith('tt') ? { imdb_id: id } : { id: parseInt(id) };
      const updatedMovie = await api.movies.getMovie(params);
      setMovie(updatedMovie);
      
      // Close modal and reset form
      setShowAddTropeModal(false);
      setNewTrope('');
      
    } catch (err) {
      console.error('Error adding trope:', err);
      
      if (err.status === 401 || err.status === 403) {
        navigate('/signin');
        return;
      }
      
      setError('Failed to add trope. Please try again.');
    } finally {
      setTropeLoading(false);
    }
  };

  // Handle close trope modal
  const handleCloseTropeModal = () => {
    setShowAddTropeModal(false);
    setNewTrope('');
    setError(null);
  };

  // Using utility functions from formatters.js instead of inline formatters

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      {/* Back button */}
      <div className="mb-6">
        <Button 
          variant="secondary" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" color="primary" />
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading movie details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <div className="text-red-600 dark:text-red-400 text-lg mb-2">Error Loading Movie</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button variant="primary" className="mt-2" onClick={handleBack}>
            Go Back
          </Button>
        </div>
      ) : movie ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          {/* Movie header with poster and basic info */}
          <div className="flex flex-col md:flex-row">
            {/* Poster */}
            <div className="md:w-1/3 lg:w-1/4">
              <div className="relative pb-[150%]">
                <img 
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path || ''}`}
                  alt={movie.original_title || 'Movie poster'}
                  className="absolute h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/500x750?text=No+Image';
                  }}
                />
              </div>
            </div>
            
            {/* Basic info */}
            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                    {movie.original_title}
                  </h1>
                  
                  <p className="mt-2 text-lg italic text-gray-600 dark:text-gray-300">
                    {movie.tagline ? `"${movie.tagline}"` : ""}
                  </p>
                </div>
                
                {movie.vote_average ? (
                  <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-full text-lg font-bold flex items-center">
                    <span className="mr-1">★</span> {movie.vote_average.toFixed(1)}
                    <span className="ml-1 text-sm font-normal">
                      ({safeNumber(movie.vote_count, 0)} votes)
                    </span>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-full text-lg font-bold flex items-center">
                    <span className="mr-1">★</span> N/A
                  </div>
                )}
              </div>
              
              {/* Movie metadata */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 dark:text-gray-400">Release Date</span>
                  <span className="font-medium text-gray-800 dark:text-white">{formatDate(movie.release_date)}</span>
                </div>
                
                {movie.runtime && (
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">Runtime</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                
                <div>
                  <span className="block text-gray-500 dark:text-gray-400">Director</span>
                  <span className="font-medium text-gray-800 dark:text-white">{safeString(movie.director)}</span>
                </div>
              </div>
              
              {/* Genres */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {movie.genres ? (
                    typeof movie.genres === 'string' ? 
                      parseList(movie.genres).map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {genre.trim()}
                        </span>
                      )) :
                      Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres.map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {genre}
                        </span>
                      )) : (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                          No genres listed
                        </span>
                      )
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                      No genres listed
                    </span>
                  )}
                </div>
              </div>
              
              {/* Overview */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Overview</h3>
                {movie.overview ? (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{movie.overview}</p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic">No overview available for this movie.</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional details */}
          <div className="px-6 md:px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cast */}
              {movie.cast && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Cast</h3>
                  <p className="text-gray-600 dark:text-gray-300">{movie.cast}</p>
                </div>
              )}
              
              {/* Financial info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financial</h3>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Budget:</span> {formatCurrency(movie.budget)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Revenue:</span> {formatCurrency(movie.revenue)}
                  </p>
                </div>
              </div>
              
              {/* Keywords or character tropes */}
              {(movie.keywords || movie.character_tropes) ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {movie.character_tropes ? 'Character Tropes' : 'Keywords'}
                    </h3>
                    {isLoggedIn() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddTropeModal(true)}
                        className="text-xs"
                      >
                        + Add Trope
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.character_tropes && Array.isArray(movie.character_tropes) ? 
                      movie.character_tropes.map((trope, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                        >
                          {trope}
                        </span>
                      )) : 
                      movie.keywords && typeof movie.keywords === 'string' && movie.keywords.split(',').map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
                        >
                          {keyword.trim()}
                        </span>
                      ))
                    }
                  </div>
                </div>
              ) : isLoggedIn() && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                        Character Tropes
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Be the first to add character tropes for this movie!
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddTropeModal(true)}
                      className="text-xs whitespace-nowrap"
                    >
                      + Add First Trope
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="px-6 md:px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              {movie.imdb_id && (
                <a 
                  href={`https://www.imdb.com/title/${movie.imdb_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md font-medium transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.27 0 .44-.023.488-.048.155-.084.233-.298.233-.663v-3.39c0-.36-.078-.575-.3-.65z" />
                    <path d="M22.416 0H1.62C.742 0 .032.698.032 1.56v20.88c0 .862.71 1.56 1.588 1.56h20.796c.877 0 1.588-.698 1.588-1.56V1.56c0-.862-.71-1.56-1.588-1.56zM7.7 15.975H5.09V8.03H7.7v7.945zm7.306-7.312c.51.286.775.687.775 1.273v5.22c0 .42-.13.748-.388.994-.259.246-.65.374-1.19.374-.425 0-.854-.118-1.266-.36v-1.392c.293.24.622.36.99.36.284 0 .425-.088.425-.265V12.9h-1.413v-1.476h1.413v-.893c-.155.061-.39.093-.683.093-.313 0-.573-.06-.806-.17-.233-.11-.437-.276-.605-.485-.168-.21-.3-.45-.395-.72-.096-.27-.145-.563-.145-.878 0-.6.21-1.082.621-1.444.413-.363.885-.545 1.414-.545.12 0 .266.008.436.023.168.016.32.034.46.057.137.023.25.048.34.08.89.03.158.048.202.057v1.37c-.226-.143-.493-.215-.8-.215-.242 0-.418.068-.526.207-.109.139-.162.329-.162.567 0 .27.058.496.17.675.114.18.3.27.563.27.222 0 .4-.047.54-.14.139-.93.226-.208.262-.343v-.63zm4.882 7.258a1.962 1.962 0 0 1-.741.516 2.897 2.897 0 0 1-.916.14c-.34 0-.643-.054-.913-.17a1.661 1.661 0 0 1-.627-.425 1.591 1.591 0 0 1-.358-.625 2.418 2.418 0 0 1-.116-.745c0-.588.148-1.04.44-1.355.294-.316.69-.472 1.182-.472.094 0 .22.008.384.026.16.018.33.064.507.14v-.516c0-.227-.008-.418-.026-.57a.834.834 0 0 0-.145-.37.607.607 0 0 0-.335-.195c-.15-.033-.34-.05-.572-.05-.133 0-.288.014-.468.042-.18.029-.368.069-.562.12v-1.41c.18-.043.393-.08.64-.113.25-.033.51-.05.79-.05.407 0 .757.052 1.053.159.296.106.536.26.72.46.185.201.32.45.407.745.86.296.13.634.13 1.016v3.691h-1.413l.019-.92z" />
                  </svg>
                  View on IMDb
                </a>
              )}
              
              {movie.homepage && (
                <a 
                  href={movie.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Official Website
                </a>
              )}
              
              <Button 
                variant="primary" 
                className={`inline-flex items-center gap-2 transition-all duration-200 ${
                  isFavorited 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                    : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20'
                }`}
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <Spinner size="sm" color={isFavorited ? "white" : "primary"} />
                ) : (
                  <svg 
                    className={`w-5 h-5 transition-colors ${
                      isFavorited ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                    }`} 
                    fill={isFavorited ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                )}
                {!isLoggedIn() 
                  ? 'Sign in to Add to Favorites' 
                  : isFavorited 
                    ? 'Remove from Favorites' 
                    : 'Add to Favorites'
                }
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-yellow-600 dark:text-yellow-400">Movie not found</p>
          <Button variant="primary" className="mt-4" onClick={handleBack}>
            Go Back
          </Button>
        </div>
      )}

      {/* Add Trope Modal */}
      {showAddTropeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add Character Trope
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Add a character trope to "{movie?.original_title}"
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Character Trope:
              </label>
              <input
                type="text"
                value={newTrope}
                onChange={(e) => setNewTrope(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Hero, Villain, Mentor, Antihero..."
                disabled={tropeLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !tropeLoading && newTrope.trim()) {
                    handleAddTrope();
                  }
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a character archetype or storytelling element
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseTropeModal}
                disabled={tropeLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddTrope}
                disabled={tropeLoading || !newTrope.trim()}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {tropeLoading ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Adding...
                  </>
                ) : (
                  'Add Trope'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// Export with error boundary
export default withErrorBoundary(MovieDetail);
