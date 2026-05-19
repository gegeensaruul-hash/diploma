import { useState } from "react";
import { useGetStatsQuery, useGetTodosQuery } from "../redux/slices/api/todoApiSlice";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import {
  MdOutlineChecklist, MdOutlineRadioButtonUnchecked, MdOutlineTimer, MdOutlineCheckCircle,
  MdArrowUpward, MdArrowDownward, MdDragHandle,
} from "react-icons/md";

const PRIORITY_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const PRIORITY_LABEL_MN = { high: "Өндөр", medium: "Дунд", low: "Бага" };
const PRIORITY_LABEL_EN = { high: "High", medium: "Medium", low: "Low" };
const STATUS_COLOR = { todo: "#94a3b8", in_progress: "#3b82f6", completed: "#22c55e" };

function StatCard({ label, count, icon, accent, to, sublabel }) {
  return (
    <Link to={to} style={{
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: "white", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
      textDecoration: "none", transition: "box-shadow .15s, transform .15s",
      minHeight: 110,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{count ?? "—"}</span>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sublabel}</div>}
      </div>
    </Link>
  );
}

function PriorityBar({ high = 0, medium = 0, low = 0, lang }) {
  const total = high + medium + low || 1;
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
        {lang === "mn" ? "Чухлын хуваарилалт" : "Priority breakdown"}
      </div>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 10, gap: 2 }}>
        {high > 0 && <div style={{ flex: high / total, background: "#ef4444", borderRadius: 4 }} title={`High: ${high}`} />}
        {medium > 0 && <div style={{ flex: medium / total, background: "#f59e0b", borderRadius: 4 }} title={`Medium: ${medium}`} />}
        {low > 0 && <div style={{ flex: low / total, background: "#22c55e", borderRadius: 4 }} title={`Low: ${low}`} />}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
        {[["#ef4444", lang === "mn" ? "Өндөр" : "High", high], ["#f59e0b", lang === "mn" ? "Дунд" : "Med", medium], ["#22c55e", lang === "mn" ? "Бага" : "Low", low]].map(([c, l, v]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />{l}: <b style={{ color: "#334155" }}>{v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t, theme, lang } = useSettings();
  const { data: statsData } = useGetStatsQuery();
  const { data: todosData } = useGetTodosQuery({ limit: 10 });
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const stats = statsData?.stats;
  const todos = todosData?.todos || [];

  const sorted = [...todos].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === "priority") {
      const order = { high: 0, medium: 1, low: 2 };
      va = order[va] ?? 3; vb = order[vb] ?? 3;
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <MdDragHandle size={13} style={{ color: "#cbd5e1" }} />;
    return sortDir === "asc"
      ? <MdArrowUpward size={13} style={{ color: theme.accent }} />
      : <MdArrowDownward size={13} style={{ color: theme.accent }} />;
  };

  const priorityLabel = lang === "mn" ? PRIORITY_LABEL_MN : PRIORITY_LABEL_EN;
  const statusLabel = {
    todo:        lang === "mn" ? "Хийх"       : "To Do",
    in_progress: lang === "mn" ? "Хийж байна" : "In Progress",
    completed:   lang === "mn" ? "Дууссан"    : "Done",
  };

  const completePct = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>
          {t.dashboard}
        </h2>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          {new Date().toLocaleDateString(lang === "en" ? "en-US" : "mn-MN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard label={lang === "mn" ? "Нийт" : "Total"} count={stats?.total} icon={<MdOutlineChecklist size={20} />} accent={theme.accent} to="/todos" />
        <StatCard label={lang === "mn" ? "Хийх" : "To Do"} count={stats?.todo} icon={<MdOutlineRadioButtonUnchecked size={20} />} accent="#94a3b8" to="/todos/todo" />
        <StatCard label={lang === "mn" ? "Хийж байна" : "In Progress"} count={stats?.in_progress} icon={<MdOutlineTimer size={20} />} accent="#3b82f6" to="/todos/in_progress" />
        <StatCard label={lang === "mn" ? "Дууссан" : "Completed"} count={stats?.completed} icon={<MdOutlineCheckCircle size={20} />} accent="#22c55e" to="/todos/completed" />
      </div>

      {/* Progress + priority */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Progress */}
        <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
            {lang === "mn" ? "Нийт явц" : "Overall progress"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Circle */}
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="36" cy="36" r="28" fill="none" stroke={theme.accent} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - completePct / 100)}`}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset .5s" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                {completePct}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { label: lang === "mn" ? "Дууссан" : "Done", val: stats?.completed, color: "#22c55e" },
                { label: lang === "mn" ? "Хийж байна" : "In Progress", val: stats?.in_progress, color: "#3b82f6" },
                { label: lang === "mn" ? "Хийх" : "To Do", val: stats?.todo, color: "#e2e8f0" },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
                    {r.label}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{r.val ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority */}
        <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <PriorityBar high={stats?.high ?? 0} medium={stats?.medium ?? 0} low={stats?.low ?? 0} lang={lang} />
        </div>
      </div>

      {/* Todo list — sortable */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            {lang === "mn" ? "Сүүлийн Todo-нууд" : "Recent Todos"}
          </h3>
          <Link to="/todos" style={{ fontSize: 12, color: theme.accent, textDecoration: "none", fontWeight: 500 }}>
            {lang === "mn" ? "Бүгдийг харах →" : "View all →"}
          </Link>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 90px", padding: "8px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          {[
            { f: "title",     l: lang === "mn" ? "Гарчиг"    : "Title" },
            { f: "priority",  l: lang === "mn" ? "Чухал"     : "Priority" },
            { f: "status",    l: lang === "mn" ? "Төлөв"     : "Status" },
            { f: "createdAt", l: lang === "mn" ? "Огноо"     : "Date" },
          ].map(({ f, l }) => (
            <button key={f} onClick={() => toggleSort(f)}
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: sortField === f ? theme.accent : "#64748b", padding: 0 }}>
              {l} <SortIcon field={f} />
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            {lang === "mn" ? "Todo байхгүй байна" : "No todos yet"}
          </div>
        ) : (
          <div>
            {sorted.map((todo, i) => (
              <div key={todo.id}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 90px 110px 90px",
                  padding: "11px 20px", borderBottom: i < sorted.length - 1 ? "1px solid #f8fafc" : "none",
                  alignItems: "center", transition: "background .1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLOR[todo.status], flexShrink: 0 }} />
                  <span style={{
                    fontSize: 13, fontWeight: 500, color: "#334155",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    textDecoration: todo.status === "completed" ? "line-through" : "none",
                  }}>{todo.title}</span>
                </div>
                {/* Priority */}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                  background: PRIORITY_COLOR[todo.priority] + "18",
                  color: PRIORITY_COLOR[todo.priority],
                  width: "fit-content",
                }}>
                  {priorityLabel[todo.priority]}
                </span>
                {/* Status */}
                <span style={{ fontSize: 12, color: STATUS_COLOR[todo.status], fontWeight: 500 }}>
                  {statusLabel[todo.status]}
                </span>
                {/* Date */}
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "mn-MN", { month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
