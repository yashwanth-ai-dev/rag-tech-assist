# backend/retrieve.py
import faiss, pickle
from sentence_transformers import SentenceTransformer
import numpy as np

INDEX_PATH = "../vectors/faiss.index"
META_PATH = "../vectors/meta.pkl"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

class Retriever:
    def __init__(self):
        self.index = faiss.read_index(INDEX_PATH)
        with open(META_PATH, "rb") as f:
            self.meta = pickle.load(f)
        self.model = SentenceTransformer(MODEL_NAME)

    def retrieve(self, query, k=5):
        q_emb = self.model.encode([query])
        D, I = self.index.search(q_emb, k)
        results = []
        for idx in I[0]:
            results.append(self.meta[idx])
        return results

if __name__ == "__main__":
    r = Retriever()
    q = "how to reset a Windows password?"
    print(r.retrieve(q, k=5))
