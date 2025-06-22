import React, { useState, useEffect } from 'react';
import Button from './Button';

/**
 * FilterPanel component for filtering content with various options
 * @param {Object} props - Component props
 * @param {string} props.mode - Display mode: 'sidebar' or 'dropdown'
 * @param {Array} props.filters - Array of filter configurations
 * @param {Object} props.selectedFilters - Currently selected filter values
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {boolean} props.isOpen - Whether dropdown is open (for dropdown mode)
 * @param {Function} props.onToggle - Toggle function for dropdown mode
 * @param {string} props.className - Additional CSS classes
 */
const FilterPanel = ({
  mode = 'sidebar',
  filters = [],
  selectedFilters = {},
  onFilterChange,
  isOpen = false,
  onToggle,
  className = '',
}) => {
  const [localFilters, setLocalFilters] = useState(selectedFilters);
  const [expanded, setExpanded] = useState({});

  // Initialize expanded state for each filter group
  useEffect(() => {
    const initialExpanded = {};
    filters.forEach(filter => {
      initialExpanded[filter.id] = true;
    });
    setExpanded(initialExpanded);
  }, [filters]);

  // Reset local filters when selectedFilters changes externally
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  // Update a single filter value
  const handleFilterChange = (filterId, value) => {
    const newFilters = {
      ...localFilters,
      [filterId]: value
    };
    setLocalFilters(newFilters);
  };

  // Handle checkbox filters (multiple selection)
  const handleCheckboxChange = (filterId, option, checked) => {
    const currentOptions = Array.isArray(localFilters[filterId]) ? [...localFilters[filterId]] : [];
    
    if (checked) {
      if (!currentOptions.includes(option)) {
        currentOptions.push(option);
      }
    } else {
      const index = currentOptions.indexOf(option);
      if (index !== -1) {
        currentOptions.splice(index, 1);
      }
    }
    
    handleFilterChange(filterId, currentOptions);
  };

  // Toggle expand/collapse for a filter section
  const toggleExpand = (filterId) => {
    setExpanded(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  // Apply filter changes
  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange(localFilters);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    const emptyFilters = {};
    filters.forEach(filter => {
      if (filter.type === 'checkbox' || filter.type === 'multiselect') {
        emptyFilters[filter.id] = [];
      } else if (filter.type === 'range') {
        emptyFilters[filter.id] = [filter.min, filter.max];
      } else {
        emptyFilters[filter.id] = '';
      }
    });
    setLocalFilters(emptyFilters);
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
  };

  // Render a filter based on its type
  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {filter.options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={Array.isArray(localFilters[filter.id]) && localFilters[filter.id].includes(option.value)}
                  onChange={(e) => handleCheckboxChange(filter.id, option.value, e.target.checked)}
                />
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2 mt-2">
            {filter.options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={filter.id}
                  className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                  value={option.value}
                  checked={localFilters[filter.id] === option.value}
                  onChange={() => handleFilterChange(filter.id, option.value)}
                />
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={localFilters[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          >
            <option value="">{filter.placeholder || 'Select an option'}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'range':
        const [min, max] = Array.isArray(localFilters[filter.id]) 
          ? localFilters[filter.id] 
          : [filter.min, filter.max];
        
        return (
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {min} {filter.unit}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {max} {filter.unit}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={min}
                onChange={(e) => handleFilterChange(filter.id, [parseInt(e.target.value), max])}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={max}
                onChange={(e) => handleFilterChange(filter.id, [min, parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="mt-2">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder={filter.placeholder || 'Search...'}
              value={localFilters[filter.id] || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // For dropdown mode
  if (mode === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onToggle}
        >
          <span>Filters</span>
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700">
            <div className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </div>
            <div className="py-2 px-4 max-h-96 overflow-y-auto">
              {filters.map((filter) => (
                <div key={filter.id} className="mb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer" 
                    onClick={() => toggleExpand(filter.id)}
                  >
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{filter.label}</h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expanded[filter.id] ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {expanded[filter.id] && renderFilter(filter)}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800">
              <button 
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={resetFilters}
              >
                Reset all
              </button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={applyFilters}
              >
                Apply filters
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For sidebar mode
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
      </div>
      <div className="p-4 divide-y divide-gray-200 dark:divide-gray-700">
        {filters.map((filter) => (
          <div key={filter.id} className="py-4 first:pt-0 last:pb-0">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleExpand(filter.id)}
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{filter.label}</h4>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expanded[filter.id] ? 'transform rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            {expanded[filter.id] && renderFilter(filter)}
          </div>
        ))}
      </div>
      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-between">
        <button 
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={resetFilters}
        >
          Reset all
        </button>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={applyFilters}
        >
          Apply filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
