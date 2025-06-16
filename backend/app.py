from flask import Flask
import flask
from models.Base import Base
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from sqlalchemy import text, select
from models.movieModel import Movie
from utils.rag_tools import create_index, load_movies_from_csv
from sqlalchemy.engine import Engine

app: Flask = Flask(__name__)

if __name__ == '__main__':
    load_dotenv()
    # Create the database engine and initialize the tables
    engine: Engine = create_engine(os.getenv("PG_URL"))
    Base.metadata.create_all(engine)

    # Create vector extension if it doesn't exist
    with engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        connection.commit()
        res = connection.execute(select(Movie))
    
    # If the movies table is empty, create the index and populate the table from the CSV file
    if(res.all() == []):
        create_index(load_movies_from_csv(os.getenv("MOVIE_CSV_FILE")))
    
    # Set up the Flask app
    app.run(debug=True)
