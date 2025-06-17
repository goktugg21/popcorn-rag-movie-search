import pytest
from utils.tropes import add_trope, trope_filter
from dotenv import load_dotenv
from sqlalchemy import create_engine,select
import os
from sqlalchemy.orm import Session, sessionmaker
from backend.models import Movie
from typing import List

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

"""def test_add_trope(engine):
    with engine.connect() as connection:
        add_trope("movie","100",connection)"""

def test_add_trope(connection):
    assert add_trope("Poor hero","1",connection)
    assert add_trope("Rebel","100",connection)
    results = connection.execute(select(Movie).order_by(Movie.id))
    assert results[0]["character_tropes"] == "Poor hero"
    assert results[1]["character_tropes"] == "Rebel"


@pytest.fixture
def engine_trope_filter():
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add_all([
        Movie(id="1", character_tropes="Villain"),
        Movie(id="2", character_tropes=''),
        Movie(id="3", character_tropes=''),
        Movie(id="4", character_tropes="Idiot")
    ])
    session.commit()
    yield session
    session.close()

def test_trope_filter(engine):
    results = trope_filter(engine)
    movie_id = []
    for movie in results:
        movie_id = movie_id.append(movie.id)
    assert "1" in movie_id
    assert "4" in movie_id
    assert "3" not in movie_id
    assert "2" not in movie_id