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
from utils.tropes import add_trope, trope_filter, movies_with_trope, movie_display
from typing import Optional, Tuple
import os
from sqlalchemy import text
from models.movieModel import Movie
from utils.rag_tools import create_index, load_movies_from_csv, chat, getQEngine
from utils.regular_filter_search import all_filters_combined
from sqlalchemy.engine import Engine
from llama_index.core.base.response.schema import Response
from flask_cors import CORS
from flask import send_from_directory
import requests

app: Flask = Flask(__name__)
CORS(app, supports_credentials=True)
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

    response = make_response(jsonify({'message': 'Login successful'}))
    response.set_cookie(
        'token',
        token,
        max_age=3600, 
        httponly=True,
        secure=False,
        samesite='Lax',
        path='/'
    )

    return response, 200

def check_login() -> Tuple[Optional[int], Optional[str], int]:
    token = request.cookies.get('token')
    print(f"Cookie token: {token}")  

    if not token:
        return None, 'Token missing', 401
    
    try:
        decoded = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
        id = decoded['id']
        print(f"Cookie token: {token}") 

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
    print("Logout endpoint called")
    response = make_response('Logged out successfully')
    response.set_cookie('token', '', expires=0, httponly=True, secure=False, samesite='Lax', path='/')
    print("Logout response created")
    return response, 200

@app.route('/user_info', methods=['GET'])
def get_user_info():
    """
    Get current user information.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    stmp = select(User).where(User.id == user_id)
    connection = engine.connect()
    res = connection.execute(stmp).first()
    
    if not res:
        return 'User not found', 404
    
    return {
        'id': res.id,
        'username': res.username
    }, 200

@app.route('/favorites', methods=['GET'])
def get_user_favorites():
    """
    Get current user's favorite movies.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    # Get user's favorite movie IDs
    fav_stmt = select(Favourite).where(Favourite.user_id == user_id)
    connection = engine.connect()
    fav_results = connection.execute(fav_stmt).all()
    
    favorite_movies = []
    for fav in fav_results:
        # Get movie details for each favorite
        movie_stmt = select(Movie).where(Movie.id == fav.movie_id)
        movie_result = connection.execute(movie_stmt).scalars().first()
        
        if movie_result:
            movie = movie_result
            favorite_movies.append({
                'id': movie.id,
                'title': movie.original_title,
                'release_year': movie.release_year,
                'vote_average': movie.vote_average,
                'genres': movie.genres,
                'overview': movie.text
            })
    
    return jsonify(favorite_movies), 200

@app.post('/chat')
def aiSearch() -> FlaskResponse:
    """
    Endpoint to handle AI search queries.
    Returns:
        Response: A dictionary containing the response of the AI and the movies found.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    data = request.get_json()
    query: str = data.get("query")
    if query is None or query.strip() == "":
        return jsonify({"error": "Query cannot be empty"}), 400
    
    try:
        chat_res: Response = chat(query, getQEngine())
        chat_res_text = chat_res.response
        
        # Extract movie IDs from source nodes
        movie_ids = []
        with engine.connect() as connection:
            for node in chat_res.source_nodes:
                node_id = node.node_id
                if node_id:
                    stmt = select(Movie).where(Movie.node_id == node_id)
                    result = connection.execute(stmt).scalars().first()
                    if result:
                        movie_ids.append(result.id)
                if len(movie_ids) >= 9:
                    break
        return jsonify({
            "response": chat_res_text, 
            "movie_ids": movie_ids[:9]
        }), 200
    except Exception as e:
        print(f"AI Search error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"AI search failed: {str(e)}"}), 500


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
        res = connection.execute(stmp).scalars().first()
        if res is None:
            return 'Movie not found', 404
        result = res
        print(result)
        return {
            'id': result.id,
            'imdb_id': result.imdb_id,
            'original_title': result.original_title,
            'popularity': result.popularity,
            'overview': result.text,
            'release_date': result.release_date,
            'budget': result.budget,
            'character_tropes': result.character_tropes,
            'revenue': result.revenue,
            'cast': result.stars,
            'homepage': result.homepage,
            'director': result.director,
            'tagline': result.tagline,
            'keywords': result.keywords,
            'runtime': result.runtime,
            'genres': result.genres,
            'release_date': result.release_date,
            'vote_count': result.vote_count,
            'vote_average': result.vote_average,
            'release_year': result.release_year,
            'character_tropes': result.character_tropes
        }, 200

@app.route('/add_favourite', methods=['POST'])
def add_favourite():
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code
    
    data = request.get_json()
    movie_id = data.get('movie_id')

    conn = engine.connect()
    stmt = insert(Favourite).values(user_id=user_id, movie_id=movie_id)
    res = conn.execute(stmt).first()
    conn.commit()


    return 'Favourite added successfully', 200

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

@app.route('/movies_with_trope', methods=['POST'])
def movies_with_trope_route():
    """
    Endpoint to get movies with a specific character trope.
    """
    user_id, error_msg, error_code = check_login()
    print(user_id, error_msg, error_code)
    if error_msg:
        return error_msg, error_code
    
    data = request.get_json()
    user_trope: str = data.get('user_trope')    

    if not user_trope:
        return 'Character trope cannot be empty', 400
    else:
        user_trope = user_trope.capitalize()
        
    with engine.connect() as connection:
        results = movies_with_trope(user_trope, connection)

    movies = [movie for movie in results]
    print(movies)
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
    print(f"Search request data: {data}")
    
    query: str = data.get('query')
    keyword: list = data.get('keyword')
    genres: list = data.get('genres')
    year: list = data.get('year')
    director: str = data.get('director')
    rating: float = data.get('rating')

    try:
        from utils.regular_filter_search import filtered_search_flexible
        result = filtered_search_flexible(query, keyword, genres, year, director, rating)
        print(f"Search result: {len(result)} movies found")
        # Return a list of dicts with at most 9 movies
        movies = list(result.values())[:9]
        return jsonify([{**v, 'id': v['id']} for v in movies]), 200
    except Exception as e:
        print(f"Search error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/movie_display', methods=['GET'])
def movie_display_route():
    """
    Endpoint to display movie details by ID.
    """
    user_id, error_msg, error_code = check_login()
    if error_msg:
        return error_msg, error_code

    movie_id = request.args.get("id")
    if not movie_id:
        return 'Movie ID is required', 400

    with engine.connect() as connection:
        result = movie_display(movie_id, connection)

    if not result:
        return 'Movie not found', 404

    return jsonify(result), 200

@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)
    
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
