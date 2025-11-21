import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


class Reranker:

    def __init__(self):
        self.model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)

        self.model.eval()

    def score_pair(self, query, passage):
        """
        Returns relevance score for (query, passage)
        Handles long text safely via truncation.
        """

        inputs = self.tokenizer(
            query,
            passage,
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=256,      # <-- critical fix
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            score = outputs.logits[0].item()

        return score

    def rerank(self, query, docs):
        """
        Takes list of docs [{content, source}], returns reranked list
        """

        if not docs:
            return []

        ranked = []
        for d in docs:
            try:
                score = self.score_pair(query, d["content"])
                ranked.append((score, d))
            except Exception as e:
                print("RERANK ERROR:", e)
                continue

        ranked.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in ranked]
