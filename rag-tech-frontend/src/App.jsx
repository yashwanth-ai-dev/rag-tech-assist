import React, { useState, useRef, useEffect } from "react";
import ThreeAvatar from "./components/ThreeAvatar";

/**
 * App.jsx
 * - History (localStorage)
 * - New Chat
 * - JSON output parsing + fallback
 * - Auto-scroll fix
 * - TTS (voice output) toggle
 * - Voice input (mic) toggle using Web Speech API
 *
 * Keep styles in src/index.css (provided below).
 */

const STORAGE_KEY = "rag_tech_history_v1";

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export default function App() {
  // UI state
  const [history, setHistory] = useState(loadHistory()); // array of { id, title, messages }
  const [activeChatId, setActiveChatId] = useState(() => (history[0] ? history[0].id : null));
  const [messages, setMessages] = useState(() => {
    if (history[0]) return history[0].messages;
    return [{ role: "system", text: "Connected to RAG-Tech backend." }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // refs for scroll
  const messagesRef = useRef(null);
  const bottomRef = useRef(null);

  // Ensure UI height and scrolling works
  useEffect(() => {
    // If no active chat select/create one
    if (!activeChatId) {
      // create new chat
      const id = `chat_${Date.now()}`;
      const newChat = {
        id,
        title: "New Chat",
        messages: [{ role: "system", text: "Connected to RAG-Tech backend." }],
      };
      const newHist = [newChat, ...history];
      setHistory(newHist);
      saveHistory(newHist);
      setActiveChatId(id);
      setMessages(newChat.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages to history whenever messages change
  useEffect(() => {
    if (!activeChatId) return;
    const idx = history.findIndex((h) => h.id === activeChatId);
    const updatedHistory = [...history];
    const title = messages.find((m) => m.role === "user") ? messages.find((m) => m.role === "user").text.slice(0, 40) : "Chat";
    const newTitle = title || "Chat";
    if (idx >= 0) {
      updatedHistory[idx] = { ...updatedHistory[idx], messages, title: newTitle };
    } else {
      updatedHistory.unshift({ id: activeChatId, title: newTitle, messages });
    }
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    // auto-scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Auto scroll when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup speech recognition (voice input) if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-IN"; // you can change or set dynamically
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    rec.onerror = (e) => {
      console.warn("Speech recognition error", e);
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {}
    };
  }, []);

  const startListen = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert("Speech recognition not supported in this browser.");
    try {
      rec.start();
      setListening(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const stopListen = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {}
    setListening(false);
  };

  // speak via TTS if enabled
  const speak = (text) => {
    if (!ttsEnabled || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      // optional voice selection heuristics:
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        // prefer a voice that looks natural (fallback)
        const preferred = voices.find((v) => v.lang?.startsWith("en")) || voices[0];
        if (preferred) u.voice = preferred;
      }
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("TTS error", e);
    }
  };

  // Robust fetch helper: parse JSON, fallback to text, handle various formats
  const fetchAnswer = async (question, context = "") => {
    const payload = { question };
    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // try json
      let data = null;
      try {
        data = await res.json();
      } catch {
        // fallback: raw text (maybe already JSON string or plain text)
        const txt = await res.text();
        try {
          data = JSON.parse(txt);
        } catch {
          data = { answer: txt };
        }
      }

      // canonicalize
      let answer = "";
      if (typeof data === "string") answer = data;
      else if (data?.answer) answer = data.answer;
      else if (data?.text) answer = data.text;
      else if (data?.choices && Array.isArray(data.choices) && data.choices[0]) {
        // handle older chat completion shapes
        const c = data.choices[0];
        answer = c.message?.content || c.text || JSON.stringify(c);
      } else {
        // fallback: stringify
        answer = JSON.stringify(data);
      }

      return answer;
    } catch (err) {
      console.warn("fetchAnswer err", err);
      throw new Error("Backend unreachable");
    }
  };

  // send message
  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await fetchAnswer(q);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
      speak(answer);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Error: Cannot reach backend. Make sure it's running." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // History actions
  const newChat = () => {
    const id = `chat_${Date.now()}`;
    const chat = { id, title: "New Chat", messages: [{ role: "system", text: "Connected to RAG-Tech backend." }] };
    const newHist = [chat, ...history];
    setHistory(newHist);
    saveHistory(newHist);
    setActiveChatId(id);
    setMessages(chat.messages);
    setInput("");
  };

  const selectChat = (id) => {
    const h = history.find((c) => c.id === id);
    if (!h) return;
    setActiveChatId(id);
    setMessages(h.messages);
    setInput("");
  };

  const deleteChat = (id) => {
    const newHist = history.filter((h) => h.id !== id);
    setHistory(newHist);
    saveHistory(newHist);
    if (id === activeChatId) {
      if (newHist[0]) {
        setActiveChatId(newHist[0].id);
        setMessages(newHist[0].messages);
      } else {
        // create fresh
        setActiveChatId(null);
        setMessages([{ role: "system", text: "Connected to RAG-Tech backend." }]);
      }
    }
  };

  return (
    <div className="app-root neon-bg min-h-screen flex">
      {/* Sidebar */}
      <aside className="sidebar glass-card p-4 w-72 flex flex-col gap-4">
        <button onClick={newChat} className="btn-new-chat">
          + New Chat
        </button>

        <div className="flex items-center justify-between text-sm text-gray-300">
          <div>History</div>
          <div className="text-xs text-gray-400">{history.length}</div>
        </div>

        <div className="history-list overflow-y-auto flex-1">
          {history.length === 0 && <div className="text-gray-400 text-sm">No chats yet</div>}
          {history.map((h) => (
            <div
              key={h.id}
              className={`history-item p-2 rounded cursor-pointer flex items-center justify-between ${
                h.id === activeChatId ? "active" : "hoverable"
              }`}
              onClick={() => selectChat(h.id)}
            >
              <div className="truncate">{h.title || "Chat"}</div>
              <div className="flex gap-2 items-center">
                <button
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(h.id);
                  }}
                  className="text-xs text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="controls flex gap-2">
          <button
            onClick={() => setTtsEnabled((s) => !s)}
            className={`control-btn ${ttsEnabled ? "on" : ""}`}
          >
            {ttsEnabled ? "🔊 Voice ON" : "🔇 Voice OFF"}
          </button>

          <button
            onClick={() => {
              if (listening) stopListen();
              else startListen();
            }}
            className={`control-btn ${listening ? "listening" : ""}`}
          >
            {listening ? "🎙️ Listening..." : "🎤 Voice Input"}
          </button>
        </div>
      </aside>

      {/* Main Pane */}
      <main className="main-pane flex-1 flex flex-col">
        <div className="avatar-area p-4">
          <div className="avatar-container glass-card p-3 flex items-center gap-4">
            <div style={{ width: 140, height: 120 }}>
              <ThreeAvatar />
            </div>
            <div>
              <div className="text-xl font-semibold">RAG-Tech Assistant</div>
              <div className="text-sm text-gray-300">Answers only from your uploaded docs</div>
            </div>
          </div>
        </div>

        <div className="chat-window flex-1 flex flex-col glass-card m-4 p-4">
          <div
            ref={messagesRef}
            className="messages flex-1 overflow-y-auto pr-2 pb-2 flex flex-col gap-3"
            role="log"
            aria-live="polite"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-row ${msg.role === "user" ? "user" : msg.role === "assistant" ? "assistant" : "system"}`}
              >
                <div className="message-bubble whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="composer mt-4">
            <textarea
              className="composer-input"
              placeholder="Ask something about tech…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={3}
            />
            <div className="composer-actions flex items-center gap-3 mt-3">
              <button onClick={sendMessage} className="btn-send" disabled={loading}>
                {loading ? "Thinking..." : "Send"}
              </button>
              <div className="text-sm text-gray-400">Press Enter to send</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
