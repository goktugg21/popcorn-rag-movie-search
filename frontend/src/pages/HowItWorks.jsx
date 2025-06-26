import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';

const HowItWorks = () => {
  useDocumentTitle('How It Works');
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: "Search & Discover",
      description: "Use our advanced search filters or AI-powered search to find movies that match your preferences. Search by genre, rating, year, director, or even describe what you're looking for in natural language.",
      icon: "🔍",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Get Personalized Recommendations",
      description: "Our AI analyzes your viewing history and preferences to suggest movies you'll love. The more you use the platform, the better our recommendations become.",
      icon: "🤖",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Explore Movie Details",
      description: "Dive deep into movie information including cast, crew, plot summaries, ratings, reviews, and similar movie recommendations. Everything you need to make informed viewing decisions.",
      icon: "📚",
      color: "from-green-500 to-teal-500"
    },
    {
      id: 4,
      title: "Track Your Favorites",
      description: "Create your personal watchlist, mark movies as favorites, and keep track of what you've watched. Build your own movie collection and never lose track of great films.",
      icon: "❤️",
      color: "from-red-500 to-orange-500"
    }
  ];

  const features = [
    {
      title: "AI-Powered Search",
      description: "Ask questions like 'Show me funny movies about friendship' or 'What are the best sci-fi movies from the 90s?' and get intelligent results.",
      icon: "🧠"
    },
    {
      title: "Advanced Filters",
      description: "Filter by genre, year, rating, director, cast, and more to find exactly what you're looking for.",
      icon: "🎛️"
    },
    {
      title: "Movie Tropes",
      description: "Discover movies based on common themes and storytelling elements that appeal to you.",
      icon: "🎭"
    },
    {
      title: "User Reviews",
      description: "Read reviews from other movie enthusiasts and share your own thoughts on films you've watched.",
      icon: "⭐"
    },
    {
      title: "Responsive Design",
      description: "Enjoy a seamless experience across all your devices - desktop, tablet, and mobile.",
      icon: "📱"
    },
    {
      title: "Dark Mode",
      description: "Switch between light and dark themes for comfortable viewing at any time of day.",
      icon: "🌙"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium">Discover How Easy It Is</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">Works</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Our movie discovery platform makes it simple to find your next favorite film. 
              Here's everything you need to know to get started.
            </p>
            <Button 
              variant="primary" 
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Start Exploring Now
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Simple Steps to Movie Discovery
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Follow these easy steps to unlock a world of cinematic experiences
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30"></div>
            
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={step.id} className={`flex flex-col lg:flex-row items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Content */}
                  <div className="lg:w-1/2 px-4">
                    <div className={`p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl ${index % 2 === 1 ? 'lg:ml-8' : 'lg:mr-8'}`}>
                      <div className="flex items-center mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-2xl mr-4 shadow-lg`}>
                          {step.icon}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Step {step.id}</span>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Step Number Circle */}
                  <div className="hidden lg:block relative z-10">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-lg">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{step.id}</span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="lg:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to discover, explore, and enjoy movies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Experience AI-Powered Search
            </h2>
            <p className="text-xl text-gray-100 mb-12 max-w-3xl mx-auto">
              Our advanced AI understands natural language queries and provides intelligent movie recommendations 
              based on your specific interests and preferences.
            </p>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Try These Sample Queries:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Show me funny movies about friendship",
                  "What are the best sci-fi movies from the 90s?",
                  "Find movies with plot twists like The Sixth Sense",
                  "Recommend feel-good movies for a rainy day",
                  "Show me action movies with strong female leads",
                  "What are some underrated indie films?"
                ].map((query, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg text-left">
                    <span className="text-blue-300">"</span>
                    <span className="text-white">{query}</span>
                    <span className="text-blue-300">"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Movie Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of movie enthusiasts and discover your next favorite film today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="primary" 
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Start Exploring Movies
              </Button>
              <Button 
                variant="secondary" 
                className="bg-transparent border border-white text-white hover:bg-white/10"
                onClick={() => {
                  navigate('/signup');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
