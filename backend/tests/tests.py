### first backend tests file ###
from normal_filter_search import genre_filter, year_filter, director_filter, rating_filter, keyword_filter

def test_one_genre_checker():
    """testing single genre filtering functionality"""
    result = genre_filter("Action")
    assert isinstance(result, dict)
    assert len(result) > 0
    # max 150 movies
    assert len(result)<=150
    
    # validating that all returned movies actually have the Action genre
    for movie_title, movie_data in result.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        assert 'action' in genres_lower, f"Movie {movie_title} should have Action genre but has: {movie_data['genres']}"

    print(f"Found {len(result)} Action movies")
    first_movie = list(result.keys())[0]
    print(f"Top movie: {first_movie}")

def test_error_handling():
    """testing error cases for invalid inputs"""
    # testing too many genres
    result = genre_filter("Action", "Comedy", "Drama", "Horror", "Romance", "Thriller")
    assert "error" in result
    assert "Maximum 5 genres allowed" in result["error"]
    
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
    for movie_title, movie_data in result1.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        assert 'action' in genres_lower, f"Movie {movie_title} should have Action genre"


def test_multiple_genres():
    """testing multiple genre filtering approach"""
    result = genre_filter("Action", "Comedy")
    
    assert isinstance(result, dict)
    assert len(result) > 0
    assert len(result) <= 150
    
    # checking that all results contain either Action or Comedy
    for movie_title, movie_data in result.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        has_action = 'action' in genres_lower
        has_comedy = 'comedy' in genres_lower
        
        assert has_action or has_comedy, f"Movie {movie_title} should have Action or Comedy genre, but has: {movie_data['genres']}"
    
    print(f"Found {len(result)} movies with Action or Comedy")

def test_three_genres():
    """testing three genre filtering"""
    result=genre_filter("Action", "Drama", "Romance")
    
    assert isinstance(result, dict)
    assert len(result) <= 150
    
    # checking that all results contain at least one of the three genres
    for movie_title, movie_data in result.items():
        genres_lower = [g.lower() for g in movie_data['genres']]
        has_any_genre = any(genre in genres_lower for genre in ['action', 'drama', 'romance'])
        
        assert has_any_genre, f"Movie {movie_title} should have Action, Drama, or Romance genre but has: {movie_data['genres']}"
    
    print(f"Found {len(result)} movies with Action, Drama, or Romance")

def test_single_year():
   """testing filtering by single year"""
   result = year_filter(1999)
   
   assert isinstance(result, dict)
   assert len(result) > 0
   assert len(result) <= 150
   
   # checking that all movies are from 1999
   for movie_title, movie_data in result.items():
       assert movie_data['release_year'] == 1999, f"Movie {movie_title} should be from 1999, but is from {movie_data['release_year']}"
   
   print(f"Found {len(result)} movies from 1999")

def test_year_range():
   """testing filtering by year range"""
   result=year_filter(1990, 2000)
   
   assert isinstance(result, dict)
   assert len(result) > 0
   assert len(result) <= 150
   
   # checking that all movies are between 1990-2000
   for movie_title, movie_data in result.items():
       year = movie_data['release_year']
       assert 1990 <= year <= 2000, f"Movie {movie_title} ({year}) should be between 1990-2000"
   
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
    assert len(result) <= 150
    
    # checking that all movies have christopher nolan as director
    for movie_title, movie_data in result.items():
        director_lower = movie_data['director'].lower()
        assert "christopher nolan" in director_lower, f"Movie {movie_title} should have Christopher Nolan as director"
    
    print(f"Found {len(result)} movies by Christopher Nolan")

def test_director_case_insensitive():
    """testing director filtering is case insensitive"""
    result1 = director_filter("Christopher Nolan")
    result2 = director_filter("christopher nolan")
    result3 = director_filter("CHRISTOPHER NOLAN")
    
    assert len(result1) == len(result2) == len(result3), "Should return same results regardless of case"

     # validating all results have Nolan as director
    for movie_title, movie_data in result1.items():
        director_lower = movie_data['director'].lower()
        assert "christopher nolan" in director_lower, f"Movie {movie_title} should have Christopher Nolan as director"

def test_director_minimum_characters():
    """testing director name minimum character requirement"""
    result1 = director_filter("pe")
    assert "error" in result1, "Should return error for input less than 3 characters"
    assert "must be at least 3 characters" in result1["error"]
    
    result2 = director_filter("a")
    assert "error" in result2, "Should return error for single character"
    
    result3 = director_filter("")
    assert "error" in result3, "Should return error for empty string"

def test_director_partial_matching():
    """testing partial director name matching"""
    result = director_filter("russo")
    
    assert isinstance(result, dict)
    
    # checking that movies contain "russo" in director field
    for movie_title, movie_data in result.items():
        director_lower = movie_data['director'].lower()
        assert "russo" in director_lower, f"Movie {movie_title} should have Russo in directors but has: {movie_data['director']}"
    
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
   assert len(result) <= 150
   
   # checking that all movies have rating >= 8.0
   for movie_title, movie_data in result.items():
       rating = movie_data['vote_average']
       assert rating >= 8.0, f"Movie {movie_title} has rating {rating}, should be >= 8.0"
   
   print(f"Found {len(result)} movies with rating >= 8.0")

def test_rating_high_threshold():
   """testing filtering with very high rating threshold"""
   result = rating_filter(9.5)
   
   assert isinstance(result, dict)
   # might be empty or very few movies
   
   for movie_title, movie_data in result.items():
       rating = movie_data['vote_average']
       assert rating >= 9.5, f"Movie {movie_title} has rating {rating}, should be >= 9.5"
   
   print(f"Found {len(result)} movies with rating >= 9.5")

def test_rating_invalid_input():
   """testing rating filter with invalid inputs"""
   # testing negative rating
   result1 = rating_filter(-1.0)
   assert "error" in result1, "Should return error for negative rating"
   
   # testing rating above 10
   result2 = rating_filter(11.0)
   assert "error" in result2, "Should return error for rating above 10"

def test_rating_edge_cases():
   """testing rating filter edge cases"""
   # testing rating 0 (should include unrated movies)
   result1 = rating_filter(0.0)
   assert isinstance(result1, dict)

    # validating all movies have rating >= 0.0
   for movie_title, movie_data in result1.items():
        rating = movie_data['vote_average']
        assert rating >= 0.0, f"Movie {movie_title} has rating {rating}, should be >= 0.0"
   
   # testing exact rating match
   result2 = rating_filter(7.5)
   for movie_title, movie_data in result2.items():
       rating = movie_data['vote_average']
       assert rating >= 7.5, f"Movie {movie_title} has rating {rating}, should be >= 7.5"

def test_keywords_single():
   """testing filtering by single keyword"""
   result = keyword_filter("friendship")
   
   assert isinstance(result, dict)
   assert len(result) > 0
   assert len(result) <= 150
   
   # checking that all movies have "friendship" in keywords
   for movie_title, movie_data in result.items():
       keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
       assert "friendship" in keywords_lower, f"Movie {movie_title} should have friendship in keywords"
   
   print(f"Found {len(result)} movies with friendship keyword")

def test_keywords_multiple():
   """testing multiple keyword filtering"""
   result = keyword_filter("monster", "island")
   
   assert isinstance(result, dict)
   assert len(result) > 0
   assert len(result) <= 150
   
   # checking that all results contain either monster or island keywords
   for movie_title, movie_data in result.items():
       keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
       has_monster = "monster" in keywords_lower
       has_island = "island" in keywords_lower
        
       assert has_monster or has_island, f"Movie {movie_title} should have 'monster' or 'island' keyword but has: {movie_data['hidden_details']['keywords']}"
    
   print(f"Found {len(result)} movies with 'monster' or 'island' keywords")

def test_keywords_compound_words():
    """testing keyword filtering with compound/no-space words"""
    # testing with aftercreditsstinger - a compound keyword with no spaces
    result = keyword_filter("aftercreditsstinger")
    
    assert isinstance(result, dict)
    
    # validating that movies contain the exact compound keyword
    for movie_title, movie_data in result.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        assert "aftercreditsstinger" in keywords_lower, f"Movie {movie_title} should have 'aftercreditsstinger' keyword but has: {movie_data['hidden_details']['keywords']}"
    
    print(f"Found {len(result)} movies with 'aftercreditsstinger' keyword")

def test_keywords_spaced_phrases():
    """testing keyword filtering with multi-word phrases"""
    # testing with "artificial intelligence" - a spaced keyword phrase
    result = keyword_filter("artificial intelligence")
    
    assert isinstance(result, dict)
    
    # validating that movies contain the exact phrase
    for movie_title, movie_data in result.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        assert "artificial intelligence" in keywords_lower, f"Movie {movie_title} should have 'artificial intelligence' keyword but has: {movie_data['hidden_details']['keywords']}"
    
    print(f"Found {len(result)} movies with 'artificial intelligence' keyword")

def test_keywords_case_insensitive():
    """testing keyword filtering is case insensitive"""
    result1 = keyword_filter("Monster")
    result2 = keyword_filter("monster")
    result3 = keyword_filter("MONSTER")
    
    assert len(result1) == len(result2) == len(result3), "Should return same results regardless of case"
    
    # validating all results have the keyword
    for movie_title, movie_data in result1.items():
        keywords_lower = [k.lower() for k in movie_data['hidden_details']['keywords']]
        assert "monster" in keywords_lower, f"Movie {movie_title} should have 'monster' keyword"

def test_keywords_maximum_limit():
    """testing keyword maximum limit"""
    result = keyword_filter("monster", "island", "future", "chase", "dystopia", "android")
    assert "error" in result, "Should return error for more than 5 keywords"
    assert "Maximum 5 keywords allowed" in result["error"]

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


if __name__ == "__main__":
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
    
    # Keyword tests with real keywords
    test_keywords_single()
    test_keywords_multiple()
    test_keywords_compound_words()
    test_keywords_spaced_phrases()
    test_keywords_case_insensitive()
    test_keywords_maximum_limit()
    test_keywords_not_found()
    
    # Sorting test
    test_sorting_by_rating()
    
    print("All tests passed!")