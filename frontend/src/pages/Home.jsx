import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import MovieCard from '../components/MovieCard';
import api from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = () => {
  // Set document title using our custom hook
  useDocumentTitle('Home', true);
  const navigate = useNavigate();
  
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Action', icon: '🔥', color: 'from-red-500 to-orange-500' },
    { id: 2, name: 'Drama', icon: '🎭', color: 'from-blue-500 to-purple-500' },
    { id: 3, name: 'Comedy', icon: '😂', color: 'from-green-500 to-teal-500' },
    { id: 4, name: 'Sci-Fi', icon: '🚀', color: 'from-indigo-500 to-blue-500' },
    { id: 5, name: 'Horror', icon: '👻', color: 'from-purple-500 to-pink-500' },
    { id: 6, name: 'Romance', icon: '💕', color: 'from-pink-500 to-rose-500' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        // Try to fetch movies from the API first
        try {
          const data = await api.movies.getAllMovies({ limit: 8 });
          
          // Check if the response is an array or has a results property
          let movieResults = [];
          if (Array.isArray(data)) {
            movieResults = data;
          } else if (data && Array.isArray(data.results)) {
            movieResults = data.results;
          } else if (data && Array.isArray(data.movies)) {
            movieResults = data.movies;
          }
          
          console.log('Movies API response:', data);
          console.log('Processed movie results:', movieResults);
          
          setTrendingMovies(movieResults);
        } catch (apiError) {
          console.error('API Error, falling back to mock data:', apiError);
          
          // Fallback to mock data if API fails
          const mockMovies = [
            {
              id: 1,
              imdb_id: 'tt1375666',
              original_title: 'Inception',
              overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
              release_date: '2010-07-16',
              vote_average: 8.8,
              genres: 'Action, Sci-Fi, Thriller',
              director: 'Christopher Nolan',
              poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
            },
            {
              id: 2,
              imdb_id: 'tt0468569',
              original_title: 'The Dark Knight',
              overview: 'When the menace known as The Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.',
              release_date: '2008-07-18',
              vote_average: 9.0,
              genres: 'Action, Crime, Drama',
              director: 'Christopher Nolan',
              poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
            },
            {
              id: 3,
              imdb_id: 'tt0816692',
              original_title: 'Interstellar',
              overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
              release_date: '2014-11-07',
              vote_average: 8.6,
              genres: 'Adventure, Drama, Sci-Fi',
              director: 'Christopher Nolan',
              poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
            },
            {
              id: 4,
              imdb_id: 'tt1853728',
              original_title: 'Django Unchained',
              overview: 'With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.',
              release_date: '2012-12-25',
              vote_average: 8.4,
              genres: 'Western, Drama',
              director: 'Quentin Tarantino',
              poster: 'https://image.tmdb.org/t/p/w500/7oWLIGZFujUp0HMe2SuIDT6m1rh.jpg'
            },
          ];
          setTrendingMovies(mockMovies);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchTrendingMovies:', err);
        setError('Failed to load movies. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchTrendingMovies();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
          }}
        >
          {/* Animated Particles / Stars (Optional) */}
          <div className="absolute inset-0 opacity-30">
            <div className="stars"></div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-28 md:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block animate-bounce-slow mb-4 bg-white/10 backdrop-blur-md p-2 rounded-lg">
              <span className="text-sm font-medium text-white px-3 py-1">The Ultimate Movie Experience</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Discover Your Next <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Favorite Movie</span>
            </h1>
            <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
              Explore thousands of movies, find hidden gems, and get personalized recommendations based on your unique taste.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="primary" 
                className="text-lg py-3 px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <span className="flex items-center">
                  <span>Explore Movies</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              <Button 
                variant="secondary" 
                className="text-lg py-3 px-8 border border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path 
              fill="#F9FAFB" 
              fillOpacity="1" 
              d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,90.7C672,75,768,85,864,96C960,107,1056,117,1152,122.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="dark:fill-gray-900"
            ></path>
          </svg>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white inline-block">
              Explore by Category
              <div className="h-1 bg-gradient-to-r from-primary-light to-purple-500 mt-2 rounded-full"></div>
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find exactly what you're looking for with our curated categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden group"
              >
                <div className={`bg-gradient-to-br ${category.color} p-6 text-center h-full flex flex-col items-center justify-center`}>
                  <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-medium text-white group-hover:font-bold transition-all">{category.name}</h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    <span className="text-xs text-white/80">View All →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Movies Section with Carousel Effect */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Trending Now</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Popular movies everyone's watching</p>
            </div>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-2">{error}</p>
              <Button variant="primary" className="mt-4">Try Again</Button>
            </div>
          ) : (!trendingMovies || trendingMovies.length === 0) ? (
            <div className="text-center text-yellow-600 dark:text-yellow-400 p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v12a1 1 0 001 1h8a1 1 0 001-1V8M7 8h10" />
              </svg>
              <p className="mt-2">No movies available at the moment</p>
              <Button variant="primary" className="mt-4">Refresh</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Feature Highlight with Interactive Demo */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full mb-6">
                <span className="text-sm font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                  Powered by AI
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Discover Movies with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Advanced AI</span>
              </h2>
              <p className="text-lg text-gray-100 mb-8 max-w-xl">
                Our advanced AI understands natural language. Ask questions like "Show me sci-fi movies with time travel" 
                or "What are good movies about friendship?" and get personalized recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="primary" 
                  className="bg-white text-purple-800 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
                  Try AI Search
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="lg:w-2/5 perspective-800">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-[0_0_40px_rgba(79,70,229,0.4)] transform hover:rotate-y-3 transition-transform duration-500">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm">Show me space movies with plot twists</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-700/50 to-blue-700/50 rounded-lg shadow-inner">
                    <p className="text-sm">I found 15 space-themed movies with surprising plot twists. Here are my top recommendations:</p>
                    <ul className="mt-2 space-y-1 text-xs text-blue-100">
                      <li className="flex items-center"><span className="mr-2">1.</span> Interstellar (2014)</li>
                      <li className="flex items-center"><span className="mr-2">2.</span> Moon (2009)</li>
                      <li className="flex items-center"><span className="mr-2">3.</span> The Martian (2015)</li>
                    </ul>
                    <p className="text-xs mt-2 opacity-70">Would you like to refine your search further?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">What Our Users Say</h2>
            <p className="text-gray-600 dark:text-gray-400">Join thousands of movie enthusiasts who love our platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Johnson",
                role: "Film Enthusiast",
                quote: "Finally found a platform that understands my movie preferences! The AI recommendations are spot on.",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Sarah Williams",
                role: "Casual Viewer",
                quote: "I discovered so many hidden gems that I would have never found on other streaming platforms.",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                name: "Michael Chen",
                role: "Film Student",
                quote: "The detailed movie analysis and recommendations have been invaluable for my film studies.",
                avatar: "https://randomuser.me/api/portraits/men/62.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action with App Screenshot */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute top-0 transform rotate-180">
            <path 
              fill="#F9FAFB" 
              fillOpacity="0.08" 
              d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,90.7C672,75,768,85,864,96C960,107,1056,117,1152,122.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to start your movie journey?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of movie enthusiasts. Create an account to track your favorites, get personalized recommendations, and more.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="primary" 
                className="text-lg py-3 px-8 bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
                onClick={() => navigate('/signup')}
              >
                Sign Up for Free
              </Button>
              <Button 
                variant="secondary" 
                className="text-lg py-3 px-8 bg-transparent border border-white text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
