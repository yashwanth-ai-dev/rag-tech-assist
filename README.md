🚀 RAG-Tech Bot

A fully local RAG (Retrieval-Augmented Generation) AI system powered by FAISS, Groq LLaMA 3.3, and a React + Three.js frontend.

This project includes:

✔ Backend: FastAPI + FAISS + RAG pipeline
✔ Frontend: Modern neon UI + 3D animated bot (Three.js)
✔ Real-time chat + text-to-speech + history
✔ Works locally and can be deployed through Cloudflare Tunnel

🔧 Tech Stack
Backend

Python 3.9+

FastAPI

FAISS

Sentence Transformers

Groq API (LLaMA 3.3–70B)

Reranking (MiniLM)

Context boosting

Frontend

React + Vite

TailwindCSS

Three.js (3D Avatar)

Neon/Glass UI

Voice TTS

📦 Installation Steps
1️⃣ Clone the repository
git clone https://github.com/USERNAME/rag-tech-bot.git
cd rag-tech-bot

🖥️ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate   (Windows)
source venv/bin/activate (Linux/Mac)

Install dependencies
pip install -r requirements.txt

Add your Groq Key

Create .env inside backend/:

GROQ_API_KEY=your_api_key

Run backend
uvicorn app:app --reload


Backend runs on:

👉 http://127.0.0.1:8000

🎨 Frontend Setup
cd ../rag-tech-frontend
npm install
npm run dev


Frontend runs on:

👉 http://127.0.0.1:5173

🌐 Optional: Access your bot from ANY device (FREE)
Install Cloudflare Tunnel

https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

Then run:

cloudflared tunnel --url http://127.0.0.1:8000


You will get a free public URL like:

https://perfect-owl-dawn.trycloudflare.com

📂 Project Structure
backend/
    app.py                  → FastAPI server
    rag_pipeline.py         → Full RAG logic
    retriever.py            → FAISS retrieval
    reranker.py             → Reranking
    generator.py            → Groq LLM generator
    context_booster.py      → Boost responses
    translator.py           → Language tools
    chunker.py              → Chunk builder
    vectors/                → FAISS & metadata
    data/                   → Knowledge base
    requirements.txt

rag-tech-frontend/
    src/App.jsx             → Main UI
    src/index.css           → Styling
    src/components/         → Avatar + UI
    package.json
    vite.config.js

⭐ How others can run your bot locally

Anyone can follow exact same steps:

Clone repo

Create backend virtual environment

Install dependencies

Add their own Groq API key

Run backend

Install Node dependencies

Run frontend

Everything works out of the box.

📜 License

Open-source — free to use.

🎉 Credits

Built by Yash, powered by Groq + FAISS.

💬 Need help?

Open an issue or contact me.
