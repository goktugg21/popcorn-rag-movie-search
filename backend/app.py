from flask import Flask, request, jsonify
from flask import Response as FlaskResponse
import flask
from models.Base import Base
from sqlalchemy import create_engine
from dotenv import load_dotenv
from models.Base import Base
from utils.tropes import add_trope

import os
from sqlalchemy import text, select
from models.movieModel import Movie
from utils.rag_tools import create_index, load_movies_from_csv, chat, getQEngine
from sqlalchemy.engine import Engine
from llama_index.core.base.response.schema import Response

app: Flask = Flask(__name__)

@app.post('/chat')
def aiSearch() -> FlaskResponse:
    """
    Endpoint to handle AI search queries.
    Returns:
        Response: A dictionary containing the response of the AI and the movies found.
    """
    data = request.get_json()
    query: str = data.get("query")
    if query is None or query.strip() == "":
        return jsonify({"error": "Query cannot be empty"}), 400
    chat_res: Response = chat(query, getQEngine())
    chat_res_text = chat_res.response
    movies_found = [movie.metadata.get("imdb_id") for movie in chat_res.source_nodes]
    return jsonify({"response": chat_res_text, "movie_ids": movies_found}), 200


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
        add_trope("movie","100",connection)
    
    # If the movies table is empty, create the index and populate the table from the CSV file
    if(res.all() == []):
        create_index(load_movies_from_csv(os.getenv("MOVIE_CSV_FILE")))
    
    # Set up the Flask app
    app.run(debug=True)
