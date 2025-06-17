from sqlalchemy import create_engine, insert, select, delete
from dotenv import load_dotenv
from flask import Flask, request, make_response
from models.Base import Base
import models.User as User
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
import jwt
from flask import jsonify
from flask import Response as FlaskResponse
import flask
from models.Base import Base
from sqlalchemy import create_engine
from dotenv import load_dotenv
from models.Base import Base
from utils.tropes import add_trope

import os
from sqlalchemy import text
from models.movieModel import Movie
from utils.rag_tools import create_index, load_movies_from_csv, chat, getQEngine
from sqlalchemy.engine import Engine
from llama_index.core.base.response.schema import Response

app: Flask = Flask(__name__)

load_dotenv()
# Create the database engine and initialize the tables
engine: Engine = create_engine(os.getenv("PG_URL"))



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
    
@app.route('/logout', methods=['GET'])
def logout():

    response = make_response('Logged out successfully')
    response.set_cookie('token', '', expires=0, httponly=True, secure=True, samesite='Lax')
    return response, 200


@app.post('/chat')
def aiSearch() -> FlaskResponse:
    """
    Endpoint to handle AI search queries.
    Returns:
        Response: A dictionary containing the response of the AI and the movies found.
    """
    data = request.get_json()
    query: str = data.get("query")
    if query is None or query.strip() == "":
        return jsonify({"error": "Query cannot be empty"}), 400
    chat_res: Response = chat(query, getQEngine())
    chat_res_text = chat_res.response
    movies_found = [movie.metadata.get("imdb_id") for movie in chat_res.source_nodes]
    return jsonify({"response": chat_res_text, "movie_ids": movies_found}), 200


if __name__ == '__main__':
    # Create vector extension if it doesn't exist
    with engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        connection.commit()
        Base.metadata.create_all(engine)
        res = connection.execute(select(Movie))
        add_trope("movie","100",connection)
    
    # If the movies table is empty, create the index and populate the table from the CSV file
    if(res.all() == []):
        create_index(load_movies_from_csv(os.getenv("MOVIE_CSV_FILE")))
    
    # Set up the Flask app
    app.run(debug=True)
