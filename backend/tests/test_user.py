import pytest
from app import app

### first backend tests file ###

### user tests

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

def test_register_user(client):
    response = client.post('/register', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'User registered successfully'


def test_register_user_existing_username(client):

    response = client.post('/register', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    
    assert response.status_code == 400
    assert response.get_data(as_text=True) == 'User already exists'

def test_login_user(client):
    response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'Login successful'

def test_delete_user(client):
    response = client.post('/delete_account', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'User account deleted successfully'

