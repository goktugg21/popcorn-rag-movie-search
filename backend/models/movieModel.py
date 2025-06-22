from sqlalchemy import (
    Column, String, Float, BigInteger, Integer, Date, Text, JSON
)
from sqlalchemy.ext.declarative import declarative_base
import pgvector.sqlalchemy
from models.Base import Base
import os


class Movie(Base):
    """
    SQLAlchemy model for movies.
    """
    __tablename__ = f'data_movies'

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String)
    embedding = Column(pgvector.sqlalchemy.Vector(768)) 
    text = Column(Text)
    metadata_ = Column(JSON)
    imdb_id = Column(String)
    popularity = Column(Float)
    budget = Column(BigInteger)
    revenue = Column(BigInteger)
    original_title = Column(String)
    stars = Column(Text)
    homepage = Column(String)
    director = Column(String)
    tagline = Column(String)
    keywords = Column(Text)
    runtime = Column(Float)
    genres = Column(Text)
    release_date = Column(Date)
    vote_count = Column(Integer)
    vote_average = Column(Float)
    release_year = Column(Integer)
    character_tropes = Column(Text)