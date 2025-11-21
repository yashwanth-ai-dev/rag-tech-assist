from groq import Groq
import os


client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a senior IT technician with deep expertise in:
- Windows troubleshooting
- Linux troubleshooting
- Networking (DNS, DHCP, routing, WiFi)
- Hardware diagnostics
- Cybersecurity & malware handling
- Active Directory
- ITSM workflow (tickets, SLAs, documentation)

Rules:
1. Always use ONLY the provided context. If answer is not in context, say:
   "I don't have enough data in my knowledge base for this. Please add more documents."
2. Never hallucinate missing information.
3. Use a technician mindset:
   - Isolate the issue
   - Check simplest causes first
   - Provide exact commands, paths, logs
4. Keep answers practical, concise and structured.
5. Use this format:

🔧 Problem Summary:
<short explanation>

💡 Likely Causes:
- cause 1
- cause 2

🛠️ Step-by-Step Fix:
1. ...
2. ...

📌 Notes:
- ...
"""

def generate_answer(query: str, context: str) -> str:
    prompt = f"""
CONTEXT:
{context}

QUESTION:
{query}

Using ONLY the above context, generate a technical answer in the required format.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=512,
    )

    return response.choices[0].message.content.strip()
