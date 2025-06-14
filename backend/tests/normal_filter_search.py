import csv
from typing import Dict, List

def clean_pipe_separated(field_value: str)->List[str]:
    if not field_value:
        return []
    
    items: List[str] = field_value.split('|')
    cleaned_items: List[str] = [item.strip() for item in items if item.strip()]
    return cleaned_items

def load_all_movies_from_csv()->List[Dict[str, any]]:
    """loading all movies from CSV file and structuring data for filtering"""
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

def genre_filter(*genres: str)->Dict[str, any]:
    """filtering movies by genres and returning structured results for frontend"""
    # validating input parameters before processing
    if len(genres) == 0:
        raise ValueError("At least one genre required")
    if len(genres) > 5:
        return {"error": "Maximum 5 genres allowed"}
    
    # cleaning and deduplicating genre inputs
    clean_genres: List[str] = []
    for genre in genres:
        if genre.strip() and genre not in clean_genres:
            clean_genres.append(genre.strip())
    
    num_genres: int = len(clean_genres)
    
    if num_genres == 1:
        movies: List[Dict[str, any]] = load_all_movies_from_csv()
        target_genre: str = clean_genres[0].lower()
        
        # finding movies that match the target genre
        matching_movies: Dict[str, Dict[str, any]] = {}
        for movie in movies:
            movie_genres: List[str] = [g.lower() for g in movie['genres']]
            if target_genre in movie_genres:
                matching_movies[movie['title']] = {
                    'release_year': movie['release_year'],
                    'vote_average': movie['vote_average'],
                    'vote_count': movie['vote_count'],
                    'runtime': movie['runtime'],
                    'genres': movie['genres'],
                    'hidden_details': {
                        'director': movie['director'],
                        'cast': movie['cast'],
                        'keywords': movie['keywords'],
                        'production_companies': movie['production_companies'],
                        'tagline': movie['details']['tagline'],
                        'overview': movie['details']['overview'],
                        'release_date': movie['details']['release_date']
                    }
                }
        
        # sorting by rating and limiting to top 150 movies
        sorted_movies: Dict[str, Dict[str, any]] = dict(sorted(matching_movies.items(), key=lambda x: x[1]['vote_average'], reverse=True)[:150])
        return sorted_movies
    
    else:
        return {"error": f"Support for {num_genres} genres not implemented yet"}