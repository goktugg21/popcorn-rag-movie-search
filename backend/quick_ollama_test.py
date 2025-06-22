from utils.rag_tools import getQEngine, chat

if __name__ == "__main__":
    try:
        print("Loading query engine...")
        qengine = getQEngine()
        print("Query engine loaded. Running test query...")
        response = chat("Find me some action movies with great special effects", qengine)
        print("AI Response:")
        print(response)
    except Exception as e:
        print("Error during Ollama test:", e) 