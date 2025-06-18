import os
import sys 

#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))
# Load environment variables from .env file

import pytest
from utils.tropes import trope_filter, add_trope, movies_with_trope
from dotenv import load_dotenv
from sqlalchemy import create_engine, select, insert, delete, or_
from sqlalchemy.orm import Session, sessionmaker
from models.movieModel import Movie
from typing import List


@pytest.fixture
def engine_add_trope():
    """Fixture to set up and tear down the database for add_trope tests."""
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    with engine.connect() as connection:
        connection.execute(insert(Movie).values(id=100002,character_tropes = "Rebel"))
        connection.execute(insert(Movie).values(id=100003,character_tropes = "Poor hero"))
        connection.commit()
    yield engine
    with engine.connect() as connection:
        connection.execute(delete(Movie).where(or_(Movie.id == 100002, Movie.id == 100003)))
        connection.commit()
    

def test_add_trope(engine_add_trope):
    """Test the add_trope function."""
    with engine_add_trope.connect() as connection:
        add_trope("Poor hero", 100003, connection)
        add_trope("Rebel", 100002, connection)
        results = connection.execute(select(Movie).where(or_(Movie.id == 100002, Movie.id == 100003))).all()
        print(results)
        assert results[1][-1] == "Poor hero"
        assert results[0][-1] == "Rebel"


@pytest.fixture
def engine_trope_filter():
    """Fixture to set up and tear down the database for trope_filter tests."""
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    with engine.connect() as connection:
        connection.execute(insert(Movie).values(id=100000,character_tropes = "Villain"))
        connection.execute(insert(Movie).values(id=100001,character_tropes = ""))
        connection.commit()
    yield engine
    with engine.connect() as connection:
        connection.execute(delete(Movie).where(or_(Movie.id == 100000, Movie.id == 100001)))
        connection.commit()

def test_trope_filter(engine_trope_filter):
    """Test the trope_filter function."""
    results = trope_filter(engine_trope_filter.connect())
    movie_id = [movie.id for movie in results]
    assert 100000 in movie_id
    assert 100001 not in movie_id

@pytest.fixture
def engine_movies_with_trope():
    """Fixture to set up and tear down the database for movies_with_trope tests."""
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    with engine.connect() as connection:
        connection.execute(insert(Movie).values(id=100004, character_tropes="Lover"))
        connection.execute(insert(Movie).values(id=100005, character_tropes="Psychopath"))
        connection.commit()
    yield engine
    with engine.connect() as connection:
        connection.execute(delete(Movie).where(or_(Movie.id == 100004, Movie.id == 100005)))
        connection.commit()

def test_movies_with_trope(engine_movies_with_trope):
    """Test the movies_with_trope function."""
    with engine_movies_with_trope.connect() as connection:
        results = movies_with_trope("Lover", connection)
        movie_ids = [movie.id for movie in results]
        assert 100004 in movie_ids
        assert 100005 not in movie_ids

        results = movies_with_trope("Psychopath", connection)
        movie_ids = [movie.id for movie in results]
        assert 100005 in movie_ids
        assert 100004 not in movie_ids