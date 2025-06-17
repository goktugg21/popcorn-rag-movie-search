import os
from sqlalchemy import create_engine, insert, select, delete
from dotenv import load_dotenv
from flask import Flask, request, make_response
from models.Base import Base
import models.User as User
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
import jwt

app = Flask(__name__)

load_dotenv()
engine = create_engine(os.getenv('PG_URL'))
Base.metadata.create_all(engine)

@app.route('/register', methods=['POST'])
def register():
    """
    Register a new user,
    Checks if username already exists.
    Checks if username or password is left empty.
    """
    post_data = request.get_json()

    password = generate_password_hash(post_data['password'])
    username = post_data['username']

    if not username or not password:
        return 'Username and password cannot be empty', 400
    
    
    stmp = select(User).where(User.username == username)
   
    connection = engine.connect() 
    res = connection.execute(stmp)
    if len(res.all()) > 0:
        return 'User already exists', 400

    connection.execute(insert(User).values(username=post_data['username'], user_password=password))
    connection.commit()

    return 'User registered successfully', 200

@app.route('/delete_account', methods=['POST'])
def delete_account():
    """
    Delete a user account.
    """
    user_data = request.get_json()

    username = user_data['username']
    password = user_data['password']
    
    stmp = select(User).where(User.username == username)
    connection = engine.connect()

    res = connection.execute(stmp).first()

    if not res or not check_password_hash(res.user_password, password):
        return 'Invalid username or password', 401

    connection.execute(delete(User).where(User.username == username and User.user_password == res.user_password))
    connection.commit()

    return 'User account deleted successfully', 200


@app.route('/login', methods=['POST'])
def login():
    """
    Log in a user.
    """
    user_data = request.get_json()

    username = user_data['username']
    password = user_data['password']

    stmp = select(User).where(User.username == username)
    connection = engine.connect()

    res = connection.execute(stmp).first()

    if not res or not check_password_hash(res.user_password, password):
        return 'Invalid username or password', 401
    
    # Create JWT token
    token = jwt.encode({
        'id': res.id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=1)
    }, os.getenv('SECRET_KEY'), algorithm='HS256')

    response = make_response('Login successful')
    response.set_cookie(
        'token',
        token,
        max_age=3600, 
        httponly=True,
        secure=False,
        samesite='Lax'
    )

    return response, 200

@app.route('/check_login', methods=['GET'])
def check_login():
    token = request.cookies.get('token')

    if not token:
        return 'Token missing', 401
    
    try:
        decoded = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
        id = decoded['id']
        
        stmp = select(User).where(User.id==id)
        connection = engine.connect()
        res = connection.execute(stmp).first()

        if not res:
            return 'User not found', 401
        return f'Logged in as {res.username}', 200
    
    except Exception:
        return 'Invalid or expired token', 401
    
@app.route('/logout', methods=['POST'])
def logout():

    response = make_response('Logged out successfully')
    response.set_cookie('token', '', expires=0, httponly=True, secure=True, samesite='Lax')
    return response, 200


if __name__ == "__main__":
    app.run(debug=True)