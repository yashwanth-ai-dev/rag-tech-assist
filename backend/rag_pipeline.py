from .retriever import Retriever
from .reranker import Reranker
from .context_booster import ContextBooster
from .generator import generate_answer
from .query_expander import QueryExpander


retriever = Retriever()
reranker = Reranker()
booster = ContextBooster()
expander = QueryExpander()


def answer_query(query: str) -> str:
    """
    Full RAG pipeline:
    1. Normalize & clean query
    2. Expand short/weak queries
    3. Retrieve documents
    4. Rerank
    5. Context boosting
    6. Build context
    7. Generate final answer
    """

    # -------------------------
    # 1. Normalize query
    # -------------------------
    eng_query = query.strip()

    # -------------------------
    # 2. Expand short queries
    # -------------------------
    if len(eng_query.split()) <= 3:
        eng_query = expander.expand(eng_query)

    # -------------------------
    # 3. Retrieve documents
    # -------------------------
    docs = retriever.search(eng_query, k=15)

    # If retrieval is weak → expand & retry once
    if len(docs) < 2:
        expanded_query = expander.expand(eng_query)
        docs = retriever.search(expanded_query, k=15)
        eng_query = expanded_query  # use improved version

    # -------------------------
    # 4. Rerank top results
    # -------------------------
    docs = reranker.rerank(eng_query, docs)

    # -------------------------
    # 5. Boost context based on category
    # -------------------------
    docs = booster.boost(eng_query, docs)

    # -------------------------
    # 6. Build final context
    # -------------------------
    if docs:
        context = "\n\n".join(d["content"] for d in docs[:3])
    else:
        context = "No relevant context found."

    # -------------------------
    # 7. Generate final answer
    # -------------------------
    answer = generate_answer(eng_query, context)

    return answer
