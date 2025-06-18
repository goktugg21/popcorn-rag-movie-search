

# Structure
Models <- Create models for sqlalchemy
- To create a new model create a new python file and import it into \_\_init\_\_.py 

Test <- All the tests here, don't forget functions start with test_

utils <- Function needed that are not reoutes

app.py <- main file, from here you start the app and add new routes

.env <- Environmental variables are stored here
Create .env from .env_example and complete the variables

# How to run backend
1. Download and start docker:
- https://docs.docker.com/engine/install/
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
6. Complete the .env with
7. Move to the backend folder
```sh
cd ./backend
```
8. Start the application
```sh
python app.py
```

# Team
Antonia Bulai - 2837920
David-Valentin Neacsu - 2840781
Laetitia Maria Rossetti - 2839652
Goktug Yildirim - 2814081
