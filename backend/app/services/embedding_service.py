class EmbeddingService:
    _model = None

    def __init__(self):
        if EmbeddingService._model is None:
            print("Loading lightweight embedding model...")

            from sentence_transformers import SentenceTransformer

            EmbeddingService._model = SentenceTransformer(
                "sentence-transformers/paraphrase-MiniLM-L3-v2",
                backend="onnx"
            )

        self.model = EmbeddingService._model

    def generate_embedding(self, text: str):
        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
            batch_size=1
        )

        return embedding.tolist()

    def generate_embeddings(self, texts: list[str]):
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            batch_size=1
        )

        return embeddings.tolist()