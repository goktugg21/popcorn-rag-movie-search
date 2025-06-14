import os
from sqlalchemy import create_engine, insert, select
from dotenv import load_dotenv
from flask import Flask, request
from models.Base import Base
import models.User as User
from werkzeug.security import generate_password_hash

app = Flask(__name__)


@app.route('/register', methods=['POST'])
def register():
    """
    Register a new user,
    Checks if username already exists.
    Checks if username or password is left empty.
    """
    post_data = request.get_json()

    password = generate_password_hash(post_data['password'])
    username = post_data['username']

    if not username or not password:
        return 'Username and password cannot be empty', 400
    
    
    stmp = select(User).where(User.username == username)
   
    connection = engine.connect() 
    res = connection.execute(stmp)
    if len(res.all()) > 0:
        return 'User already exists', 400

    connection.execute(insert(User).values(username=post_data['username'], user_password=password))
    connection.commit()

    return 'User registered successfully', 200



if __name__ == "__main__":
    load_dotenv()
    engine = create_engine(os.getenv("PG_URL"))
    Base.metadata.create_all(engine)
    app.run(debug=True)