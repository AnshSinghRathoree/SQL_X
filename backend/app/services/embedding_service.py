from sklearn.feature_extraction.text import HashingVectorizer


class EmbeddingService:
    _vectorizer = None

    def __init__(self):
        if EmbeddingService._vectorizer is None:
            print("Loading lightweight embedding vectorizer...")

            EmbeddingService._vectorizer = HashingVectorizer(
                n_features=384,
                alternate_sign=False,
                norm="l2"
            )

        self.vectorizer = EmbeddingService._vectorizer

    def generate_embedding(self, text: str):
        embedding = self.vectorizer.transform([text]).toarray()[0]
        return embedding.tolist()

    def generate_embeddings(self, texts: list[str]):
        embeddings = self.vectorizer.transform(texts).toarray()
        return embeddings.tolist()