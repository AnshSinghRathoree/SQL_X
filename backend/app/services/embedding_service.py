class EmbeddingService:
    _model = None

    def __init__(self):
        if EmbeddingService._model is None:
            print("Loading quantized embedding model...")

            from sentence_transformers import SentenceTransformer

            EmbeddingService._model = SentenceTransformer(
                "sentence-transformers/paraphrase-MiniLM-L3-v2",
                backend="onnx",
                model_kwargs={
                    "file_name": "onnx/model_quint8_avx2.onnx",
                    "provider": "CPUExecutionProvider",
                },
            )

        self.model = EmbeddingService._model

    def generate_embedding(self, text: str):
        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
            batch_size=1,
            show_progress_bar=False,
        )

        return embedding.tolist()

    def generate_embeddings(self, texts: list[str]):
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            batch_size=1,
            show_progress_bar=False,
        )

        return embeddings.tolist()