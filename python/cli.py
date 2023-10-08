import os
import typer
from dotenv import load_dotenv
from tqdm import tqdm

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

import pinecone
from langchain.vectorstores import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings


# Load environment variables from .env file
load_dotenv()

# Pinecone recommends a limit of 100 vectors per upsert request
UPSERT_CHUNK_SIZE = 50

app = typer.Typer(help="CLI tool for managing spect-v1's pinecone index")

@app.command()
def list_env_vars():
    """
    List all environment variables
    """
    for key, value in os.environ.items():
        print(f"{key}={value}")

@app.command()
def list_docs():
    """
    List all documents in the data directory
    """
    cwd = os.getcwd() + "/data"
    files = os.listdir(cwd)
    for file in files:
        print(file)

@app.command()
def list_indexes():
    """
    List all indexes in the pinecone environment
    """
    pinecone.init(
        api_key=os.environ['PINECONE_API_KEY'],
        environment=os.environ['PINECONE_ENVIRONMENT']
    )
    indexes = pinecone.list_indexes()
    
    if len(indexes) == 0:
        print("No indexes found")
        return

    for index in indexes:
        print(index)

@app.command()
def create_index(name: str = os.environ['PINECONE_INDEX'], dimension: int = 1536, metric: str = "cosine"):
    """
    Create a new index
    """
    pinecone.init(
        api_key=os.environ['PINECONE_API_KEY'],
        environment=os.environ['PINECONE_ENVIRONMENT']
    )
    pinecone.create_index(name=name, dimension=dimension, metric=metric)


@app.command()
def delete_index(name: str = os.environ['PINECONE_INDEX']):
    """
    Delete the pinecone index
    """
    pinecone.init(
        api_key=os.environ['PINECONE_API_KEY'],
        environment=os.environ['PINECONE_ENVIRONMENT']
    )
    pinecone.delete_index(name=name)


@app.command()
def describe_index():
    """
    Describe the pinecone index
    """
    pinecone.init(
        api_key=os.environ['PINECONE_API_KEY'],
        environment=os.environ['PINECONE_ENVIRONMENT']
    )

    indexes = pinecone.list_indexes()
    
    if len(indexes) == 0:
        print("No indexes available")
        return

    index_description = pinecone.describe_index(name=os.environ['PINECONE_INDEX'])
    print(index_description)


@app.command(help="Upsert all documents in the data directory, chunked by CHUNK_SIZE with overlap CHUNK_OVERLAP")
def upsert_all(chunk_size: int = 1000, chunk_overlap: int = 200):
    """
    Upsert all documents in the data directory
    """
    cwd = os.getcwd() + "/data"
    files = os.listdir(cwd)
    for file in files:
        file_path = cwd + "/" + file

        # load coument 
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        # split document into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        texts = text_splitter.split_documents(pages)


        # create embeddings
        embeddings = OpenAIEmbeddings()
        pinecone.init(
            api_key=os.environ['PINECONE_API_KEY'],
            environment=os.environ['PINECONE_ENVIRONMENT']
        )

        print(f"Upserting {file}'s {len(texts)} vectors...")
        for i in tqdm(range(len(texts), UPSERT_CHUNK_SIZE)):
            chunk = texts[slice(i, i+UPSERT_CHUNK_SIZE)]
            Pinecone.from_documents(
                chunk,
                embeddings,
                index_name=os.environ['PINECONE_INDEX'],
                namespace="combined_pdfs",
            )

if __name__ == "__main__":
    # Run CLI
    app()