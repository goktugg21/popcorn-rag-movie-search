import React from 'react';

/**
 * Reusable button component with multiple style variants
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button style variant (primary, secondary, success, danger, outline, glass)
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Button size (xs, sm, md, lg, xl)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.fullWidth - Whether the button should take full width
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  size = 'md',
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  // Base styles for all buttons
  const baseStyles = 'font-medium transition-all duration-200 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size variations
  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  // Style variations
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'bg-transparent border-2 border-current hover:bg-opacity-10 hover:bg-current text-blue-600 dark:text-blue-400 focus:ring-blue-500',
    glass: 'bg-white bg-opacity-10 backdrop-blur-md hover:bg-opacity-20 border border-white/20 text-white shadow-sm focus:ring-white/50',
  };

  // Disabled styles
  const disabledClasses = disabled ? 
    'opacity-50 cursor-not-allowed pointer-events-none' : '';

  // Full width style
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledClasses} ${widthClass} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
