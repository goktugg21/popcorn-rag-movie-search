import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import {
  HomeSkeleton,
  DetailSkeleton,
  SearchResultsSkeleton,
  NotFoundSkeleton
} from './components/Skeletons';
import './App.css';

// Title management component
const TitleManager = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Base title
    let title = 'Popcorn not included';
    
    // Add page-specific titles based on route
    if (location.pathname !== '/') {
      if (location.pathname.includes('/movie/')) {
        title = `Movie Details | ${title}`;
      } else if (location.pathname === '/search') {
        title = `Search Results | ${title}`;
      } else if (location.pathname === '/tropes') {
        title = `Character Tropes | ${title}`;
      } else if (location.pathname === '/user') {
        title = `My Profile | ${title}`;
      } else if (location.pathname === '/signin') {
        title = `Sign In | ${title}`;
      } else if (location.pathname === '/signup') {
        title = `Sign Up | ${title}`;
      }
    }
    
    document.title = title;
  }, [location]);
  
  return null;
};

// Lazy load all page components with specific loading skeletons
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Tropes = lazy(() => import('./pages/Tropes'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const UserPage = lazy(() => import('./pages/UserPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <TitleManager />
      <Layout>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<HomeSkeleton />}>
                  <Home />
                </Suspense>
              } />
              <Route path="/movie/:id" element={
                <Suspense fallback={<DetailSkeleton />}>
                  <MovieDetail />
                </Suspense>
              } />
              <Route path="/search" element={
                <Suspense fallback={<SearchResultsSkeleton />}>
                  <SearchResults />
                </Suspense>
              } />
              <Route path="/tropes" element={
                <Suspense fallback={<SearchResultsSkeleton />}>
                  <Tropes />
                </Suspense>
              } />
              <Route path="/signin" element={
                <Suspense fallback={<HomeSkeleton />}>
                  <SignIn />
                </Suspense>
              } />
              <Route path="/signup" element={
                <Suspense fallback={<HomeSkeleton />}>
                  <SignUp />
                </Suspense>
              } />
              <Route path="/user" element={
                <Suspense fallback={<HomeSkeleton />}>
                  <UserPage />
                </Suspense>
              } />
              {/* 404 catch-all route */}
              <Route path="*" element={
                <Suspense fallback={<NotFoundSkeleton />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}

export default App;
