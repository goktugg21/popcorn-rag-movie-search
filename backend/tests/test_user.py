from flask import Response
from flask.testing import FlaskClient
import pytest
from app import app
from dotenv import load_dotenv
import os

### first backend tests file ###

### user tests

@pytest.fixture
def test_app():
    load_dotenv()

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

def test_login_user_invalid(client):
    response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'different_password'
    })
    
    assert response.status_code == 401
    assert response.get_data(as_text=True) == 'Invalid username or password'

def test_login_user(client):
    response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'Login successful'

def test_check_login(client: FlaskClient):
    response: Response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })

    response: Response = client.get('/check_login')
    assert response._status_code == 200
    assert response.get_data(as_text=True) == 'Logged in as test_user'

def test_logout(client):
    response = client.get('/logout')
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'Logged out successfully'

def test_delete_user(client):
    response: Response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })

    response = client.post('/delete_account', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'User account deleted successfully'

