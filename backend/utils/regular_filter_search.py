import os
from typing import Dict, List, Optional
from sqlalchemy import create_engine, select, and_, or_
from sqlalchemy.orm import sessionmaker
from backend.models.movieModel import Movie

def get_db_session():
    """
    create database session using environment variable for connection
    
    returns:
        session: sqlalchemy session object
    """
    engine = create_engine(os.getenv("PG_URL"))
    Session = sessionmaker(bind=engine)
    return Session()

def clean_pipe_separated(field_value: str)-> List[str]:
    """
    converting pipe-separated values to list by splitting
    
    args:
        field_value (str): pipe-separated string to be converted to list
        
    returns:
        list[str]: list of cleaned string items
    """
    if not field_value:
        return []
    
    items: List[str] = field_value.split('|')
    cleaned_items: List[str] = [item.strip() for item in items if item.strip()]
    return cleaned_items

def format_movie_result(movie: Movie)-> Dict[str, any]:
    """
    format a movie object into the expected dictionary structure
    
    args:
        movie (Movie): sqlalchemy movie object
        
    returns:
        dict[str, any]: formatted movie data dictionary
    """
    # parse metadata if it exists
    metadata = movie.metadata_ if movie.metadata_ else {}
    
    # extract data from metadata or direct fields, preferring direct fields
    keywords_list = clean_pipe_separated(movie.keywords or metadata.get('keywords', ''))
    stars_list = clean_pipe_separated(movie.stars or metadata.get('stars', ''))
    genres_list = clean_pipe_separated(movie.genres or metadata.get('genres', ''))
    
    # get production companies from metadata if available
    production_companies = []
    if 'production_companies' in metadata:
        production_companies = clean_pipe_separated(metadata['production_companies'])
    
    return {
        'release_year': movie.release_year or metadata.get('release_year', 0),
        'vote_average': movie.vote_average or metadata.get('vote_average', 0.0),
        'vote_count': movie.vote_count or metadata.get('vote_count', 0),
        'runtime': movie.runtime or metadata.get('runtime', 0),
        'genres': genres_list,
        'director': movie.director or metadata.get('director', ''),
        'hidden_details': {
            'stars': stars_list,
            'keywords': keywords_list,
            'production_companies': production_companies,
            'tagline': movie.tagline or metadata.get('tagline', ''),
            'overview': metadata.get('overview', ''),
            'release_date': str(movie.release_date) if movie.release_date else metadata.get('release_date', ''),
            'character_tropes': movie.character_tropes or metadata.get('character_tropes', '')
        }
    }

def genre_filter(*genres: str) -> Dict[str, any]:
    """
    filtering movies by genres and returning structured results for frontend
    
    args:
        *genres (str): variable number of genre strings to filter by
        
    returns:
        dict[str, any]: dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating input parameters before processing
    if len(genres) == 0:
        raise ValueError("at least one genre required")
    if len(genres) > 5:
        return {"error": "maximum 5 genres allowed"}
    
    # cleaning and deduplicating genre inputs
    clean_genres: List[str] = []
    for genre in genres:
        if genre.strip() and genre.strip().lower() not in [g.lower() for g in clean_genres]:
            clean_genres.append(genre.strip().lower())

    session = get_db_session()
    try:
        
        # finding movies that match any of the target genres
        genre_conditions = []
        for genre in clean_genres:
            # check both direct field and metadata
            genre_conditions.append(Movie.genres.ilike(f'%{genre}%'))
        
        query = select(Movie).where(or_(*genre_conditions)).order_by(Movie.vote_average.desc())
        result = session.execute(query)
        movies = result.scalars().all()
        
        # sorting after collecting all matches and limiting to top 150 movies
        matching_movies: Dict[str, Dict[str, any]] = {}
        for movie in movies:
            matching_movies[movie.original_title]=format_movie_result(movie)

        sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
        return sorted_movies
        
    finally:
        session.close()

def year_filter(start_year: int, end_year: Optional[int] = None) -> Dict[str, any]:
    """
    filtering movies by year or year range and returning structured results
    
    args:
        start_year (int): starting year for the filter range
        end_year (int, optional): ending year for the filter range. if none, only start_year is used
        
    returns:
        dict[str, any]: dictionary with movie titles as keys and movie data as values
    """
    # handling single year vs year range
    if end_year is None:
        end_year = start_year
    
    # validating year range
    if start_year > end_year:
        return {}  # invalid range returns empty
    
    # preventing future years beyond reasonable limit
    if start_year > 2030:
        return {}
    
    session = get_db_session()
    try:
        # finding movies within the year range
        query = select(Movie).where(
            and_(Movie.release_year >= start_year, Movie.release_year <= end_year)).order_by(Movie.vote_average.desc())
        
        result = session.execute(query)
        movies = result.scalars().all()
        
        # sorting after collecting all matches and limiting to top 150 movies
        matching_movies: Dict[str, Dict[str, any]] = {}
        for movie in movies:
            matching_movies[movie.original_title] = format_movie_result(movie)
        
        sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])

        return sorted_movies
        
    finally:
        session.close()

def director_filter(director_name: str)-> Dict[str, any]:
    """
    filtering movies by director name and returning structured results
    
    args:
        director_name (str): director name to search for (partial matching supported)
        
    returns:
        dict[str, any]: dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating director name length
    if len(director_name.strip()) < 3:
        return {"error": "director name must be at least 3 characters"}
    
    session = get_db_session()
    try:
        # finding movies with matching director
        query = select(Movie).where(Movie.director.ilike(f'%{director_name.strip()}%')).order_by(Movie.vote_average.desc())
        
        result = session.execute(query)
        movies = result.scalars().all()
        
        # sorting after collecting all matches and limiting to top 150 movies
        matching_movies: Dict[str, Dict[str, any]] = {}
        for movie in movies:
            matching_movies[movie.original_title] = format_movie_result(movie)
        
        sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])

        return sorted_movies
        
    finally:
        session.close()

def rating_filter(minimum_rating: float)->Dict[str, any]:
    """
    filtering movies by minimum rating and returning structured results
    
    args:
        minimum_rating (float): minimum vote average rating (0.0 to 10.0)
        
    returns:
        dict[str, any]: dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating rating input
    if minimum_rating < 0.0:
        return {"error": "rating cannot be negative"}
    if minimum_rating > 10.0:
        return {"error": "rating cannot be above 10.0"}
    
    session = get_db_session()
    try:
        # finding movies with rating >= minimum_rating
        query = select(Movie).where(
            Movie.vote_average >= minimum_rating).order_by(Movie.vote_average.desc())
        
        result = session.execute(query)
        movies = result.scalars().all()
        
        # sorting after collecting all matches and limiting to top 150 movies
        matching_movies: Dict[str, Dict[str, any]] = {}
        for movie in movies:
            matching_movies[movie.original_title] = format_movie_result(movie)
        
        sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
        return sorted_movies
        
    finally:
        session.close()

def keyword_filter(*keywords: str)->Dict[str, any]:
    """
    filtering movies by keywords and returning structured results
    
    args:
        *keywords (str): variable number of keyword strings to filter by
        
    returns:
        dict[str, any]: dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating input parameters
    if len(keywords) == 0:
        raise ValueError("at least one keyword required")
    if len(keywords) > 5:
        return {"error": "maximum 5 keywords allowed"}
    
    # cleaning and deduplicating keyword inputs
    clean_keywords: List[str] = []
    for keyword in keywords:
        if keyword.strip() and keyword.strip().lower() not in [k.lower() for k in clean_keywords]:
            clean_keywords.append(keyword.strip().lower())
    
    session = get_db_session()
    try:
        # finding movies that match any of the target keywords
        keyword_conditions = []
        for keyword in clean_keywords:
            keyword_conditions.append(Movie.keywords.ilike(f'%{keyword}%'))
        
        query = select(Movie).where(or_(*keyword_conditions)).order_by(Movie.vote_average.desc())
        result = session.execute(query)
        movies = result.scalars().all()
        
        # sorting after collecting all matches and limiting to top 150 movies
        matching_movies: Dict[str, Dict[str, any]] = {}
        for movie in movies:
            matching_movies[movie.original_title] = format_movie_result(movie)
        sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
        return sorted_movies
        
    finally:
        session.close()

