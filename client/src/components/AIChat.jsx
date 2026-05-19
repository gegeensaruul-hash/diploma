import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { MdClose, MdSend, MdSmartToy, MdPerson, MdAutoAwesome } from "react-icons/md";
import { useSettings } from "../context/SettingsContext";

const SYSTEM_PROMPT = `You are a helpful AI assistant built into a Todo & Productivity app. 
You help users manage their tasks, give productivity tips, answer questions, and assist with anything they need.
Be concise, friendly, and helpful. If the user writes in Mongolian, respond in Mongolian. If in English, respond in English.`;

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function AIChat({ onClose }) {
  const { user } = useSelector(s => s.auth);
  const { lang, theme } = useSettings();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: lang === "mn"
        ? `Сайн байна уу, ${user?.name || ""}! Би таны AI туслах. Юу тусалж болох вэ? 🤖`
        : `Hi ${user?.name || ""}! I'm your AI assistant. How can I help you today? 🤖`,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || (lang === "mn" ? "Алдаа гарлаа" : "Something went wrong");
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: lang === "mn" ? "Сүлжээний алдаа гарлаа. Дахин оролдоно уу." : "Network error. Please try again.",
      }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        borderBottom: "1px solid #e2e8f0", flexShrink: 0,
        background: `linear-gradient(135deg, ${theme.sidebar}, ${theme.accent}22)`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <MdAutoAwesome size={17} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>AI Assistant</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {loading ? (lang === "mn" ? "Бичиж байна..." : "Typing...") : (lang === "mn" ? "Онлайн" : "Online")}
          </p>
        </div>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white",
        }}>
          <MdClose size={15} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
          }}>
            {/* Avatar */}
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: msg.role === "user"
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`
                : "#f1f5f9",
            }}>
              {msg.role === "user"
                ? <MdPerson size={14} color="white" />
                : <MdSmartToy size={14} color="#64748b" />}
            </div>
            {/* Bubble */}
            <div style={{
              maxWidth: "78%",
              padding: "9px 12px",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user"
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})`
                : "#f8fafc",
              color: msg.role === "user" ? "white" : "#1e293b",
              fontSize: 13,
              lineHeight: 1.55,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9",
            }}>
              <MdSmartToy size={14} color="#64748b" />
            </div>
            <div style={{
              padding: "9px 14px", borderRadius: "14px 14px 14px 4px",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px", borderTop: "1px solid #e2e8f0", flexShrink: 0,
        display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          placeholder={lang === "mn" ? "Асуулт бичих..." : "Ask something..."}
          rows={1}
          style={{
            flex: 1, border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px",
            fontSize: 13, outline: "none", resize: "none", maxHeight: 90,
            fontFamily: "inherit", color: "#1e293b", background: "#f8fafc",
            lineHeight: 1.5,
          }}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px";
          }}
          onFocus={e => { e.target.style.borderColor = theme.accent; e.target.style.background = "white"; }}
          onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
            background: input.trim() && !loading ? `linear-gradient(135deg, ${theme.accent}, ${theme.sidebar})` : "#e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all .15s",
            color: input.trim() && !loading ? "white" : "#94a3b8",
          }}
        >
          <MdSend size={16} />
        </button>
      </div>
    </div>
  );
}
