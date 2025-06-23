import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { isLoggedIn, getUsername, getEmail, clearAuth } from '../utils/auth';
import Button from '../components/Button';
import { withErrorBoundary } from '../components/ErrorBoundary';
import { Spinner } from '../components/LoadingAnimations';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatDate, safeString } from '../utils/formatters';

/**
 * User Profile page component
 * Displays user information and favorite movies
 */
const UserPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteUsername, setDeleteUsername] = useState('');

  useDocumentTitle('My Profile', true);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    console.log('UserPage: Checking authentication...');
    
    if (!isLoggedIn()) {
      console.log('User not logged in, redirecting to sign in');
      navigate('/signin');
      return;
    }
    
    const storedUsername = getUsername();
    console.log('Stored username:', storedUsername);
    setUsername(storedUsername || 'User');
    
    fetchFavorites();
  }, [navigate]);

  // Fetch user's favorite movies
  const fetchFavorites = async () => {
    if (!isLoggedIn()) {
      console.log('Not logged in, cannot fetch favorites');
      navigate('/signin');
      return;
    }

    try {
      setLoading(true);
      const data = await api.favorites.getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      
      // Check if it's an auth error (401/403)
      if (err.status === 401 || err.status === 403) {
        console.log('Authentication error, clearing auth and redirecting');
        clearAuth();
        navigate('/signin');
        return;
      }
      
      setError('Failed to load your favorite movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  // Handle movie card click
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deleteUsername.trim()) {
      setError('Please enter your username/email.');
      return;
    }

    if (!deletePassword.trim()) {
      setError('Please enter your password to delete your account.');
      return;
    }

    setDeleteLoading(true);
    setError(null);
    
    try {
      await api.auth.deleteAccount({
        username: deleteUsername.trim(),
        password: deletePassword
      });

      // Clear auth data and redirect
      clearAuth();
      navigate('/', { 
        state: { 
          message: 'Your account has been successfully deleted.' 
        } 
      });
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account. Please check your credentials and try again.');
    } finally {
      setDeleteLoading(false);
      setDeletePassword('');
      setDeleteUsername('');
    }
  };

  // Handle delete modal close
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteUsername('');
    setError(null);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      {/* User header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Profile picture placeholder */}
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Welcome, {username}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage your favorite movies here
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Favorites section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Your Favorite Movies
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xl" color="primary" />
              <p className="text-gray-500 dark:text-gray-400 animate-pulse">
                Loading your favorites...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-lg mb-2">
              Error Loading Favorites
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchFavorites}>
              Try Again
            </Button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              You have no favorites yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start exploring movies and add them to your favorites!
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Discover Movies
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {favorites.map((movie) => (
              <motion.div
                key={movie.id}
                variants={itemVariants}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleMovieClick(movie.id)}
              >
                {/* Movie poster */}
                <div className="relative pb-[150%] overflow-hidden">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path || ''}`}
                    alt={movie.original_title || 'Movie poster'}
                    className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x450?text=No+Image';
                    }}
                  />
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
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>{formatDate(movie.release_date)}</span>
                    {movie.popularity && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{movie.popularity.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete your account? This will permanently remove:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Your profile and personal data
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  All your favorite movies
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Access to your account
                </li>
              </ul>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter your username/email:
                  </label>
                  <input
                    type="email"
                    value={deleteUsername}
                    onChange={(e) => setDeleteUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="your.email@example.com"
                    disabled={deleteLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter your password to confirm:
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your password"
                    disabled={deleteLoading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword.trim() || !deleteUsername.trim()}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
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
export default withErrorBoundary(UserPage);
