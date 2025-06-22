import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import CardExamplesPage from './pages/CardExamples';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/examples/cards" element={<CardExamplesPage />} />
          {/* Add additional routes here as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
