

# Structure
Models <- Create models for sqlalchemy
- To create a new model create a new python file and import it into \_\_init\_\_.py 

Test <- All the tests here, don't forget functions start with test_

utils <- Function needed that are not reoutes

app.py <- main file, from here you start the app and add new routes

.env <- Environmental variables are stored here \
Create .env from .env_example and complete the variables

# How to run backend
1. Download and start docker(or you can use docker desktop):
- https://docs.docker.com/engine/install/
- https://www.docker.com/products/docker-desktop/
2. Download and start pgvector container with the following command:
```sh
docker run -e POSTGRES_USER=myuser \
           -e POSTGRES_PASSWORD=mypassword \
           -e POSTGRES_DB=mydatabase \
           --name my_postgres \
           -p 5432:5432 \
           -d ankane/pgvector
```
3. Download ollama:
- https://ollama.com/download
4. Download 2 models with ollama
```sh
ollama pull mistral-nemo:latest
ollama pull nomic-embed-text:latest
```
5. Create .env file from .env_example
6. Complete the .env
7. Move to the backend folder
```sh
cd ./backend
```
8. Install requirements 
```sh
pip install -r ./requirements.txt
``` 
9. Run tests
```sh
pytest
```
9. Start the application
```sh
python app.py
```

# Team
Antonia Bulai - 2837920 \
David-Valentin Neacsu - 2840781 \
Laetitia Maria Rossetti - 2839652 \
Goktug Yildirim - 2814081

# API endpoints
#### POST /register
- Description: Registers a new user with a username and password.

 - Body:

    - username (str) – Required.

    - password (str) – Required.

#### POST /login
- Description: Logs in an existing user and returns a session token.

- Body:

    - username (str) – Required.

    - password (str) – Required.

####  GET /logout
- Description: Logs out the user by clearing the session token cookie.

#### POST /delete_account
- Description: Deletes the user’s account and all associated favorites.

- Body:

    - username (str) – Required.

- password (str) – Required.


#### POST /chat
- Description: Performs an AI-assisted search and returns two matching movies and a generated AI response.

- Body:

    -query (str) – Required. Free-text question or query about movies.

#### GET /movie
- Description: Fetches a movie's details by either internal ID or IMDb ID.

- Params:

    - id (str) – Optional.

    - imdb_id (str) – Optional.

- You must provide either id or imdb_id.

#### GET /search
- Description: Searches for movies using a combination of filters.

- Body:

    - query (str) – Required.

    - keyword (list[str]) – Optional.

    - genres (list[str]) – Optional.

    - year (list[int]) – Optional; expected as an interval (e.g., [2000, 2010]).

    - director (list[str]) – Optional.

- rating (float) – Optional.

#### POST /add_favorite
- Description: Adds a movie to the logged-in user’s list of favorites.

- Body:

    - movie_id (str) – Required.

#### POST /delete_favorite
- Description: Removes a movie from the user’s favorites.

- Body:

    - movie_id (str) – Required.

#### POST /add_trope
- Description: Adds a user-submitted character trope to a specific movie.

- Body:

    - selected_movie_id (str) – Required.

    - user_trope (str) – Required.

#### GET /trope_filter
- Description: Retrieves all movies with user-submitted tropes, organized for filtering.

GET /movies_with_trope
- Description: Lists movies that contain a specific user-defined trope.

- Body:

    - user_trope (str) 
    - Required.

