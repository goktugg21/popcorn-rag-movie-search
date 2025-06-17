import pytest
from app import app

@pytest.fixture
def client():
    app.test_client()

def test_get_movie_by_imdbID(client):
    """
    Test the /movie endpoint to ensure it returns a movie by ID.
    """
    response = client.get('/movie/imdbID/1')  # Example IMDb ID for "The Shawshank Redemption"
    data = response.get_json()
    assert 'original_title' in data
    assert 'id' in data
    assert 'popularity' in data
    assert 'overview' in data
    assert 'release_date' in data
    assert 'budget' in data

def test_get_movie_by_id(client):
    """
    Test the /movie endpoint to ensure it returns a movie by ID.
    """
    response = client.get('/movie/id/1')  # Example ID for "The Shawshank Redemption"
    data = response.get_json()
    assert 'original_title' in data
    assert 'id' in data
    assert 'popularity' in data
    assert 'overview' in data
    assert 'release_date' in data
    assert 'budget' in data