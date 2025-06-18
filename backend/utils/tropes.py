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