import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import Button from './Button';
import { isLoggedIn, getUsername } from '../utils/auth';

/**
 * Header component with responsive navigation and branding
 * @param {Object} props - Component props
 * @param {boolean} props.isDarkMode - Dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 */
const Header = ({ isDarkMode, toggleDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

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

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setUserLoggedIn(loggedIn);
      if (loggedIn) {
        setUsername(getUsername() || 'User');
      }
    };
    
    checkAuth();
    
    // Check auth status when location changes (e.g., after login/logout)
    const intervalId = setInterval(checkAuth, 1000);
    
    return () => clearInterval(intervalId);
  }, [location]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle profile click
  const handleProfileClick = () => {
    navigate('/user');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-md border-b border-gray-200 dark:border-gray-800' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <svg 
                className="h-10 w-10 text-red-600 dark:text-red-500 mr-3 transform transition-transform duration-300 group-hover:scale-110" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                {/* Popcorn bucket */}
                <path 
                  d="M4,10 L4,22 L20,22 L20,10" 
                  fill="#FFF" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M2,10 L22,10" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M4,10 L8,4 M12,6 L12,2 M20,10 L16,4" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M8,10 C8,7 10,5.5 12,5.5 C14,5.5 16,7 16,10"
                  stroke="currentColor" 
                  fill="#FFDD66"
                  strokeWidth="1.5"
                />
                {/* Striped pattern */}
                <path 
                  d="M6,13 H18 M6,17 H18" 
                  stroke="currentColor" 
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              </svg>
              <span className={`text-2xl md:text-3xl font-bold tracking-tight ${
                isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'
              } transition-colors duration-300`}>
                <span className="text-red-600 dark:text-red-500">Popcorn</span> not included
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {[
              { name: 'Home', path: '/' },
              { name: 'Tropes', path: '/tropes' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-medium text-base transition-all duration-300 hover:text-red-600 dark:hover:text-red-400 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300 ${
                  location.pathname === item.path 
                    ? 'after:w-full after:bg-red-600 dark:after:bg-red-400 text-red-600 dark:text-red-400 font-semibold' 
                    : isScrolled 
                      ? 'text-gray-700 dark:text-gray-200 after:bg-red-600 dark:after:bg-red-400' 
                      : 'text-white after:bg-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right section: Auth + Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              {userLoggedIn ? (
                <button
                  onClick={handleProfileClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white hover:text-gray-800'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block">{username}</span>
                </button>
              ) : (
                <>
                  <Button 
                    variant={isScrolled ? "outline" : "glass"} 
                    size="sm"
                    onClick={() => navigate('/signin')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant={isScrolled ? "primary" : "glass"} 
                    size="sm"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
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
                { name: 'Tropes', path: '/tropes' },
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
                {userLoggedIn ? (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth
                    onClick={handleProfileClick}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {username}
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth
                      onClick={() => {
                        navigate('/signin');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      fullWidth
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
