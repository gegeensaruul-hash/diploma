import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { MdClose, MdSend, MdSmartToy, MdPerson, MdAutoAwesome, MdDelete } from "react-icons/md";
import { useSettings } from "../context/SettingsContext";

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 4px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
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
  "Todo-г яаж ангилах вэ?",
];
const SUGGESTIONS_EN = [
  "Summarize my tasks for today",
  "Give me productivity tips",
  "How should I prioritize tasks?",
];

export default function AIChat({ onClose }) {
  const { user } = useSelector(s => s.auth);
  const { lang, theme } = useSettings();
  const mn = lang === "mn";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: mn
        ? `Сайн байна уу, ${user?.name || ""}! Би таны Groq AI туслах. Юу тусалж болох вэ? 🤖`
        : `Hi ${user?.name || ""}! I'm your Groq AI assistant. How can I help you today? 🤖`,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
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
        ? `Чат цэвэрлэгдлээ. Юу тусалж болох вэ? 🤖`
        : `Chat cleared. How can I help you? 🤖`,
    }]);
  };

  const suggestions = mn ? SUGGESTIONS_MN : SUGGESTIONS_EN;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "13px 16px",
        borderBottom: "1px solid #e2e8f0", flexShrink: 0,
        background: `linear-gradient(135deg, ${theme.sidebar}, ${theme.accent}22)`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: `0 4px 12px ${theme.accent}40`,
        }}>
          <MdAutoAwesome size={18} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>
            {mn ? "Groq AI Туслах" : "Groq AI Assistant"}
          </p>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", margin: 0 }}>
            {loading
              ? (mn ? "Бичиж байна..." : "Typing...")
              : (mn ? "Llama 3.3 70B • Онлайн" : "Llama 3.3 70B • Online")}
          </p>
        </div>
        <button onClick={clearChat} title={mn ? "Цэвэрлэх" : "Clear chat"} style={{
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)",
          marginRight: 2, transition: "background 0.15s",
        }}>
          <MdDelete size={15} />
        </button>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          transition: "background 0.15s",
        }}>
          <MdClose size={15} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 12px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", gap: 8,
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
          }}>
            {/* Avatar */}
            <div style={{
              width: 27, height: 27, borderRadius: 9, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: msg.role === "user"
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`
                : "#f1f5f9",
              boxShadow: msg.role === "user" ? `0 2px 8px ${theme.accent}30` : "none",
            }}>
              {msg.role === "user"
                ? <MdPerson size={14} color="white" />
                : <MdSmartToy size={14} color="#64748b" />}
            </div>
            {/* Bubble */}
            <div style={{
              maxWidth: "80%",
              padding: "10px 13px",
              borderRadius: msg.role === "user"
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              background: msg.role === "user"
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`
                : "#f8fafc",
              color: msg.role === "user" ? "white" : "#1e293b",
              fontSize: 13.5,
              lineHeight: 1.6,
              boxShadow: msg.role === "user"
                ? `0 2px 10px ${theme.accent}25`
                : "0 1px 3px rgba(0,0,0,0.05)",
              border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{
              width: 27, height: 27, borderRadius: 9, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#f1f5f9",
            }}>
              <MdSmartToy size={14} color="#64748b" />
            </div>
            <div style={{
              padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        {/* Quick suggestions — show only at start */}
        {messages.length === 1 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", fontWeight: 500 }}>
              {mn ? "Санал болгох асуултууд:" : "Suggested questions:"}
            </p>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 10, padding: "8px 12px",
                  fontSize: 12.5, color: "#475569", cursor: "pointer",
                  textAlign: "left", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={e => { e.target.style.background = "#f8fafc"; e.target.style.borderColor = "#e2e8f0"; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px", borderTop: "1px solid #e2e8f0", flexShrink: 0,
        display: "flex", gap: 8, alignItems: "flex-end",
        background: "#fafcff",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          placeholder={mn ? "Асуулт бичих... (Enter → илгээх)" : "Ask something... (Enter to send)"}
          rows={1}
          style={{
            flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12,
            padding: "9px 13px", fontSize: 13.5, outline: "none",
            resize: "none", maxHeight: 100,
            fontFamily: "inherit", color: "#1e293b", background: "white",
            lineHeight: 1.5, transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
          }}
          onFocus={e => {
            e.target.style.borderColor = theme.accent;
            e.target.style.boxShadow = `0 0 0 3px ${theme.accent}18`;
          }}
          onBlur={e => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 38, height: 38, borderRadius: 11, border: "none",
            cursor: input.trim() && !loading ? "pointer" : "default",
            background: input.trim() && !loading
              ? `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`
              : "#e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
            color: input.trim() && !loading ? "white" : "#94a3b8",
            boxShadow: input.trim() && !loading ? `0 4px 14px ${theme.accent}30` : "none",
          }}
        >
          <MdSend size={16} />
        </button>
      </div>
    </div>
  );
}
