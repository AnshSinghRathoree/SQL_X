from app.services.dataset_service import DatasetService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore


class RAGService:

    def __init__(self):

        self.dataset_service = DatasetService()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()

    def index_dataset(self, metadata: dict):

        ids, documents, metadatas = (
            self.dataset_service.build_documents(metadata)
        )

        embeddings = self.embedding_service.generate_embeddings(
            documents
        )

        self.vector_store.clear()

        self.vector_store.add_documents(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )