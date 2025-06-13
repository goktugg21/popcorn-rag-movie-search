import pytest
from utils.tropes import add_trope
from dotenv import load_dotenv
from sqlalchemy import create_engine
import os

@pytest.fixture
def engine():
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    yield engine
def test_trope_added(engine):
    with engine.connect() as connection:
        add_trope("movie","100",connection)
