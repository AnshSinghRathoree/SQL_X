from app.services.dataset_service import DatasetService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore


class RAGService:
    def __init__(self):
        self.dataset_service = DatasetService()
        self.embedding_service = None
        self.vector_store = VectorStore()

    def _get_embedding_service(self):
        if self.embedding_service is None:
            self.embedding_service = EmbeddingService()
        return self.embedding_service

    def index_dataset(self, metadata: dict):
        ids, documents, metadatas = (
            self.dataset_service.build_documents(metadata)
        )

        embedding_service = self._get_embedding_service()

        embeddings = embedding_service.generate_embeddings(documents)

        self.vector_store.clear()

        self.vector_store.add_documents(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def retrieve_context(self, question: str, top_k: int = 3):
        embedding_service = self._get_embedding_service()

        question_embedding = embedding_service.generate_embedding(
            question
        )

        results = self.vector_store.search(
            embedding=question_embedding,
            top_k=top_k
        )

        documents = results["documents"][0]

        context = "\n\n".join(documents)

        return context