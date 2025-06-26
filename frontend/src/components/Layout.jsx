import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import PinnedSearchBar from './PinnedSearchBar';
import Footer from './Footer';
import useDarkMode from '../hooks/useDarkMode';
import { useSearchBar } from '../contexts/SearchBarContext';

/**
 * Main layout component with responsive header, search bar and content area
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render inside the layout
 */
const Layout = ({ children }) => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const location = useLocation();
  const { aiMode, setAiMode } = useSearchBar();
  
  // Debug the context values
  console.log('Layout: aiMode from context:', aiMode);
  
  // Only show PinnedSearchBar on the home page
  const showSearchBar = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background-light to-gray-100 dark:from-background-dark dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans antialiased">
      {/* Header - Using the enhanced Header component */}
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20"></div>
      
      {/* Pinned Search Bar - Only show on home page */}
      {showSearchBar && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
          <PinnedSearchBar 
            initialAiMode={aiMode}
            onAiModeChange={setAiMode}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow px-0 transition-all duration-300 ease-in-out">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
