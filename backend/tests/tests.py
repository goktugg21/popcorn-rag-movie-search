### first backend tests file ###
from normal_filter_search import genre_filter

def test_one_genre_checker():
    """testing single genre filtering functionality"""
    result = genre_filter("Action")
    assert isinstance(result, dict)
    assert len(result) > 0
    assert len(result) <= 150
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

if __name__ == "__main__":
    test_one_genre_checker()
    test_error_handling()
    test_case_insensitive()
    print("All tests passed!")