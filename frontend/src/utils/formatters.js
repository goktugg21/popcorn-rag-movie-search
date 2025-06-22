/**
 * Format a date object into a readable string
 * @param {Date|string|null} date - The date to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @param {string} defaultValue - Default value if date is invalid
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-US', defaultValue = 'Unknown') => {
  if (!date) return defaultValue;
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
};

/**
 * Truncate a string if it exceeds max length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum characters before truncating
 * @param {string} defaultValue - Default value if text is null or undefined
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100, defaultValue = '') => {
  if (!text) return defaultValue;
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format currency amount
 * @param {number|null} amount - Amount to format
 * @param {string} defaultValue - Text to show if amount is null
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount, defaultValue = 'N/A') => {
  if (!amount && amount !== 0) return defaultValue;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return defaultValue;
  }
};

/**
 * Format runtime to hours and minutes
 * @param {number|null} minutes - Runtime in minutes
 * @param {string} defaultValue - Text to show if runtime is null
 * @returns {string} - Formatted runtime
 */
export const formatRuntime = (minutes, defaultValue = 'Unknown') => {
  if (!minutes && minutes !== 0) return defaultValue;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let result = '';
  
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  if (remainingMinutes > 0) {
    result += `${hours > 0 ? ' ' : ''}${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }
  
  return result || defaultValue;
};

/**
 * Parse a comma-separated string into an array
 * @param {string|null} listString - Comma-separated string
 * @param {string} defaultValue - Text to show if list is null or empty
 * @returns {string[]} - Array of values
 */
export const parseList = (listString, defaultValue = 'None') => {
  if (!listString) return [defaultValue];
  const list = listString.split(',').map(item => item.trim()).filter(Boolean);
  return list.length ? list : [defaultValue];
};

/**
 * Safe array check and join
 * @param {Array|null} array - Array to check and join
 * @param {string} separator - Separator to join with
 * @param {string} defaultValue - Text to show if array is null or empty
 * @returns {string} - Joined array or default text
 */
export const safeArrayJoin = (array, separator = ', ', defaultValue = 'None') => {
  if (!array || !Array.isArray(array) || array.length === 0) return defaultValue;
  return array.join(separator);
};

/**
 * Safe string accessor with default
 * @param {string|null} value - String to check
 * @param {string} defaultValue - Text to show if value is null or empty
 * @returns {string} - Value or default text
 */
export const safeString = (value, defaultValue = 'None') => {
  return value || defaultValue;
};

/**
 * Safe number accessor with default
 * @param {number|null} value - Number to check
 * @param {string|number} defaultValue - Text or value to show if value is null
 * @returns {number|string} - Value or default
 */
export const safeNumber = (value, defaultValue = 'N/A') => {
  return (value !== null && value !== undefined) ? value : defaultValue;
};
