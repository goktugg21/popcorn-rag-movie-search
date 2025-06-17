import json
from sqlalchemy import create_engine, insert
from llama_index.vector_stores.postgres import PGVectorStore
from models.movieModel import Movie
from llama_index.core.vector_stores.utils import (
    node_to_metadata_dict,
)

class MovieVectorStore(PGVectorStore):
    def __init__(self, connection_string, table_name="data_movies", **kwargs):
        super().__init__(connection_string=connection_string, table_name=table_name, **kwargs)
        self.connection_string = connection_string
        self.table_name = "data_" + table_name

    def add(self, nodes, **kwargs):
        """
        Overrides the add method to insert movie data into the database.
        Args:
            nodes (list): A list of nodes to be added to the vector store.
        Returns:
            list: A list of node IDs that were added to the vector store.
        """
        records = []
        # Convert each node to a dictionary and prepare for insertion
        for node in nodes:
            md = node.metadata
            rec = {
                "node_id": node.id_,
                "embedding": node.embedding,
                "text": node.text,
                "metadata_": node_to_metadata_dict(node, remove_text=True),
                "imdb_id": md.get("imdb_id"),
                "popularity": md.get("popularity"),
                "budget": md.get("budget"),
                "revenue": md.get("revenue"),
                "original_title": md.get("original_title"),
                "stars": md.get("stars"),
                "homepage": md.get("homepage"),
                "director": md.get("director"),
                "tagline": md.get("tagline"),
                "keywords": md.get("keywords"),
                "runtime": md.get("runtime"),
                "genres": md.get("genres"),
                "release_date": md.get("release_date") if md.get("release_date") else None,
                "vote_count": md.get("vote_count"),
                "vote_average": md.get("vote_average"),
                "release_year": md.get("release_year"),
                "character_tropes": md.get("character_tropes"),
            }
            records.append(rec)
        # Prepare the SQL insert statement
        stmt = (
            insert(Movie)
            .values(records)
        )
        # Create the engine and execute the insert statement
        engine = create_engine(self.connection_string)
        with engine.begin() as conn:
            conn.execute(stmt)
        return [node.id_ for node in nodes]