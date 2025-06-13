import os
from sqlalchemy import create_engine
from dotenv import load_dotenv
from flask import Flask
from models.Base import Base


app = Flask(__name__)


if __name__ == "__main__":
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    Base.metadata.create_all(engine)
    app.run(debug=True)