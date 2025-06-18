import pytest
from utils.tropes import trope_filter, add_trope
from dotenv import load_dotenv
from sqlalchemy import create_engine, select, insert, delete, or_
import os
from sqlalchemy.orm import Session, sessionmaker
from models.movieModel import Movie
from typing import List

load_dotenv()

@pytest.fixture
def engine_add_trope():
    engine = create_engine(os.getenv("PG_URL"))
    with engine.connect() as connection:
        connection.execute(insert(Movie).values(id=100002,character_tropes = "Rebel"))
        connection.execute(insert(Movie).values(id=100003,character_tropes = "Poor hero"))
    yield engine
    with engine.connect() as connection:
        connection.execute(delete(Movie).where(or_(Movie.id == 100002, Movie.id == 100003)))
        connection.commit()

def test_add_trope(enngine_add_trope):
    with engine_add_trope.connect() as connection:
        assert add_trope("Poor hero","100003",engine_add_trope.connect())
        assert add_trope("Rebel","100002",engine_add_trope.connect())
        results = engine_add_trope.execute(select(Movie).order_by(Movie.id)).fetchall()
        assert results[0]["character_tropes"] == "Poor hero"
        assert results[1]["character_tropes"] == "Rebel"


@pytest.fixture
def engine_trope_filter():
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
    results = trope_filter(engine_trope_filter.connect())
    movie_id = []
    for movie in results:
        movie_id.append(movie.id)
    assert 100000 in movie_id
    assert 100001 not in movie_id