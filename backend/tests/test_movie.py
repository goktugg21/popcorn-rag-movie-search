import pytest
from app import app
@pytest.fixture
def test_app():

    app.config['TESTING'] = True
    yield app
@pytest.fixture()
def client(test_app):
    yield test_app.test_client()

@pytest.fixture()
def runner(test_app):
    return test_app.test_cli_runner()

def test_get_movie_by_id(client):
    """
    Test the /movie endpoint with id.
    """
    response = client.get('/movie?id=1')  
    data = response.get_json()
    assert 'original_title' in data
    assert 'id' in data
    assert 'popularity' in data
    assert 'overview' in data
    assert 'release_date' in data
    assert 'budget' in data

def test_get_movie_by_imdb_id(client):
    """
    Test the /movie endpoint with IMDb ID.
    """
    response = client.get('/movie?imdb_id=tt0111161')  
    data = response.get_json()
    assert 'original_title' in data
    assert 'id' in data
    assert 'popularity' in data
    assert 'overview' in data
    assert 'release_date' in data
    assert 'budget' in data
