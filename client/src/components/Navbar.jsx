import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdChat, MdMenu, MdSearch, MdClose } from "react-icons/md";
import { useSettings } from "../context/SettingsContext";
import { useGetTodosQuery } from "../redux/slices/api/todoApiSlice";

function SearchDropdown({ q, setQ, onClose }) {
  const { lang } = useSettings();
  const navigate = useNavigate();
  const { data } = useGetTodosQuery({ search: q }, { skip: q.trim().length < 1 });
  const results = (data?.todos || []).filter(t =>
    t.title?.toLowerCase().includes(q.toLowerCase()) ||
    t.description?.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 6);

  const statusColor = { todo: "#94a3b8", in_progress: "#ffffff", completed: "#10b981" };
  const priColor = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
  const priLabel = lang === "mn"
    ? { high: "Өндөр", medium: "Дунд", low: "Бага" }
    : { high: "High", medium: "Med", low: "Low" };
  const statusLabel = lang === "mn"
    ? { todo: "Хийх", in_progress: "Хийж байна", completed: "Дууссан" }
    : { todo: "To Do", in_progress: "In Progress", completed: "Done" };

  if (q.trim().length === 0) return null;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
      background: "var(--bg-card)", borderRadius: 16, 
      boxShadow: "0 20px 40px var(--shadow)",
      border: "1px solid var(--border)", zIndex: 200, overflow: "hidden",
      backdropFilter: "blur(12px)"
    }}>
      {results.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
          {lang === "mn" ? "Олдсонгүй" : "No results"}
        </div>
      ) : results.map(todo => (
        <div key={todo.id}
          onClick={() => { navigate("/todos"); onClose(); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--input-bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[todo.status], flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textDecoration: todo.status === "completed" ? "line-through" : "none" }}>
              {todo.title}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: priColor[todo.priority], padding: '2px 6px', background: `${priColor[todo.priority]}20`, borderRadius: 4 }}>
              {priLabel[todo.priority]}
            </span>
          </div>
        </div>
      ))}
      <div style={{ padding: "10px 16px", background: "var(--input-bg)", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => { navigate("/todos"); onClose(); }}
          style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          {lang === "mn" ? "Бүх todo харах →" : "View all todos →"}
        </button>
      </div>
    </div>
  );
}

export default function Navbar({ onChatToggle, chatOpen, onMenuToggle, sidebarOpen }) {
  const { user } = useSelector((s) => s.auth);
  const { t, lang, theme } = useSettings();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 flex items-center px-4 md:px-6 gap-2 md:gap-4 flex-shrink-0 z-10 bg-transparent" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Burger */}
      <button onClick={onMenuToggle} style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: sidebarOpen ? "var(--input-bg)" : "transparent",
        border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", transition: "all .2s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--input-bg)"}
        onMouseLeave={e => e.currentTarget.style.background = sidebarOpen ? "var(--input-bg)" : "transparent"}
      >
        <MdMenu size={20} />
      </button>

      {/* Greeting - Hidden on mobile */}
      <div className="hidden md:flex flex-col gap-px">
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>{t.hello},</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{user?.name} 👋</span>
      </div>

      {/* Search */}
      <div ref={wrapRef} className="relative flex-1 max-w-[420px] md:ml-5">
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: focused ? "var(--input-bg)" : "var(--input-bg)",
          borderRadius: 12, padding: "8px 14px",
          border: focused ? "1px solid var(--accent)" : "1px solid var(--border)",
          boxShadow: focused ? `0 0 0 4px ${theme.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` : "none",
          transition: "all .2s",
        }}>
          <MdSearch size={18} style={{ color: focused ? "var(--text)" : "var(--text3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={lang === "mn" ? "Хайх..." : "Search anything..."}
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: "var(--text)", minWidth: 0, fontFamily: "'Inter', sans-serif"
            }}
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "var(--text3)", display: "flex", flexShrink: 0, padding: 0 }}>
              <MdClose size={16} />
            </button>
          )}
        </div>
        <SearchDropdown q={q} setQ={setQ} onClose={() => { setFocused(false); setQ(""); }} />
      </div>

      <div style={{ flex: 1 }} />

      {/* Chat */}
      <button onClick={onChatToggle} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)",
        background: chatOpen ? "var(--input-bg)" : "transparent",
        color: chatOpen ? "var(--text)" : "var(--text3)",
        cursor: "pointer", fontSize: 13, fontWeight: 700,
        flexShrink: 0, transition: "all .2s",
      }}
        className="md:px-4"
        onMouseEnter={e => e.currentTarget.style.background = "var(--input-bg)"}
        onMouseLeave={e => e.currentTarget.style.background = chatOpen ? "var(--input-bg)" : "transparent"}
      >
        <MdChat size={18} />
        <span className="hidden md:inline">Chat</span>
      </button>
    </header>
  );
}
