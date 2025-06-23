from sqlalchemy import create_engine, insert, select, delete
from dotenv import load_dotenv
from flask import Flask, request, make_response
from models.Favourite import Favourite
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
from utils.tropes import add_trope, trope_filter, movies_with_trope, movie_display, movie_display_extra
from typing import Optional, Tuple
import os
from sqlalchemy import text
from models.movieModel import Movie
from utils.rag_tools import create_index, load_movies_from_csv, chat, getQEngine
from utils.regular_filter_search import all_filters_combined
from utils.regular_filter_search import keyword_filter, genre_filter, year_filter, director_filter, rating_filter
from sqlalchemy.engine import Engine
from llama_index.core.base.response.schema import Response
from flask_cors import CORS



app: Flask = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:8000", "http://localhost:5001"])

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
    
    connection = engine.connect()
    stmp = select(User).where(User.username == username)
    res = connection.execute(stmp).first()

    if not res or not check_password_hash(res.user_password, password):
        return 'Invalid username or password', 401

    connection.execute(delete(Favourite).where(Favourite.user_id == res.id))
    connection.execute(delete(User).where(User.id == res.id))

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

def check_login() -> Tuple[Optional[int], Optional[str], int]:
    token = request.cookies.get('token')

    if not token:
        return None, 'Token missing', 401
    
    try:
        decoded = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
        id = decoded['id']
        
        stmp = select(User).where(User.id==id)
        connection = engine.connect()
        res = connection.execute(stmp).first()

        if not res:
            return None, 'User not found', 401
        return id, None, 200
    
    except Exception:
        return None, 'Invalid or expired token', 401
    
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
    print('Received /chat request')
    data = request.get_json()
    query: str = data.get("query")
    print('Query:', query)
    if query is None or query.strip() == "":
        print('Query is empty')
        return jsonify({"error": "Query cannot be empty"}), 400
    print('Calling chat()...')
    chat_res: Response = chat(query, getQEngine())
    print('Chat response:', chat_res)
    chat_res_text = chat_res.response
    movies_found = [movie.metadata.get("imdb_id") for movie in chat_res.source_nodes]
    print('Movies found:', movies_found)
    return jsonify({"response": chat_res_text, "movie_ids": movies_found}), 200


@app.route('/movie', methods=['GET'])
def get_movie():
    """
    Get a movie by its ID.
    """
    movie_id = request.args.get('id')
    movie_imdb_id = request.args.get('imdb_id')
    
    if movie_id:
        stmp = select(Movie).where(Movie.id == movie_id)
    elif movie_imdb_id:
        stmp = select(Movie).where(Movie.imdb_id == movie_imdb_id)
    else:
        return 'Movie ID or IMDb ID is required', 400    
    
    with engine.connect() as connection:
        res = connection.execute(stmp)
        row = res.first()
        if row is None:
            return 'Movie not found', 404
        result = dict(row._mapping)
        print(result)
        return {
            'id': result.get('id'),
            'imdb_id': result['imdb_id'],
            'original_title': result['original_title'],
            'popularity': result['popularity'],
            'overview': result.get('text'),
            'release_date': result['release_date'],
            'budget': result['budget'],
            'character_tropes': result.get('character_tropes')
            
        }, 200

@app.route('/add_favourite', methods=['POST'])
def add_favourite():
    try:
        user_id, error_msg, error_code = check_login()
        if error_msg:
            return error_msg, error_code
        
        data = request.get_json()
        movie_id = data.get('movie_id')
        
        if not movie_id:
            return 'Movie ID is required', 400
            
        try:
            movie_id = int(movie_id)
        except (TypeError, ValueError):
            return 'Invalid movie ID', 400

        conn = engine.connect()
        stmt = insert(Favourite).values(user_id=user_id, movie_id=movie_id)
        res = conn.execute(stmt)
        conn.commit()
        conn.close()

        return 'Favourite added successfully', 200
    except Exception as e:
        print(f"Error in add_favourite: {str(e)}")
        return f'Server error: {str(e)}', 500

@app.route('/delete_favourite', methods=['POST'])
def delete_favourite():
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    data = request.get_json()
    movie_id = data.get('movie_id')

    conn = engine.connect()
    stmt = delete(Favourite).where(user_id==user_id , movie_id==movie_id)
    res = conn.execute(stmt)

    if res.rowcount == 0:
        return 'Favourite not found', 404

    conn.commit()

    return 'Favourite deleted successfully', 200

@app.route('/add_trope', methods=['POST'])
def add_trope_route():
    """
    Endpoint to add a trope to a movie.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    data = request.get_json()
    user_trope = data.get('user_trope')
    selected_movie_id = data.get('selected_movie_id')

    if not user_trope or not selected_movie_id:
        return 'Movie has to be selected and character trope cannot be empty', 400

    with engine.connect() as connection:
        add_trope(user_trope, selected_movie_id, connection)

    return 'Trope added successfully', 200

@app.route('/trope_filter', methods=['GET'])
def trope_filter_route():
    """
    Endpoint to filter movies by character tropes.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    with engine.connect() as connection:
        results = trope_filter(connection)

    movies = [movie for movie in results]
    
    response = []
    for movie in movies:
        movie_data = {
            'id': movie.id,
            'character_tropes': movie.character_tropes,
            'original_title': movie.original_title
        }
        response.append(movie_data)

    return jsonify(response), 200

@app.route('/movies_with_trope', methods=['GET'])
def movies_with_trope_route():
    """
    Endpoint to get movies with a specific character trope.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code

    # For GET, get user_trope from query string
    user_trope = request.args.get('user_trope')
    if not user_trope:
        return 'Character trope cannot be empty', 400
    else:
        user_trope = user_trope.capitalize()
        
    with engine.connect() as connection:
        results = movies_with_trope(user_trope, connection)

    movies = [movie for movie in results]
    
    response = []
    for movie in movies:
        movie_data = {
            'id': movie.id,
            'character_tropes': movie.character_tropes,
            'original_title': movie.original_title
        }
        response.append(movie_data)
    if not response:
        return jsonify({"message": "No movies found with the specified trope"}), 404
    return jsonify(response), 200

@app.route('/search', methods=['POST'])
def search_movies():
    """
    Endpoint to search for movies with various filters.
    """
    data = request.get_json()
    query: str = data.get('query')
    keyword: list = data.get('keyword')
    genres: list = data.get('genres')
    year: list = data.get('year')
    director: list = data.get('director')
    rating: float = data.get('rating')

    return jsonify(all_filters_combined(query, keyword, genres, year, director, rating)), 200

@app.route('/search_per_filter', methods=['POST'])
def search_movies_per_filter():
    data = request.get_json()
    if data.get('keyword'):
        return jsonify(keyword_filter(*data['keyword'])), 200
    elif data.get('genres'):
        return jsonify(genre_filter(*data['genres'])), 200
    elif data.get('year'):
        y = data['year']
        if len(y) == 1:
            return jsonify(year_filter(y[0])), 200
        elif len(y) == 2:
            return jsonify(year_filter(y[0], y[1])), 200
        else:
            return jsonify({'error': 'Invalid year format'}), 400
    elif data.get('director'):
        return jsonify(director_filter(data['director'])), 200
    elif data.get('rating') is not None:
        return jsonify(rating_filter(float(data['rating']))), 200
    else:
        return jsonify({'error': 'No valid filter provided'}), 400
    
@app.route('/get_favourites', methods=['GET'])
def get_favourites():
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code

    response = []
    with engine.connect() as connection:
        stmt = select(Favourite).where(Favourite.user_id == user_id)
        res = connection.execute(stmt)
        favourites = res.fetchall()

        if not favourites:
            return jsonify([]), 200

        for favourite in favourites:
            movie_stmt = select(Movie).where(Movie.id == favourite.movie_id)
            movie_res = connection.execute(movie_stmt).first()
            if movie_res:
                movie_data = {
                    'id': movie_res.id,
                    'imdb_id': movie_res.imdb_id,
                    'original_title': movie_res.original_title,
                    'popularity': movie_res.popularity,
                    'overview': movie_res.text,
                    'release_date': movie_res.release_date,
                    'budget': movie_res.budget,
                    'character_tropes': movie_res.character_tropes
                }
                response.append(movie_data)

    return jsonify(response), 200

@app.route('/movie_display', methods=['GET'])
def movie_display_route():
    """
    Endpoint to display movie details by ID.
    """
    movie_id = request.args.get("id")
    if not movie_id:
        return 'Movie ID is required', 400

    try:
        movie_id = int(movie_id)
    except ValueError:
        return 'Invalid Movie ID', 400

    with engine.connect() as connection:
        result = movie_display(movie_id, connection)

    if not result:
        return 'Movie not found', 404

    return jsonify(result), 200

@app.route('/movie_display_extra', methods=['GET'])
def movie_display_extra_route():
    """
    Endpoint to display all movie details by ID.
    """
    movie_id = request.args.get("id")
    if not movie_id:
        return 'Movie ID is required', 400

    try:
        movie_id = int(movie_id)
    except ValueError:
        return 'Invalid Movie ID', 400

    with engine.connect() as connection:
        result = movie_display_extra(movie_id, connection)

    if not result:
        return 'Movie not found', 404

    return jsonify(result), 200

if __name__ == '__main__':
    # Create vector extension if it doesn't exist
    with engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        connection.commit()
        Base.metadata.create_all(engine)
        res = connection.execute(select(Movie))

    # If the movies table is empty, create the index and populate the table from the CSV file
    if(res.all() == []):
        create_index(load_movies_from_csv(os.getenv("MOVIE_CSV_FILE")))
    
    # Set up the Flask app
   
    app.run(debug=True, port=5001)
