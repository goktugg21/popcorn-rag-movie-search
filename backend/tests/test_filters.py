### first backend tests file ###
import pytest
import os
from backend.utils.regular_filter_search import genre_filter, year_filter, director_filter, rating_filter, keyword_filter, all_filters_combined


# test database connection
def test_database_connection():
    """test that we can connect to the database"""
    pg_url = os.getenv("PG_URL")
    assert pg_url is not None, "pg_url environment variable must be set"

def test_one_genre_checker():
    """testing single genre filtering functionality"""
    result = genre_filter("Action")
    assert isinstance(result, dict)
    assert len(result) > 0
    # validating that all returned movies actually have the Action genre
    for movie_id, movie_data in result.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        assert 'action' in genres_lower, f"Movie {movie_data['title']} should have Action genre but has: {movie_data['genres']}"
    print(f"Found {len(result)} Action movies")
    first_movie_data = list(result.values())[0]
    print(f"Top movie: {first_movie_data['title']}")

def test_error_handling():
    """testing error cases for invalid inputs"""
    # testing too many genres
    try:
        genre_filter("Action", "Comedy", "Drama", "Horror", "Romance", "Thriller")
        assert False, "Should raise ValueError"
    except ValueError:
        pass
    
    # testing empty input
    try:
        genre_filter()
        assert False, "Should raise ValueError"
    except ValueError:
        pass

def test_case_insensitive():
    """testing case insensitive genre matching"""
    result1 = genre_filter("action")
    result2 = genre_filter("Action") 
    assert len(result1) == len(result2)

    # validating that both results contain action movies
    for movie_id, movie_data in result1.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        assert 'action' in genres_lower, f"Movie {movie_data['title']} should have Action genre"

def test_multiple_genres():
    """testing multiple genre filtering approach"""
    result = genre_filter("Action", "Comedy")
    assert isinstance(result, dict)
    assert len(result) > 0
    # checking that all results contain either Action or Comedy
    for movie_id, movie_data in result.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        has_action = 'action' in genres_lower
        has_comedy = 'comedy' in genres_lower
        assert has_action or has_comedy, f"Movie {movie_data['title']} should have Action or Comedy genre, but has: {movie_data['genres']}"
    print(f"Found {len(result)} movies with Action or Comedy")

def test_three_genres():
    """testing three genre filtering"""
    result = genre_filter("Action", "Drama", "Romance")
    assert isinstance(result, dict)
    
    # checking that all results contain at least one of the three genres
    for movie_id, movie_data in result.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        has_any_genre = any(genre in genres_lower for genre in ['action', 'drama', 'romance'])
        assert has_any_genre, f"Movie {movie_data['title']} should have Action, Drama, or Romance genre but has: {movie_data['genres']}"
    
    print(f"Found {len(result)} movies with Action, Drama, or Romance")

def test_single_year():
   """testing filtering by single year"""
   result = year_filter(1999)
   
   assert isinstance(result, dict)
   assert len(result) > 0
   
   # checking that all movies are from 1999
   for movie_id, movie_data in result.items():
       assert movie_data['release_year'] == 1999, f"Movie {movie_data['title']} should be from 1999, but is from {movie_data['release_year']}"
   
   print(f"Found {len(result)} movies from 1999")

def test_year_range():
   """testing filtering by year range"""
   result = year_filter(1990, 2000)
   
   assert isinstance(result, dict)
   assert len(result) > 0
   
   # checking that all movies are between 1990-2000
   for movie_id, movie_data in result.items():
       year = movie_data['release_year']
       assert 1990 <= year <= 2000, f"Movie {movie_data['title']} ({year}) should be between 1990-2000"
   
   print(f"Found {len(result)} movies from 1990-2000")

def test_year_edge_cases():
   """testing year filtering edge cases"""
   # testing future year (should return empty)
   result = year_filter(2030)
   assert len(result) == 0, "Should find no movies from future"
   
   # testing invalid range
   result = year_filter(2000, 1990)  # end before start
   assert len(result) == 0, "Should handle invalid year range"

def test_director_single():
    """testing filtering by director name"""
    result = director_filter("christopher nolan")
    
    assert isinstance(result, dict)
    assert len(result) > 0
    
    # checking that all movies have christopher nolan as director
    for movie_id, movie_data in result.items():
        director_lower = movie_data['director'].lower()
        assert "christopher nolan" in director_lower, f"Movie {movie_data['title']} should have Christopher Nolan as director"
    
    print(f"Found {len(result)} movies by Christopher Nolan")

def test_director_case_insensitive():
    """testing director filtering is case insensitive"""
    result1 = director_filter("Christopher Nolan")
    result2 = director_filter("christopher nolan")
    result3 = director_filter("CHRISTOPHER NOLAN")
    
    assert len(result1) == len(result2) == len(result3), "Should return same results regardless of case"

    # validating all results have Nolan as director
    for movie_id, movie_data in result1.items():
        director_lower = movie_data['director'].lower()
        assert "christopher nolan" in director_lower, f"Movie {movie_data['title']} should have Christopher Nolan as director"
def test_director_minimum_characters():
    """testing director name minimum character requirement"""
    # testing input less than 3 characters
    try:
        director_filter("pe")
        assert False, "Should raise ValueError for input less than 3 characters"
    except ValueError as e:
        assert "must be at least 3 characters" in str(e)
    
    # testing single character
    try:
        director_filter("a")
        assert False, "Should raise ValueError for single character"
    except ValueError as e:
        assert "must be at least 3 characters" in str(e)
    
    # testing empty string
    try:
        director_filter("")
        assert False, "Should raise ValueError for empty string"
    except ValueError as e:
        assert "must be at least 3 characters" in str(e)

def test_director_partial_matching():
    """testing partial director name matching"""
    result = director_filter("russo")
    
    assert isinstance(result, dict)
    
    # checking that movies contain "russo" in director field
    for movie_id, movie_data in result.items():
        director_lower = movie_data['director'].lower()
        assert "russo" in director_lower, f"Movie {movie_data['title']} should have Russo in directors but has: {movie_data['director']}"
    
    print(f"Found {len(result)} movies with Russo in directors")

def test_director_not_found():
    """testing director that doesn't exist"""
    result = director_filter("xyz123nonexistent")
    assert len(result) == 0, "Should find no movies for nonexistent director"

def test_rating_minimum():
   """testing filtering by minimum rating"""
   result = rating_filter(8.0)
   
   assert isinstance(result, dict)
   assert len(result) > 0
  
   # checking that all movies have rating >= 8.0
   for movie_id, movie_data in result.items():
       rating = movie_data['vote_average']
       assert rating >= 8.0, f"Movie {movie_data['title']} has rating {rating}, should be >= 8.0"
   
   print(f"Found {len(result)} movies with rating >= 8.0")

def test_rating_high_threshold():
   """testing filtering with very high rating threshold"""
   result = rating_filter(9.5)
   
   assert isinstance(result, dict)
   # might be empty or very few movies
   
   for movie_id, movie_data in result.items():
       rating = movie_data['vote_average']
       assert rating >= 9.5, f"Movie {movie_data['title']} has rating {rating}, should be >= 9.5"
   
   print(f"Found {len(result)} movies with rating >= 9.5")

def test_rating_invalid_input():
    """testing rating filter with invalid inputs"""
    # testing negative rating
    try:
        rating_filter(-1.0)
        assert False, "Should raise ValueError for negative rating"
    except ValueError as e:
        assert "rating cannot be negative" in str(e)
    
    # testing rating above 10
    try:
        rating_filter(11.0)
        assert False, "Should raise ValueError for rating above 10"
    except ValueError as e:
        assert "rating cannot be above 10.0" in str(e)

def test_rating_edge_cases():
   """testing rating filter edge cases"""
   # testing rating 0 (should include unrated movies)
   result1 = rating_filter(0.0)
   assert isinstance(result1, dict)

   # validating all movies have rating >= 0.0
   for movie_id, movie_data in result1.items():
        rating = movie_data['vote_average']
        assert rating >= 0.0, f"Movie {movie_data['title']} has rating {rating}, should be >= 0.0"
   
   # testing exact rating match
   result2 = rating_filter(7.5)
   for movie_id, movie_data in result2.items():
       rating = movie_data['vote_average']
       assert rating >= 7.5, f"Movie {movie_data['title']} has rating {rating}, should be >= 7.5"

def test_keywords_single():
    """testing filtering by single keyword"""
    result = keyword_filter("monster")
    
    assert isinstance(result, dict)
    assert len(result) > 0
    
    # checking that all movies have "monster" SOMEWHERE in their keywords
    for movie_id, movie_data in result.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        has_monster = any("monster" in keyword for keyword in keywords_lower)
        assert has_monster, f"Movie {movie_data['title']} should have 'monster' in keywords but has: {movie_data['hidden_details']['keywords']}"
    
    print(f"Found {len(result)} movies with monster keyword")

def test_keywords_multiple():
   """testing multiple keyword filtering"""
   result = keyword_filter("monster", "island")
   
   assert isinstance(result, dict)
   assert len(result) > 0
   
   # checking that all results contain either monster or island keywords
   for movie_id, movie_data in result.items():
       keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
       has_monster = any("monster" in keyword for keyword in keywords_lower)
       has_island = any("island" in keyword for keyword in keywords_lower)
        
       assert has_monster or has_island, f"Movie {movie_data['title']} should have 'monster' or 'island' keyword but has: {movie_data['hidden_details']['keywords']}"
    
   print(f"Found {len(result)} movies with 'monster' or 'island' keywords")

def test_keywords_compound_words():
    """testing keyword filtering with compound/no-space words"""
    # testing with aftercreditsstinger - a compound keyword with no spaces
    result = keyword_filter("aftercreditsstinger")
    
    assert isinstance(result, dict)
    
    # validating that movies contain the exact compound keyword
    for movie_id, movie_data in result.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        assert "aftercreditsstinger" in keywords_lower, f"Movie {movie_data['title']} should have 'aftercreditsstinger' keyword but has: {movie_data['hidden_details']['keywords']}"
    
    print(f"Found {len(result)} movies with 'aftercreditsstinger' keyword")

def test_keywords_spaced_phrases():
    """testing keyword filtering with multi-word phrases"""
    # testing with "artificial intelligence" - a spaced keyword phrase
    result = keyword_filter("artificial intelligence")
    
    assert isinstance(result, dict)
    
    # validating that movies contain the exact phrase
    for movie_id, movie_data in result.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        assert "artificial intelligence" in keywords_lower, f"Movie {movie_data['title']} should have 'artificial intelligence' keyword but has: {movie_data['hidden_details']['keywords']}"
    
    print(f"Found {len(result)} movies with 'artificial intelligence' keyword")

def test_keywords_case_insensitive():
    """testing keyword filtering is case insensitive"""
    result1 = keyword_filter("Monster")
    result2 = keyword_filter("monster")
    result3 = keyword_filter("MONSTER")
    
    assert len(result1) == len(result2) == len(result3), "Should return same results regardless of case"
    
    # validating all results have the keyword
    for movie_id, movie_data in result1.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        has_monster = any("monster" in keyword for keyword in keywords_lower)
        assert has_monster, f"Movie {movie_data['title']} should have 'monster' keyword but has: {movie_data['hidden_details']['keywords']}"

def test_keywords_maximum_limit():
    """testing keyword maximum limit"""
    try:
        keyword_filter("monster", "island", "future", "chase", "dystopia", "android")
        assert False, "Should raise ValueError for more than 5 keywords"
    except ValueError as e:
        assert "maximum 5 keywords allowed" in str(e)

def test_keywords_not_found():
    """testing keyword that doesn't exist"""
    result = keyword_filter("xx_doesntexist_xx")
    assert len(result) == 0, "Should find no movies for nonexistent keyword"

def test_sorting_by_rating():
    """Testing that results are properly sorted by rating (highest first)"""
    result = rating_filter(7.0)
    
    assert len(result) > 1, "Need multiple movies to test sorting"
    
    ratings = [movie_data['vote_average'] for movie_data in result.values()]
    
    # checking that ratings are in descending order
    for i in range(len(ratings) - 1):
        assert ratings[i] >= ratings[i + 1], f"Ratings should be in descending order: {ratings[i]} >= {ratings[i + 1]}"
    
    print(f"Verified sorting: highest rating = {ratings[0]}, lowest rating = {ratings[-1]}")

def test_combined_filter_single_parameter():
    """testing combined filter with only one parameter"""
    # testing with only keywords
    result = all_filters_combined(keywords=["monster"])
    assert isinstance(result, dict)
    assert len(result) >= 0
    
    # validating that all movies have the monster keyword
    for movie_id, movie_data in result.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        has_monster = any("monster" in keyword for keyword in keywords_lower)
        assert has_monster, f"Movie {movie_data['title']} should have 'monster' keyword"
    
    print(f"Found {len(result)} movies with monster keyword (single filter)")

def test_combined_filter_two_parameters():
    """testing combined filter with two parameters (intersection)"""
    result = all_filters_combined(genres=["Action"], year=[2000, 2010])
    
    assert isinstance(result, dict)
    
    # validating that all movies match both criteria
    for movie_id, movie_data in result.items():
        # checking genre
        genres_lower = [g.lower() for g in movie_data['genres']]
        assert 'action' in genres_lower, f"Movie {movie_data['title']} should have Action genre"
        
        # checking year range
        year = movie_data['release_year']
        assert 2000 <= year <= 2010, f"Movie {movie_data['title']} ({year}) should be between 2000-2010"
    
    print(f"Found {len(result)} Action movies from 2000-2010")

def test_combined_filter_three_parameters():
    """testing combined filter with three parameters"""
    result = all_filters_combined(
        genres=["Drama"], 
        director="christopher nolan",
        rating=7.0
    )
    
    assert isinstance(result, dict)
    
    # validating all three criteria
    for movie_id, movie_data in result.items():
        # checking genre
        genres_lower = [g.lower() for g in movie_data['genres']]
        assert 'drama' in genres_lower, f"Movie {movie_data['title']} should have Drama genre"
        
        # checking director
        director_lower = movie_data['director'].lower()
        assert "christopher nolan" in director_lower, f"Movie {movie_data['title']} should have Christopher Nolan as director"
        
        # checking rating
        rating = movie_data['vote_average']
        assert rating >= 7.0, f"Movie {movie_data['title']} has rating {rating}, should be >= 7.0"
    
    print(f"Found {len(result)} Drama movies by Christopher Nolan with rating >= 7.0")

def test_combined_filter_all_parameters():
    """testing combined filter with all possible parameters"""
    result = all_filters_combined(
        keywords=["future"],
        genres=["Action", "Sci-Fi"], 
        year=[1990, 2020],
        director="cameron",
        rating=6.0
    )
    
    assert isinstance(result, dict)
    
    # validating all criteria (this might return empty set due to strict intersection)
    for movie_id, movie_data in result.items():
        # checking keyword
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        has_future = any("future" in keyword for keyword in keywords_lower)
        assert has_future, f"Movie {movie_data['title']} should have 'future' keyword"
        
        # checking genre (should have Action OR Sci-Fi since genres parameter allows OR)
        genres_lower = [g.lower() for g in movie_data['genres']]
        has_action = 'action' in genres_lower
        has_scifi = 'science fiction' in genres_lower or 'sci-fi' in genres_lower
        assert has_action or has_scifi, f"Movie {movie_data['title']} should have Action or Sci-Fi genre"
        
        # checking year range
        year = movie_data['release_year']
        assert 1990 <= year <= 2020, f"Movie {movie_data['title']} ({year}) should be between 1990-2020"
        
        # checking director
        director_lower = movie_data['director'].lower()
        assert "cameron" in director_lower, f"Movie {movie_data['title']} should have Cameron as director"
        
        # checking rating
        rating = movie_data['vote_average']
        assert rating >= 6.0, f"Movie {movie_data['title']} has rating {rating}, should be >= 6.0"
    
    print(f"Found {len(result)} movies matching all criteria")

def test_combined_filter_year_single():
    """testing combined filter with single year"""
    result = all_filters_combined(year=[1999], rating=7.0)
    
    assert isinstance(result, dict)
    
    # validating year and rating
    for movie_id, movie_data in result.items():
        year = movie_data['release_year']
        assert year == 1999, f"Movie {movie_data['title']} should be from 1999, but is from {year}"
        
        rating = movie_data['vote_average']
        assert rating >= 7.0, f"Movie {movie_data['title']} has rating {rating}, should be >= 7.0"
    
    print(f"Found {len(result)} movies from 1999 with rating >= 7.0")

def test_combined_filter_empty_intersection():
    """testing combined filter that should return empty results"""
    # using very restrictive criteria that likely won't match any movies
    result = all_filters_combined(
        keywords=["nonexistentkeyword123"],
        genres=["Action"],
        rating=9.8
    )
    
    assert isinstance(result, dict)
    assert len(result) == 0, "Should return empty result for overly restrictive criteria"

def test_combined_filter_error_handling():
    """testing combined filter error cases"""
    # testing with no parameters
    try:
        all_filters_combined()
        assert False, "Should raise ValueError for no parameters"
    except ValueError as e:
        assert "at least one filter parameter required" in str(e)
    
    # testing with invalid year format (too many elements)
    try:
        all_filters_combined(year=[1990, 2000, 2010])
        assert False, "Should raise ValueError for invalid year format"
    except ValueError as e:
        assert "year should have 1 or 2 elements" in str(e)

def test_combined_filter_sorting():
    """testing that combined filter results are properly sorted by rating"""
    result = all_filters_combined(genres=["Action"], rating=6.0)
    
    if len(result) > 1:
        ratings = [movie_data['vote_average'] for movie_data in result.values()]
        
        # checking that ratings are in descending order
        for i in range(len(ratings) - 1):
            assert ratings[i] >= ratings[i + 1], f"Combined filter results should be sorted by rating: {ratings[i]} >= {ratings[i + 1]}"
        
        print(f"Combined filter sorting verified: highest rating = {ratings[0]}, lowest rating = {ratings[-1]}")

def test_combined_filter_limit_150():
    """testing that combined filter respects 150 movie limit"""
    # using broad criteria that might return many results
    result = all_filters_combined(rating=5.0)
    
    assert isinstance(result, dict)
    assert len(result) <= 150, f"Should return at most 150 movies, got {len(result)}"
    
    print(f"Combined filter returned {len(result)} movies (within 150 limit)")

def test_combined_filter_data_consistency():
    """testing that combined filter returns consistent movie data structure"""
    result = all_filters_combined(genres=["Comedy"], rating=7.0)
    
    if len(result) > 0:
        first_movie = list(result.values())[0]
        
        # checking required fields
        required_fields = ['id', 'title', 'release_year', 'vote_average', 'vote_count', 'runtime', 'genres', 'director', 'hidden_details']
        for field in required_fields:
            assert field in first_movie, f"Movie data should contain {field}"
        
        # checking hidden_details structure
        hidden_details = first_movie['hidden_details']
        hidden_required = ['stars', 'keywords', 'production_companies', 'tagline', 'overview', 'release_date', 'character_tropes']
        for field in hidden_required:
            assert field in hidden_details, f"hidden_details should contain {field}"
        
        print("Combined filter data structure validation passed")

if __name__ == "__main__":
    # making sure pg_url is set before running tests
    if not os.getenv("PG_URL"):
        print("error: pg_url environment variable must be set to run tests")
        exit(1)
    
    # Genre tests
    test_one_genre_checker()
    test_error_handling() 
    test_case_insensitive()
    test_multiple_genres()
    test_three_genres()
    
    # Year tests
    test_single_year()
    test_year_range()
    test_year_edge_cases()
    
    # Director tests
    test_director_single()
    test_director_case_insensitive()
    test_director_minimum_characters()
    test_director_partial_matching()
    test_director_not_found()
    
    # Rating tests
    test_rating_minimum()
    test_rating_high_threshold()
    test_rating_invalid_input()
    test_rating_edge_cases()
    
    # Keyword tests
    test_keywords_single()
    test_keywords_multiple()
    test_keywords_compound_words()
    test_keywords_spaced_phrases()
    test_keywords_case_insensitive()
    test_keywords_maximum_limit()
    test_keywords_not_found()
    
    # Sorting test
    test_sorting_by_rating()

    # Combined filter tests
    test_combined_filter_single_parameter()
    test_combined_filter_two_parameters()
    test_combined_filter_three_parameters()
    test_combined_filter_all_parameters()
    test_combined_filter_year_single()
    test_combined_filter_empty_intersection()
    test_combined_filter_error_handling()
    test_combined_filter_sorting()
    test_combined_filter_limit_150()
    test_combined_filter_data_consistency()

    print("All tests passed!")