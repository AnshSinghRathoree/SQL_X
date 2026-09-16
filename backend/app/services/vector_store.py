import chromadb


class VectorStore:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path="chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="sql_x_dataset"
        )

    def _refresh_collection(self):
        """
        Always get the latest collection reference.
        Prevents stale references after delete/recreate.
        """
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

        self._refresh_collection()

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

        self._refresh_collection()

        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k
        )

        return results

    def clear(self):

        try:
            self.client.delete_collection("sql_x_dataset")
        except Exception:
            # Collection may not exist yet.
            pass

        self._refresh_collection()