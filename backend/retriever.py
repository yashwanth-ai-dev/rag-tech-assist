import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer


class Retriever:
    def __init__(self):
        # -------- CONFIG -------- #
        self.EMB_MODEL = "sentence-transformers/distiluse-base-multilingual-cased-v2"
        self.EMB_DIM = 512
        
        # -------- Load embedding model once -------- #
        self.model = SentenceTransformer(self.EMB_MODEL)

        # -------- Load FAISS index -------- #
        self.index = faiss.read_index("vectors/faiss.index")

        # -------- Load metadata -------- #
        with open("vectors/meta.pkl", "rb") as f:
            self.meta = pickle.load(f)

        # Sanity check
        assert self.index.d == self.EMB_DIM, (
            f"FAISS index dimension mismatch! "
            f"Index = {self.index.d}, Model = {self.EMB_DIM}"
        )

    # -----------------------------
    # Clean text before encoding
    # -----------------------------
    def _clean(self, text: str) -> str:
        return (
            text.replace("\n", " ")
                .replace("\t", " ")
                .strip()
        )

    # -----------------------------
    # Encode input to FAISS format
    # -----------------------------
    def _embed(self, text: str):
        text = self._clean(text)
        emb = self.model.encode([text], convert_to_numpy=True)

        # Ensure shape = (1, 512)
        if len(emb.shape) == 1:
            emb = np.expand_dims(emb, axis=0)

        return emb.astype("float32")

    # -----------------------------
    # Search the vector DB
    # -----------------------------
    def search(self, query: str, k: int = 5):
        query = query.strip()

        if not query:
            return []

        # --- FIXED: embedding shape issue here ---
        query_vec = self._embed(query)

        # --- Run FAISS search ---
        distances, indices = self.index.search(query_vec, k)

        results = []

        for idx in indices[0]:
            if idx == -1:
                continue
            results.append(self.meta[idx])

        return results
