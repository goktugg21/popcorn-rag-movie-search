import pytest
from utils.tropes import trope_filter
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
import os
from sqlalchemy.orm import Session, sessionmaker
from models.movieModel import Movie
from typing import List

"""
@pytest.fixture
def engine_add_trope():
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add_all([
        Movie(id="1", character_tropes="Poor hero"),
        Movie(id="2", character_tropes='Rebel')
    ])
    session.commit()
    yield session
    session.close()

    def test_add_trope(engine):
    with engine.connect() as connection:
        add_trope("movie","100",connection)

def test_add_trope(connection):
    assert add_trope("Poor hero","1",connection)
    assert add_trope("Rebel","100",connection)
    results = connection.execute(select(Movie).order_by(Movie.id))
    assert results[0]["character_tropes"] == "Poor hero"
    assert results[1]["character_tropes"] == "Rebel"
"""

@pytest.fixture
def engine_trope_filter():
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add_all([
        Movie(id="1000000", character_tropes="Villain"),
        Movie(id="2000000", character_tropes=''),
        Movie(id="3000000", character_tropes=''),
        Movie(id="4000000", character_tropes="Idiot")
    ])
    session.commit()
    yield session
    session.close()

def test_trope_filter(engine_trope_filter):
    results = trope_filter(engine_trope_filter)
    movie_id = []
    for movie in results:
        movie_id = movie_id.append(movie.id)
    assert "1000000" in movie_id
    assert "4000000" in movie_id
    assert "3000000" not in movie_id
    assert "2000000" not in movie_id