#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from models.User import User

# Load environment variables
load_dotenv()

# Create database engine
engine = create_engine(os.getenv("PG_URL"))

def check_users():
    """Read and display all users from the database"""
    try:
        with engine.connect() as connection:
            # Query all users
            stmt = select(User)
            result = connection.execute(stmt)
            users = result.all()
            
            if not users:
                print("No users found in the database.")
                return
            
            print(f"Found {len(users)} user(s) in the database:")
            print("-" * 50)
            
            for user in users:
                print(f"ID: {user.id}")
                print(f"Username: {user.username}")
                print(f"Password (hashed): {user.user_password[:20]}...")
                print("-" * 30)
                
    except Exception as e:
        print(f"Error connecting to database: {e}")
        print("Make sure your .env file has the correct PG_URL")

if __name__ == "__main__":
    check_users() 