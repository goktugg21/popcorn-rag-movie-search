import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import Button from './Button';

/**
 * Header component with responsive navigation and branding
 * @param {Object} props - Component props
 * @param {boolean} props.isDarkMode - Dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 */
const Header = ({ isDarkMode, toggleDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg 
                className="h-8 w-8 text-blue-600 dark:text-blue-500 mr-2" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <span className={`text-2xl font-bold ${
                isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'
              }`}>
                MovieDB
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {[
              { name: 'Home', path: '/' },
              { name: 'Movies', path: '/movies' },
              { name: 'Categories', path: '/categories' },
              { name: 'Favorites', path: '/favorites' },
              { name: 'Card Examples', path: '/examples/cards' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === item.path ? 'text-blue-600 dark:text-blue-400' : 
                  isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right section: Auth + Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
              <Button 
                variant={isScrolled ? "outline" : "glass"} 
                size="sm"
              >
                Sign In
              </Button>
              <Button 
                variant={isScrolled ? "primary" : "glass"} 
                size="sm"
              >
                Sign Up
              </Button>
            </div>
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg 
                  className={`w-6 h-6 ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg 
                  className={`w-6 h-6 ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4 pb-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Movies', path: '/movies' },
                { name: 'Categories', path: '/categories' },
                { name: 'Favorites', path: '/favorites' },
                { name: 'Card Examples', path: '/examples/cards' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium transition-colors hover:text-blue-600 ${
                    location.pathname === item.path ? 'text-blue-600 dark:text-blue-400' :
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-gray-800 dark:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" fullWidth>Sign In</Button>
                <Button variant="primary" size="sm" fullWidth>Sign Up</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
