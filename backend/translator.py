from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def translate_to_english(text):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": f"Translate this to English:\n{text}"}
        ]
    )
    return response.choices[0].message.content.strip()


def translate_from_english(text, target_language):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": f"Translate this to {target_language}:\n{text}"}
        ]
    )
    return response.choices[0].message.content.strip()


def detect_language(text):
    if any(ch in text for ch in "அஆஇஈஉஊஎஏஐஒஓஔஃஂ"):
        return "Tamil"
    if any(ch in text for ch in "अआइईउऊएऐओऔ"):
        return "Hindi"
    return "English"
