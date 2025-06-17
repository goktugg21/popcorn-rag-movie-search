from models.Base import Base
from flask import Flask
from sqlalchemy import update, insert, delete
from sqlalchemy import create_engine, text
from sqlalchemy import MetaData, Table, Column, String, Text, JSON, Float, BigInteger, Date, Integer

class Movie(Base):
    __tablename__ = "movies"
    id = Column(Text, primary_key=True, autoincrement=True)
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

