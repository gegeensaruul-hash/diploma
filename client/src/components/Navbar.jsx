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

  const statusColor = { todo: "#94a3b8", in_progress: "#3b82f6", completed: "#22c55e" };
  const priColor = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  const priLabel = lang === "mn"
    ? { high: "Өндөр", medium: "Дунд", low: "Бага" }
    : { high: "High", medium: "Med", low: "Low" };
  const statusLabel = lang === "mn"
    ? { todo: "Хийх", in_progress: "Хийж байна", completed: "Дууссан" }
    : { todo: "To Do", in_progress: "In Progress", completed: "Done" };

  if (q.trim().length === 0) return null;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
      background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
      border: "1px solid #e2e8f0", zIndex: 200, overflow: "hidden",
    }}>
      {results.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          {lang === "mn" ? "Олдсонгүй" : "No results"}
        </div>
      ) : results.map(todo => (
        <div key={todo.id}
          onClick={() => { navigate("/todos"); onClose(); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[todo.status], flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 500,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textDecoration: todo.status === "completed" ? "line-through" : "none" }}>
              {todo.title}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: priColor[todo.priority] }}>{priLabel[todo.priority]}</span>
            <span style={{ fontSize: 10, color: statusColor[todo.status] }}>{statusLabel[todo.status]}</span>
          </div>
        </div>
      ))}
      <div style={{ padding: "8px 14px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
        <button onClick={() => { navigate("/todos"); onClose(); }}
          style={{ fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
          {lang === "mn" ? "Бүх todo харах →" : "View all todos →"}
        </button>
      </div>
    </div>
  );
}

export default function Navbar({ onChatToggle, chatOpen, onMenuToggle, sidebarOpen }) {
  const { user } = useSelector((s) => s.auth);
  const { t, lang } = useSettings();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
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
    <header style={{
      height: 56, background: "white", borderBottom: "1px solid #e2e8f0",
      display: "flex", alignItems: "center", padding: "0 20px", gap: 10,
      flexShrink: 0, zIndex: 10,
    }}>
      {/* Burger */}
      <button onClick={onMenuToggle} style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: sidebarOpen ? "#f1f5f9" : "white",
        border: "1px solid #e2e8f0", cursor: "pointer", color: "#475569", transition: "all .15s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#e9eef5"}
        onMouseLeave={e => e.currentTarget.style.background = sidebarOpen ? "#f1f5f9" : "white"}
      >
        <MdMenu size={19} />
      </button>

      {/* Greeting */}
      <span style={{ fontSize: 14, fontWeight: 600, color: "#475569", flexShrink: 0, whiteSpace: "nowrap" }}>
        {t.hello}, {user?.name} 👋
      </span>

      {/* Search — inline after greeting */}
      <div ref={wrapRef} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: focused ? "white" : "#f8fafc",
          borderRadius: 10, padding: "7px 12px",
          border: focused ? "1.5px solid #fcd34d" : "1px solid #e2e8f0",
          boxShadow: focused ? "0 0 0 3px rgba(251,191,36,0.15)" : "none",
          transition: "all .15s",
        }}>
          <MdSearch size={16} style={{ color: focused ? "#d97706" : "#94a3b8", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={lang === "mn" ? "Хайх..." : "Search..."}
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: "#1e293b", minWidth: 0,
            }}
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", display: "flex", flexShrink: 0, padding: 0 }}>
              <MdClose size={14} />
            </button>
          )}
        </div>
        <SearchDropdown q={q} setQ={setQ} onClose={() => { setFocused(false); setQ(""); }} />
      </div>

      <div style={{ flex: 1 }} />

      {/* Date */}
      <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>
        {new Date().toLocaleDateString(lang === "en" ? "en-US" : "mn-MN", { year: "numeric", month: "short", day: "numeric" })}
      </span>

      {/* Chat */}
      <button onClick={onChatToggle} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 8, border: "none",
        background: chatOpen ? "#eff6ff" : "transparent",
        color: chatOpen ? "#2563eb" : "#64748b",
        cursor: "pointer", fontSize: 13, fontWeight: 500,
        flexShrink: 0, transition: "all .15s",
      }}>
        <MdChat size={17} />
        <span>Chat</span>
        {chatOpen && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />}
      </button>
    </header>
  );
}
