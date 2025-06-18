#from models.Base import Base
from flask import Flask
from sqlalchemy import update, insert, delete, select
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy import MetaData, Table, Column, String, Text, JSON, Float, BigInteger, Date, Integer
from models.movieModel import Movie
import os
def add_trope(user_text: str, selected_id: int, connection):
    stmt = (
        update(Movie)
        .where(Movie.id == selected_id)
        .values(character_tropes = user_text)
        )
    connection.execute(stmt)
    connection.commit()

def trope_filter(session):
    stmt = select(Movie).where(Movie.character_tropes != "").order_by(Movie.id)
    return session.execute(stmt).all()

engine = create_engine(os.getenv("PG_URL"))
add_trope("movie1",1,engine)
