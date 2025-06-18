from typing import Union
from llama_index.llms.ollama import Ollama

from llama_index.core import Document, Settings, StorageContext, VectorStoreIndex

from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.core.query_engine import BaseQueryEngine
from utils.MovieVectorStore import MovieVectorStore
import csv
import os
from dotenv import load_dotenv
from llama_index.core import StorageContext
from llama_index.core.base.response.schema import Response

def load_movies_from_csv(csv_path: str) -> list[Document]:
    """
    Load movies from a CSV file and convert them into a list of Document objects.
    Args:
        csv_path (str): The path to the CSV file containing movie data.
    Returns:
        list[Document]: A list of Document objects created from the CSV data.
    """
    documents: list[Document] = []
    with open(csv_path, encoding="utf-8") as f:
        # Initialize the CSV reader
        reader: csv.DictReader = csv.DictReader(f)
        # For every row in the CSV file, create a Document
        for row in reader:
            text: str = (row.get("overview") or "").strip()
            metadata:dict[str, Union[str, int, float]] = {
            "imdb_id": row.get("imdb_id"),
            "popularity": float(row.get("popularity") or 0),
            "budget": int(row.get("budget") or 0),
            "revenue": int(row.get("revenue") or 0),
            "original_title": row.get("original_title"),
            "stars": row.get("cast"),
            "homepage": row.get("homepage"),
            "director": row.get("director"),
            "tagline": row.get("tagline"),
            "keywords": row.get("keywords"),
            "overview": row.get("overview"),
            "runtime": int(row.get("runtime") or 0),
            "genres": row.get("genres"),
            "release_date": row.get("release_date"),
            "vote_count": int(row.get("vote_count") or 0),
            "vote_average": float(row.get("vote_average") or 0),
            "release_year": int(row.get("release_year") or 0),
            "character_tropes": (row.get("character_tropes") or ""),
            }
            
            doc_id: str = row.get("id")
            documents.append(Document(text=text, metadata=metadata, doc_id=doc_id))
    return documents
  

def create_index(docs: list[Document] = None) -> None:
    """
    Create the index from a list of documents.
    This function uses environment variables to configure the connection to the database.
    Args:
        docs (list[Document]): A list of Document objects to create the index from.
    
    """
    # Create the vector store and index
    vector_store: MovieVectorStore = MovieVectorStore.from_params(
        connection_string=os.getenv("PG_URL"),
        table_name="movies",
        embed_dim=768,
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
    )

    # Set the settings for llamaIndex
    Settings.llm = Ollama(
        model="mistral-nemo:latest",
        request_timeout=120.0,
        context_window=8000,
    )

    Settings.embed_model = OllamaEmbedding(
        model_name="nomic-embed-text:latest",
        base_url="http://localhost:11434",
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    Settings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=20)
    Settings.num_output = 512
    Settings.context_window = 3900

    # Create the index from the documents in the db
    VectorStoreIndex.from_documents(
        storage_context=storage_context,
        documents=docs,
        show_progress=True
    )
    print("Index created successfully.")

def getQEngine() -> BaseQueryEngine:
    """
    Get the query engine for the index.
    This function uses environment variables to configure the connection to the database.
    Returns:
        BaseQueryEngine: The query engine for the index.
    """
    vector_store: MovieVectorStore = MovieVectorStore.from_params(
        connection_string=os.getenv("PG_URL"),
        table_name="movies",
        embed_dim=768,
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        
    )

    Settings.embed_model = OllamaEmbedding(
        model_name="nomic-embed-text:latest",
        base_url="http://localhost:11434",
    )
    Settings.llm = Ollama(
        model="mistral-nemo:latest",
        request_timeout=120.0,
        context_window=8000,
    )
    Settings.num_output = 512
    Settings.context_window = 3900

    index: VectorStoreIndex = VectorStoreIndex.from_vector_store(vector_store=vector_store, embed_model=Settings.embed_model)
    query_engine:BaseQueryEngine = index.as_query_engine()

    return query_engine

def chat(query: str, query_engine: BaseQueryEngine) -> Response:
    """
    Chat with the index using the query engine.
    This function can be called to chat with the index and get a response.
    Args:
        query (str): Search the index with this query.
        query_engine (BaseQueryEngine): The query engine to use for the search.
    Returns:
        Response: The response from the query engine.
    """
    response: BaseQueryEngine = query_engine.query(query)
    return response
