import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * Reusable Card component for displaying items in a grid/list
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle or description
 * @param {string} [props.imageUrl] - URL to the card image
 * @param {Array} [props.tags] - Array of tag objects with name and color properties
 * @param {Object} [props.cta] - Call-to-action button properties 
 * @param {string} [props.cta.text] - CTA button text
 * @param {string} [props.cta.link] - CTA button link (if provided, will render as Link)
 * @param {Function} [props.cta.onClick] - CTA button click handler
 * @param {string} [props.cta.variant] - CTA button variant
 * @param {string} [props.layoutMode] - Layout mode: "horizontal" or "vertical" (default)
 * @param {Object} [props.badge] - Optional badge to display on the card
 * @param {string} [props.badge.text] - Badge text
 * @param {string} [props.badge.color] - Badge color variant
 * @param {string} [props.to] - If provided, the whole card will be clickable and route to this path
 * @param {Function} [props.onClick] - Click handler for the entire card
 * @param {string} [props.className] - Additional CSS classes for the card
 * @param {node} [props.children] - Optional children to render in the card body
 */
const Card = ({
  title,
  subtitle,
  imageUrl,
  tags = [],
  cta,
  layoutMode = 'vertical',
  badge,
  to,
  onClick,
  className = '',
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine if the card is clickable
  const isClickable = to || onClick;

  // Handle card click
  const handleCardClick = (e) => {
    if (onClick) onClick(e);
  };

  // Container component based on whether the card is a link or not
  const Container = to ? Link : 'div';
  const containerProps = to ? { to } : {};
  
  return (
    <Container
      {...containerProps}
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl 
                transition-all duration-300 ${isClickable ? 'cursor-pointer transform hover:-translate-y-1' : ''} ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex ${layoutMode === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
        {/* Image Section */}
        {imageUrl && (
          <div className={`${layoutMode === 'horizontal' ? 'w-1/3' : 'w-full'} relative`}>
            <div className={`${layoutMode === 'horizontal' ? 'h-full' : 'pb-[60%]'} relative overflow-hidden`}>
              <img 
                src={imageUrl} 
                alt={title}
                className={`${layoutMode === 'horizontal' ? 'absolute h-full' : 'absolute h-full w-full'} object-cover transform transition-transform duration-500`}
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                }}
              />
              
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
            </div>

            {/* Badge (if provided) */}
            {badge && (
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold shadow-md
                ${badge.color || 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}`}>
                {badge.text}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className={`${layoutMode === 'horizontal' ? 'w-2/3' : 'w-full'} p-5`}>
          {/* Title and Subtitle */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tag.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Additional Content */}
          {children && <div className="mb-4">{children}</div>}

          {/* CTA Button */}
          {cta && (
            <div className={`mt-auto ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-95'} transition-all duration-300`}>
              {cta.link ? (
                <Link to={cta.link} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant={cta.variant || 'primary'} 
                    size="sm" 
                    className={layoutMode === 'horizontal' ? '' : 'w-full'}
                  >
                    {cta.text || 'Learn More'}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant={cta.variant || 'primary'} 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cta.onClick) cta.onClick(e);
                  }}
                  className={layoutMode === 'horizontal' ? '' : 'w-full'}
                >
                  {cta.text || 'Learn More'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Card;
