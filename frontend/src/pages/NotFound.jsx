import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';

/**
 * 404 Not Found page
 */
const NotFound = () => {
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

  return (
    <motion.div
      className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      <div className="text-center max-w-lg">
        <div className="mb-6 text-blue-600 dark:text-blue-500">
          <svg 
            className="h-24 w-24 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          We couldn't find the page you're looking for. The page might be moved, deleted, or never existed.
        </p>
        <div className="space-x-4">
          <Link to="/">
            <Button variant="primary">
              Go to Home
            </Button>
          </Link>
          <Link to="/movies">
            <Button variant="outline">
              Browse Movies
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
