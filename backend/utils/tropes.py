from models.Base import Base
from flask import Flask
from sqlalchemy import update, insert, delete
from sqlalchemy import create_engine, text
from sqlalchemy import MetaData, Table, Column, String, Text, JSON, Float, BigInteger, Date, Integer
from models.movie import Movie

def add_trope(user_text: str, selected_id: str, connection):
    stmt = (
        update(Movie)
        .where(Movie.id == selected_id)
        .values(character_tropes = user_text)
        )
    connection.execute(stmt)
    connection.commit()