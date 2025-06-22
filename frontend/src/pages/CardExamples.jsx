import React from 'react';
import Card from '../components/Card';

/**
 * Example page showcasing different Card component usage
 */
const CardExamplesPage = () => {
  // Sample data for demonstration
  const exampleItems = [
    {
      id: 1,
      title: 'Getting Started with React',
      subtitle: 'Learn the basics of React and build your first app',
      imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      tags: [
        { name: 'React', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
        { name: 'Frontend', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
        { name: 'Beginner', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' }
      ],
      badge: { text: 'New', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' }
    },
    {
      id: 2,
      title: 'Advanced CSS Techniques',
      subtitle: 'Master modern CSS with practical examples',
      imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      tags: [
        { name: 'CSS', color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' },
        { name: 'Web Design', color: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' }
      ],
      badge: { text: 'Popular', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' }
    },
    {
      id: 3,
      title: 'Node.js API Development',
      subtitle: 'Build robust and scalable APIs with Node.js and Express',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      tags: [
        { name: 'Node.js', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
        { name: 'API', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
        { name: 'Backend', color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' }
      ]
    },
    {
      id: 4,
      title: 'TypeScript Fundamentals',
      subtitle: 'Add static typing to your JavaScript applications',
      imageUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      tags: [
        { name: 'TypeScript', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
        { name: 'JavaScript', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' }
      ]
    }
  ];

  // Products example
  const productItems = [
    {
      id: 101,
      title: 'Wireless Noise-Cancelling Headphones',
      subtitle: 'Premium sound quality with 30 hours of battery life',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      price: '$249.99',
      rating: 4.8,
      tags: [
        { name: 'Wireless', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
        { name: 'Audio', color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' }
      ],
      badge: { text: 'Sale', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' }
    },
    {
      id: 102,
      title: 'Smart Fitness Watch',
      subtitle: 'Track your activity, sleep, and heart rate',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
      price: '$179.99',
      rating: 4.5,
      tags: [
        { name: 'Fitness', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
        { name: 'Wearable', color: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200' }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Card Component Examples</h1>
      
      {/* Basic Cards Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Standard Vertical Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exampleItems.map(item => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              imageUrl={item.imageUrl}
              tags={item.tags}
              badge={item.badge}
              cta={{ 
                text: 'View Details', 
                link: `/example/${item.id}` 
              }}
            />
          ))}
        </div>
      </section>

      {/* Horizontal Layout Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Horizontal Layout Cards</h2>
        <div className="grid grid-cols-1 gap-6">
          {exampleItems.slice(0, 2).map(item => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              imageUrl={item.imageUrl}
              tags={item.tags}
              badge={item.badge}
              layoutMode="horizontal"
              cta={{ 
                text: 'Learn More', 
                variant: 'outline'
              }}
            />
          ))}
        </div>
      </section>

      {/* Product Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Product Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productItems.map(product => (
            <Card
              key={product.id}
              title={product.title}
              subtitle={product.subtitle}
              imageUrl={product.imageUrl}
              tags={product.tags}
              badge={product.badge}
              cta={{ 
                text: 'Add to Cart', 
                variant: 'primary',
                onClick: () => alert(`Added ${product.title} to cart!`)
              }}
            >
              {/* Custom content inside the card */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.price}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-gray-600 dark:text-gray-400">{product.rating}/5</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Cards without images */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Cards Without Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Basic Plan', 'Pro Plan', 'Enterprise Plan'].map((plan, index) => (
            <Card
              key={index}
              title={plan}
              subtitle={`Perfect for ${index === 0 ? 'individuals' : index === 1 ? 'small teams' : 'large organizations'}`}
              cta={{ 
                text: index === 1 ? 'Current Plan' : 'Select Plan', 
                variant: index === 1 ? 'success' : 'primary',
                disabled: index === 1
              }}
            >
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${index === 0 ? '9' : index === 1 ? '29' : '99'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">{['5', '20', 'Unlimited'][index]} projects</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">{['10GB', '50GB', '1TB'][index]} storage</span>
                </li>
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Simple Clickable Cards */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Simple Clickable Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Analytics', 'Settings', 'User Management', 'Help Center'].map((item, index) => (
            <Card
              key={index}
              title={item}
              subtitle={`Access your ${item.toLowerCase()} dashboard`}
              to={`/dashboard/${item.toLowerCase().replace(' ', '-')}`}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {index === 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    ) : index === 1 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    ) : index === 2 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    )}
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CardExamplesPage;
