from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class QueryExpander:
    def expand(self, query: str) -> str:
        prompt = f"""
Expand the following short query into a full, meaningful technical question.
Make it detailed but not irrelevant.

Query: "{query}"

Expanded:
"""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
