import chromadb
from chromadb.config import Settings


class VectorStore:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path="chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="sql_x_dataset"
        )

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict]
    ):

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def search(
        self,
        embedding: list[float],
        top_k: int = 5
    ):

        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k
        )

        return results

    def clear(self):

        self.client.delete_collection("sql_x_dataset")

        self.collection = self.client.get_or_create_collection(
            name="sql_x_dataset"
        )