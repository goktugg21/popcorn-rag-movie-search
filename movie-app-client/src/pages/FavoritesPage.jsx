// src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function FavoritesPage({ isLoggedIn }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Get favorite movies
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_favourites`, {
        withCredentials: true
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Could not fetch favorites:', error);
      setMessage('Error occurred while loading favorites!');
    } finally {
      setLoading(false);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (movieId) => {
    try {
      await axios.post(`${API_BASE_URL}/delete_favourite`, 
        { movie_id: movieId },
        { withCredentials: true }
      );
      
      // Remove movie from list
      setFavorites(favorites.filter(movie => movie.id !== movieId));
      setMessage('Movie removed from favorites!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setMessage('Error occurred while removing movie from favorites!');
    }
  };

  // User not logged in
  if (!isLoggedIn) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Alert variant="warning">
              <h4>Please Log In</h4>
              <p>You need to log in to view your favorites.</p>
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="mb-4">My Favorite Movies</h1>
      
      {/* Show message */}
      {message && (
        <Alert variant="info" className="mb-3">
          {message}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center my-4">
          <p>Loading favorites...</p>
        </div>
      )}

      {/* Favorite movies */}
      {!loading && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center my-5">
              <Alert variant="info">
                <h4>You don't have any favorite movies yet</h4>
                <p>You can add movies to your favorites from the home page.</p>
                <Link to="/" className="btn btn-primary">
                  Discover Movies
                </Link>
              </Alert>
            </div>
          ) : (
            <Row>
              {favorites.map((movie) => (
                <Col md={4} key={movie.id} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>{movie.original_title}</Card.Title>
                      <Card.Text className="text-muted small">
                        {movie.release_year} • ⭐ {movie.vote_average}/10
                      </Card.Text>
                      <Card.Text className="text-truncate">
                        {movie.overview || 'Description not available'}
                      </Card.Text>
                      {movie.genres && (
                        <div className="mb-2">
                          {movie.genres.split(',').slice(0, 3).map((genre, index) => (
                            <span key={index} className="badge bg-secondary me-1">
                              {genre.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {movie.director && (
                        <Card.Text className="text-muted small">
                          <strong>Director:</strong> {movie.director}
                        </Card.Text>
                      )}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeFromFavorites(movie.id)}
                      >
                        💔 Remove from Favorites
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          {favorites.length > 0 && (
            <div className="text-center mt-4">
              <p className="text-muted">
                You have {favorites.length} favorite movies in total
              </p>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default FavoritesPage;