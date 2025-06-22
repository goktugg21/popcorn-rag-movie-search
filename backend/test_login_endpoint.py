#!/usr/bin/env python3
import requests
import json

def test_login(username, password):
    """Test the login endpoint directly"""
    url = "http://localhost:5000/login"
    data = {
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print(f"Cookies: {dict(response.cookies)}")
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # Test with one of your usernames
    print("Testing login with 'toni23'...")
    test_login("toni23", "password")  # Replace 'password' with the actual password
    
    print("\n" + "="*50 + "\n")
    
    print("Testing login with 'toni'...")
    test_login("toni", "password")  # Replace 'password' with the actual password 