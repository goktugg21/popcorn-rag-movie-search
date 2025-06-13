import os
from sqlalchemy import create_engine
from dotenv import load_dotenv
from flask import Flask
from models.Base import Base
from utils.tropes import add_trope

app = Flask(__name__)


if __name__ == "__main__":
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    Base.metadata.create_all(engine)
    with engine.connect() as connection:
        add_trope("movie","100",connection)
    app.run(debug=True)


