#from models.Base import Base
from flask import Flask, request
from sqlalchemy import update, insert, delete, select
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy import MetaData, Table, Column, String, Text, JSON, Float, BigInteger, Date, Integer
from models.movieModel import Movie
from dotenv import load_dotenv
import os

def add_trope(user_text: str, selected_id: int, connection: Session) -> None:
    """"
    Add character trope to an already existing movie.
    """
    stmt = (
        update(Movie)
        .where(Movie.id == selected_id)
        .values(character_tropes = user_text)
        )
    connection.execute(stmt)
    connection.commit()


def trope_filter(session: Session) -> list:
    """
    Show all movies with character tropes.
    """
    stmt = select(Movie).where(Movie.character_tropes != "").order_by(Movie.id)
    return session.execute(stmt).all()


def movies_with_trope(user_trope: str, session: Session) -> list:
    """
    Retrieve all movies that contain a specific character trope.
    """
    stmt = select(Movie).where(Movie.character_tropes == user_trope).order_by(Movie.original_title)
    results = session.execute(stmt).all()
    return results

def movie_display(movie_id: int, session: Session):
    """
    Display comprehensive movie details by ID.
    """
    stmt = select(Movie).where(Movie.id == movie_id)
    result = session.execute(stmt).one_or_none()
    if result:
        movie = result.Movie
        # Parse metadata if it exists
        metadata = movie.metadata_ if movie.metadata_ else {}
        
        return {
            "id": movie.id,
            "imdb_id": movie.imdb_id,
            "title": movie.original_title,
            "release_year": movie.release_year,
            "vote_average": movie.vote_average,
            "vote_count": movie.vote_count,
            "runtime": movie.runtime,
            "genres": movie.genres,
            "director": movie.director,
            "tagline": movie.tagline,
            "overview": movie.text or metadata.get('overview', ''),
            "release_date": str(movie.release_date) if movie.release_date else '',
            "budget": movie.budget,
            "revenue": movie.revenue,
            "homepage": movie.homepage,
            "keywords": movie.keywords,
            "stars": movie.stars,
            "character_tropes": movie.character_tropes,
            "popularity": movie.popularity,
            "poster_path": metadata.get('poster_path', ''),
            "backdrop_path": metadata.get('backdrop_path', ''),
            "production_companies": metadata.get('production_companies', ''),
            "spoken_languages": metadata.get('spoken_languages', ''),
            "status": metadata.get('status', ''),
            "original_language": metadata.get('original_language', '')
        }
    return {}