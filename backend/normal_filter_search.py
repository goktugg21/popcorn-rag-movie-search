import csv
from typing import Dict, List

#helper functions
def clean_pipe_separated(field_value: str) -> List[str]:
    """
    Converting pipe-separated values to list by splitting
    
    Args:
        field_value (str): Pipe-separated string to be converted to list
        
    Returns:
        List[str]: List of cleaned string items
    """
    if not field_value:
        return []
    
    items: List[str] = field_value.split('|')
    cleaned_items: List[str] = [item.strip() for item in items if item.strip()]
    return cleaned_items

def load_all_movies_from_csv() -> List[Dict[str, any]]:
    """
    Loading all movies from CSV file and structuring data for filtering
    
    Returns:
        List[Dict[str, any]]: List of movie dictionaries with structured data
    """
    movies: List[Dict[str, any]] = []
    
    with open('/Users/goktugyildirim/Desktop/VU_6th_Period/tmdb_movies_data.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            movie: Dict[str, any] = {
                'title': row['original_title'],
                'release_year': int(row['release_year']) if row['release_year'] else 0,
                'director': row.get('director', ''),
                'vote_average': float(row['vote_average']) if row['vote_average'] else 0.0,
                'vote_count': int(row['vote_count']) if row['vote_count'] else 0,
                'runtime': int(row['runtime']) if row['runtime'] else 0,
                
                # cleaning pipe-separated fields for easier processing
                'genres': clean_pipe_separated(row.get('genres', '')),
                'cast': clean_pipe_separated(row.get('cast', '')),
                'keywords': clean_pipe_separated(row.get('keywords', '')),
                'production_companies': clean_pipe_separated(row.get('production_companies', '')),
                
                'details': {
                    'tagline': row.get('tagline', ''),
                    'overview': row.get('overview', ''),
                    'release_date': row.get('release_date', '')
                }
            }
            movies.append(movie)
    
    return movies

def genre_filter(*genres: str) -> Dict[str, any]:
    """
    Filtering movies by genres and returning structured results for frontend
    
    Args:
        *genres (str): Variable number of genre strings to filter by
        
    Returns:
        Dict[str, any]: Dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating input parameters before processing
    if len(genres) == 0:
        raise ValueError("At least one genre required")
    if len(genres) > 5:
        return {"error": "Maximum 5 genres allowed"}
    
    # cleaning and deduplicating genre inputs
    clean_genres: List[str] = []
    for genre in genres:
        if genre.strip() and genre not in clean_genres:
            clean_genres.append(genre.strip().lower())

    movies: List[Dict[str, any]] = load_all_movies_from_csv()

    # finding movies that match ANY of the target genres
    matching_movies: Dict[str, Dict[str, any]] = {}
    for movie in movies:
        movie_genres: List[str] = [g.lower() for g in movie['genres']]
        
        # checking if movie has any of the target genres
        if any(target_genre in movie_genres for target_genre in clean_genres):
            matching_movies[movie['title']] = {
                'release_year': movie['release_year'],
                'vote_average': movie['vote_average'],
                'vote_count': movie['vote_count'],
                'runtime': movie['runtime'],
                'genres': movie['genres'],
                'director': movie['director'],
                'hidden_details': {
                    'cast': movie['cast'],
                    'keywords': movie['keywords'],
                    'production_companies': movie['production_companies'],
                    'tagline': movie['details']['tagline'],
                    'overview': movie['details']['overview'],
                    'release_date': movie['details']['release_date']
                }
            }
    
    # sorting after collecting all matches and limiting to top 150 movies
    sorted_movies: Dict[str, Dict[str, any]] = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
    return sorted_movies

def year_filter(start_year: int, end_year: int = None) -> Dict[str, any]:
    """
    Filtering movies by year or year range and returning structured results
    
    Args:
        start_year (int): Starting year for the filter range
        end_year (int, optional): Ending year for the filter range. If None, only start_year is used
        
    Returns:
        Dict[str, any]: Dictionary with movie titles as keys and movie data as values
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
    
    movies: List[Dict[str, any]] = load_all_movies_from_csv()
    
    # finding movies within the year range
    matching_movies: Dict[str, Dict[str, any]] = {}
    for movie in movies:
        movie_year: int = movie['release_year']
        
        if start_year <= movie_year <= end_year:
            matching_movies[movie['title']] = {
                'release_year': movie['release_year'],
                'vote_average': movie['vote_average'],
                'vote_count': movie['vote_count'],
                'runtime': movie['runtime'],
                'genres': movie['genres'],
                'director': movie['director'],
                'hidden_details': {
                    'cast': movie['cast'],
                    'keywords': movie['keywords'],
                    'production_companies': movie['production_companies'],
                    'tagline': movie['details']['tagline'],
                    'overview': movie['details']['overview'],
                    'release_date': movie['details']['release_date']
                }
            }
    
    # sorting after collecting all matches and limiting to top 150 movies
    sorted_movies: Dict[str, Dict[str, any]] = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
    return sorted_movies

def director_filter(director_name: str) -> Dict[str, any]:
    """
    Filtering movies by director name and returning structured results
    
    Args:
        director_name (str): Director name to search for (partial matching supported)
        
    Returns:
        Dict[str, any]: Dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating director name length
    if len(director_name.strip()) < 3:
        return {"error": "Director name must be at least 3 characters"}
    
    target_director: str = director_name.strip().lower()
    movies: List[Dict[str, any]] = load_all_movies_from_csv()
    
    # finding movies with matching director
    matching_movies: Dict[str, Dict[str, any]] = {}
    for movie in movies:
        movie_director: str = movie['director'].lower()
        
        if target_director in movie_director:
            matching_movies[movie['title']] = {
                'release_year': movie['release_year'],
                'vote_average': movie['vote_average'],
                'vote_count': movie['vote_count'],
                'runtime': movie['runtime'],
                'genres': movie['genres'],
                'director': movie['director'],
                'hidden_details': {
                    'cast': movie['cast'],
                    'keywords': movie['keywords'],
                    'production_companies': movie['production_companies'],
                    'tagline': movie['details']['tagline'],
                    'overview': movie['details']['overview'],
                    'release_date': movie['details']['release_date']
                }
            }
    
    # sorting after collecting all matches and limiting to top 150 movies
    sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
    return sorted_movies

def rating_filter(minimum_rating: float) -> Dict[str, any]:
    """
    Filtering movies by minimum rating and returning structured results
    
    Args:
        minimum_rating (float): Minimum vote average rating (0.0 to 10.0)
        
    Returns:
        Dict[str, any]: Dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating rating input
    if minimum_rating < 0.0:
        return {"error": "Rating cannot be negative"}
    if minimum_rating > 10.0:
        return {"error": "Rating cannot be above 10.0"}
    
    movies: List[Dict[str, any]] = load_all_movies_from_csv()
    
    # finding movies with rating >= minimum_rating
    matching_movies: Dict[str, Dict[str, any]] = {}
    for movie in movies:
        movie_rating: float = movie['vote_average']
        
        if movie_rating >= minimum_rating:
            matching_movies[movie['title']] = {
                'release_year': movie['release_year'],
                'vote_average': movie['vote_average'],
                'vote_count': movie['vote_count'],
                'runtime': movie['runtime'],
                'genres': movie['genres'],
                'director': movie['director'],
                'hidden_details': {
                    'cast': movie['cast'],
                    'keywords': movie['keywords'],
                    'production_companies': movie['production_companies'],
                    'tagline': movie['details']['tagline'],
                    'overview': movie['details']['overview'],
                    'release_date': movie['details']['release_date']
                }
            }
    
    # sorting after collecting all matches and limiting to top 150 movies
    sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
    return sorted_movies

def keyword_filter(*keywords: str) -> Dict[str, any]:
    """
    Filtering movies by keywords and returning structured results
    
    Args:
        *keywords (str): Variable number of keyword strings to filter by
        
    Returns:
        Dict[str, any]: Dictionary with movie titles as keys and movie data as values,
                       or error dictionary if validation fails
    """
    # validating input parameters
    if len(keywords) == 0:
        raise ValueError("At least one keyword required")
    if len(keywords) > 5:
        return {"error": "Maximum 5 keywords allowed"}
    
    # cleaning and deduplicating keyword inputs
    clean_keywords: List[str] = []
    for keyword in keywords:
        if keyword.strip() and keyword not in clean_keywords:
            clean_keywords.append(keyword.strip().lower())
    
    movies: List[Dict[str, any]] = load_all_movies_from_csv()
    
    # finding movies that match ANY of the target keywords
    matching_movies: Dict[str, Dict[str, any]] = {}
    for movie in movies:
        movie_keywords: List[str] = [k.lower() for k in movie['keywords']]
        
        # checking if movie has any of the target keywords
        if any(target_keyword in movie_keywords for target_keyword in clean_keywords):
            matching_movies[movie['title']] = {
                'release_year': movie['release_year'],
                'vote_average': movie['vote_average'],
                'vote_count': movie['vote_count'],
                'runtime': movie['runtime'],
                'genres': movie['genres'],
                'director': movie['director'],
                'hidden_details': {
                    'cast': movie['cast'],
                    'keywords': movie['keywords'],
                    'production_companies': movie['production_companies'],
                    'tagline': movie['details']['tagline'],
                    'overview': movie['details']['overview'],
                    'release_date': movie['details']['release_date']
                }
            }
    
    # sorting after collecting all matches and limiting to top 150 movies
    sorted_movies = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
    return sorted_movies