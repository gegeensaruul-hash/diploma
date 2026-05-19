import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { MdClose, MdSend, MdSmartToy, MdPerson, MdAutoAwesome, MdDelete } from "react-icons/md";
import { useSettings } from "../context/SettingsContext";

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 4px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
          animation: "aiBounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes aiBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const SUGGESTIONS_MN = [
  "Өнөөдрийн ажлуудаа тоймлоод өг",
  "Бүтээмжтэй байх зөвлөгөө өг",
  "Ажлуудаа яаж зөв ангилах вэ?",
];
const SUGGESTIONS_EN = [
  "Summarize my tasks for today",
  "Give me productivity tips",
  "How to organize my workspace?",
];

export default function AIChat({ onClose }) {
  const { user } = useSelector(s => s.auth);
  const { lang, theme } = useSettings();
  const mn = lang === "mn";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: mn
        ? `Сайн байна уу, ${user?.name || ""}! Би таны Groq AI туслах. Танд юугаар туслах вэ? ✨`
        : `Hi ${user?.name || ""}! I'm your Groq AI assistant. How can I help you today? ✨`,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Helper: scroll to bottom (used only for AI replies)
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Track whether user is near the bottom
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  // When AI replies: only scroll if user was already at the bottom
  useEffect(() => {
    if (loading) return; // don't scroll while AI is typing
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setLoading(true);
    // Do NOT force-scroll here — let the user stay where they are

    try {
      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Server error");
      }

      const data = await response.json();
      const reply = data.reply || (mn ? "Алдаа гарлаа" : "Something went wrong");
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: mn
          ? `Алдаа гарлаа: ${err.message}. Дахин оролдоно уу.`
          : `Error: ${err.message}. Please try again.`,
      }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: mn
        ? `Чат цэвэрлэгдлээ. Юу тусалж болох вэ? ✨`
        : `Chat cleared. How can I help you? ✨`,
    }]);
  };

  const suggestions = mn ? SUGGESTIONS_MN : SUGGESTIONS_EN;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#020617", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
        background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)"
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
        }}>
          <MdAutoAwesome size={20} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeights: 800, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
            Groq AI Assistant
          </p>
          <p style={{ fontSize: 11, color: "#6366f1", margin: 0, fontWeight: 700 }}>
            {loading ? (mn ? "БОДОЖ БАЙНА..." : "THINKING...") : "ONLINE"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={clearChat} style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8"
          }} className="hover:text-red-400 transition-colors">
            <MdDelete size={18} />
          </button>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white"
          }} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: "auto", padding: "24px 20px",
          display: "flex", flexDirection: "column", gap: 20,
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", gap: 12,
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: msg.role === "user" ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)",
              color: msg.role === "user" ? "#6366f1" : "#94a3b8",
              border: `1px solid ${msg.role === "user" ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.08)"}`
            }}>
              {msg.role === "user" ? <MdPerson size={18} /> : <MdSmartToy size={18} />}
            </div>
            <div style={{
              maxWidth: "85%",
              padding: "14px 18px",
              borderRadius: msg.role === "user" ? "20px 2px 20px 20px" : "2px 20px 20px 20px",
              background: msg.role === "user" ? "#6366f1" : "rgba(15, 23, 42, 0.6)",
              color: msg.role === "user" ? "white" : "#cbd5e1",
              fontSize: 14,
              lineHeight: 1.6,
              border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.05)" : "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <MdSmartToy size={18} color="#94a3b8" />
            </div>
            <div style={{
              padding: "12px 16px", borderRadius: "2px 20px 20px 20px",
              background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <p style={{ fontSize: 11, color: "#6366f1", textAlign: "center", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
              Quick Suggestions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 12, padding: "12px 16px",
                    fontSize: 13, color: "#94a3b8", cursor: "pointer",
                    textAlign: "left", fontFamily: "inherit", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.02)"; e.target.style.borderColor = "rgba(255,255,255,0.05)"; e.target.style.color = "#94a3b8"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
        background: "rgba(15, 23, 42, 0.4)"
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "6px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder={mn ? "Асуулт бичих..." : "Ask anything..."}
            rows={1}
            style={{
              flex: 1, border: "none", background: "transparent",
              padding: "10px 14px", fontSize: 14, outline: "none",
              resize: "none", maxHeight: 120,
              fontFamily: "inherit", color: "white",
              lineHeight: 1.5,
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: 12, border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              background: input.trim() && !loading ? "#6366f1" : "rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
              color: input.trim() && !loading ? "white" : "#475569",
            }}
          >
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
