import React from 'react';
import Header from './Header';
import PinnedSearchBar from './PinnedSearchBar';
import Footer from './Footer';
import useDarkMode from '../hooks/useDarkMode';

/**
 * Main layout component with responsive header, search bar and content area
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render inside the layout
 */
const Layout = ({ children }) => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-200">
      {/* Header - Using the enhanced Header component */}
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      
      {/* Pinned Search Bar */}
      <PinnedSearchBar />

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
