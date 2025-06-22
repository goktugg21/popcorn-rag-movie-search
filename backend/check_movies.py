from sqlalchemy import create_engine, select
from models.movieModel import Movie
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('PG_URL'))

with engine.connect() as conn:
    result = conn.execute(select(Movie)).first()
    print(f'Movies in database: {result is not None}')
    
    if result:
        print("Sample movie:", result.original_title)
    else:
        print("No movies found in database") 