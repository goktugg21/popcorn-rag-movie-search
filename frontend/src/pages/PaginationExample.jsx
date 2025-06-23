import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Pagination from '../components/Pagination';
import Button from '../components/Button';

/**
 * Example page showcasing Pagination component usage
 */
const PaginationExamplePage = () => {
  // Example state
  const [currentPage, setCurrentPage] = useState(1);
  const [siblingCount, setSiblingCount] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Pagination Component Examples</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Basic Usage</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A simple demonstration of the pagination component with different configurations.
        </p>

        <div className="mt-6 space-y-8">
          {/* Example 1: Default Pagination */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Default Pagination</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded mb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={siblingCount}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div>
                <label htmlFor="currentPage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Page
                </label>
                <input
                  type="number"
                  id="currentPage"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="totalPages" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Pages
                </label>
                <input
                  type="number"
                  id="totalPages"
                  min="1"
                  max="100"
                  value={totalPages}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setTotalPages(value);
                    if (currentPage > value) {
                      setCurrentPage(value);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="siblingCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sibling Count
                </label>
                <input
                  type="number"
                  id="siblingCount"
                  min="0"
                  max="3"
                  value={siblingCount}
                  onChange={(e) => setSiblingCount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>
          
          {/* Example 2: Few Pages */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">With Few Pages (3 pages)</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded">
              <Pagination
                currentPage={currentPage <= 3 ? currentPage : 1}
                totalPages={3}
                onPageChange={(page) => console.log(`Navigating to page ${page}`)}
              />
            </div>
          </div>
          
          {/* Example 3: Many Pages */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">With Many Pages (50 pages)</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded">
              <Pagination
                currentPage={10}
                totalPages={50}
                onPageChange={(page) => console.log(`Navigating to page ${page}`)}
              />
            </div>
          </div>
          
          {/* Example 4: Custom Styling */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">With Custom Styling</h3>
            <div className="bg-gray-800 p-6 rounded">
              <Pagination
                currentPage={5}
                totalPages={10}
                onPageChange={(page) => console.log(`Navigating to page ${page}`)}
                className="bg-gray-800 text-white"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Component Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Page number buttons for direct navigation</li>
          <li>Previous and Next buttons for incremental navigation</li>
          <li>Active page indicator</li>
          <li>Responsive design with mobile optimization</li>
          <li>Accessible with ARIA attributes</li>
          <li>Customizable sibling count (number of pages shown on each side)</li>
          <li>Ellipsis for large page ranges</li>
          <li>Disabled state for boundary conditions</li>
          <li>Hover effects and focus states</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default PaginationExamplePage;
