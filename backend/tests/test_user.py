from flask import Response
from flask.testing import FlaskClient
import pytest
from sqlalchemy import Engine, create_engine
from app import app
from dotenv import load_dotenv
import os
from models.Base import Base
from sqlalchemy import text



### first backend tests file ###

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

def test_add_favourite(client):    
    response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    response = client.post('/add_favourite', json={
        'movie_id': '1'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'Favourite added successfully'

def test_delete_favourite(client):
    response = client.post('/login', json={
        'username' : 'test_user',
        'password' : 'test_password'
    })
    response = client.post('/delete_favourite', json={
        'movie_id': '1'
    })
    
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'Favourite deleted successfully'

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

