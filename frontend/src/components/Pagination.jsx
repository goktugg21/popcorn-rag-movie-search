import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination component with page numbers and navigation buttons
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page number (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes, receives page number
 * @param {number} [props.siblingCount=1] - Number of sibling pages to show on each side of current page
 * @param {string} [props.className] - Additional CSS classes for the container
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  siblingCount = 1,
  className = '' 
}) => {
  // Don't render if there's only 1 page or less
  if (totalPages <= 1) return null;

  // Generate page numbers to display with ellipsis
  const pageNumbers = useMemo(() => {
    // Always include first and last page
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Calculate range of visible pages based on current page and sibling count
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

    // Should we show dots
    const shouldShowLeftDots = leftSiblingIndex > firstPage + 1;
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1;
    
    // Calculate the final page range
    const result = [];

    // Always add first page
    result.push(firstPage);

    // Add left dots if necessary
    if (shouldShowLeftDots) {
      result.push('...');
    } else if (firstPage + 1 < leftSiblingIndex) {
      // If we're not showing dots but have space, fill it
      for (let i = firstPage + 1; i < leftSiblingIndex; i++) {
        result.push(i);
      }
    }

    // Add visible pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        result.push(i);
      }
    }

    // Add right dots if necessary
    if (shouldShowRightDots) {
      result.push('...');
    } else if (rightSiblingIndex + 1 < lastPage) {
      // If we're not showing dots but have space, fill it
      for (let i = rightSiblingIndex + 1; i < lastPage; i++) {
        result.push(i);
      }
    }

    // Always add last page (if not already included)
    if (lastPage !== firstPage) {
      result.push(lastPage);
    }

    return result;
  }, [currentPage, totalPages, siblingCount]);

  // Handle page click
  const handlePageClick = (page) => {
    if (page !== currentPage && page !== '...') {
      onPageChange(page);
    }
  };

  // Handle previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Handle next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className={`flex justify-center items-center my-8 ${className}`} aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-3 py-2 mr-2 text-sm font-medium rounded-md 
          ${currentPage === 1 
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:block ml-1">Previous</span>
      </button>

      {/* Page numbers */}
      <div className="hidden sm:flex space-x-1">
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500
              ${page === '...' 
                ? 'text-gray-700 dark:text-gray-300 cursor-default' 
                : page === currentPage
                  ? 'bg-blue-600 text-white dark:bg-blue-700 cursor-default' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-offset-2'
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Mobile view - current/total indicator */}
      <span className="sm:hidden px-4 text-sm text-gray-600 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center px-3 py-2 ml-2 text-sm font-medium rounded-md
          ${currentPage === totalPages 
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        aria-label="Next page"
      >
        <span className="hidden sm:block mr-1">Next</span>
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  className: PropTypes.string
};

export default Pagination;
