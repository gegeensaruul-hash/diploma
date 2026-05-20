import { useState } from "react";
import { useGetStatsQuery, useGetTodosQuery } from "../redux/slices/api/todoApiSlice";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import {
  MdOutlineChecklist, MdOutlineRadioButtonUnchecked, MdOutlineTimer, MdOutlineCheckCircle,
  MdArrowUpward, MdArrowDownward, MdDragHandle, MdTrendingUp, MdCalendarToday
} from "react-icons/md";

const PRIORITY_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
const PRIORITY_LABEL_MN = { high: "Өндөр", medium: "Дунд", low: "Бага" };
const PRIORITY_LABEL_EN = { high: "High", medium: "Medium", low: "Low" };
const STATUS_COLOR = { todo: "#94a3b8", in_progress: "#ffffff", completed: "#10b981" };

function StatCard({ label, count, icon, accent, to, sublabel }) {
  return (
    <Link to={to} className="premium-card" style={{
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "24px", textDecoration: "none", minHeight: 128, position: "relative", 
      overflow: "hidden", background: "var(--bg-card)", backdropFilter: "blur(20px)"
    }}>
      <div style={{ position: "absolute", inset: "auto -20px -20px auto", width: 100, height: 100, borderRadius: "50%", background: `${accent}10` }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, border: `1px solid ${accent}30` }}>
          {icon}
        </div>
        <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px" }}>{count ?? "0"}</span>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", tracking: "0.05em" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{sublabel}</div>}
      </div>
    </Link>
  );
}

function PriorityBar({ high = 0, medium = 0, low = 0, lang }) {
  const total = (high + medium + low) || 1;
  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
        <MdTrendingUp size={16} />
        {lang === "mn" ? "ЧУХЛЫН ХУВААРИЛАЛТ" : "PRIORITY BREAKDOWN"}
      </div>
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", height: 12, gap: 3, background: "rgba(255,255,255,0.05)", padding: 2 }}>
        {high > 0 && <div style={{ width: `${(high / total) * 100}%`, background: "#ef4444", borderRadius: 8 }} />}
        {medium > 0 && <div style={{ width: `${(medium / total) * 100}%`, background: "#f59e0b", borderRadius: 8 }} />}
        {low > 0 && <div style={{ width: `${(low / total) * 100}%`, background: "#10b981", borderRadius: 8 }} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
        {[["#ef4444", lang === "mn" ? "Өндөр" : "High", high], ["#f59e0b", lang === "mn" ? "Дунд" : "Med", medium], ["#10b981", lang === "mn" ? "Бага" : "Low", low]].map(([c, l, v]) => (
          <div key={l} style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{l}
            </div>
            <b style={{ color: "var(--text)", fontSize: 16 }}>{v}</b>
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

  const priorityLabel = lang === "mn" ? PRIORITY_LABEL_MN : PRIORITY_LABEL_EN;
  const statusLabel = {
    todo:        lang === "mn" ? "Хийх"       : "To Do",
    in_progress: lang === "mn" ? "Хийж байна" : "In Progress",
    completed:   lang === "mn" ? "Дууссан"    : "Done",
  };

  const completePct = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        .dash-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
        .dash-panel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px}
        .dash-table-head,.dash-table-row{display:grid;grid-template-columns:minmax(200px,1fr) 100px 120px 100px; gap: 12px}
        @media (max-width: 760px){
          .dash-stat-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}
          .dash-panel-grid{grid-template-columns:1fr!important;gap:16px!important}
          .dash-table-scroll{overflow-x:auto!important}
          .dash-table-head,.dash-table-row{grid-template-columns:180px 86px 104px 78px!important;min-width:448px}
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-1px" }}>
            {t.dashboard}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>{lang === "mn" ? "Таны бүтээмжийн өнөөдрийн тойм" : "Overview of your productivity today"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 16px" }}>
          <MdCalendarToday size={16} color="#ffffff" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            {new Date().toLocaleDateString(lang === "en" ? "en-US" : "mn-MN", { weekday: "short", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stat-grid">
        <StatCard label={lang === "mn" ? "Нийт" : "Total Tasks"} count={stats?.total} icon={<MdOutlineChecklist size={22} />} accent="#ffffff" to="/todos" />
        <StatCard label={lang === "mn" ? "Хийх" : "To Do"} count={stats?.todo} icon={<MdOutlineRadioButtonUnchecked size={22} />} accent="#94a3b8" to="/todos/todo" />
        <StatCard label={lang === "mn" ? "Хийж байна" : "In Progress"} count={stats?.in_progress} icon={<MdOutlineTimer size={22} />} accent="#ffffff" to="/todos/in_progress" />
        <StatCard label={lang === "mn" ? "Дууссан" : "Completed"} count={stats?.completed} icon={<MdOutlineCheckCircle size={22} />} accent="#10b981" to="/todos/completed" />
      </div>

      <div className="dash-panel-grid">
        {/* Progress Card */}
        <div className="premium-card" style={{ padding: "24px", background: "var(--bg-card)", backdropFilter: "blur(20px)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 20, tracking: "0.05em" }}>
            {lang === "mn" ? "НИЙТ ЯВЦ" : "OVERALL PROGRESS"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                <circle cx="45" cy="45" r="38" fill="none" stroke="#ffffff" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - completePct / 100)}`}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
                {completePct}%
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: lang === "mn" ? "Дууссан" : "Done", val: stats?.completed, color: "#10b981" },
                { label: lang === "mn" ? "Хийж байна" : "In Progress", val: stats?.in_progress, color: "#ffffff" },
                { label: lang === "mn" ? "Хийх" : "To Do", val: stats?.todo, color: "var(--text2)" },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, boxShadow: `0 0 8px ${r.color}66` }} />
                    {r.label}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{r.val ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Card */}
        <div className="premium-card" style={{ padding: "24px", background: "var(--bg-card)", backdropFilter: "blur(20px)" }}>
          <PriorityBar high={stats?.high ?? 0} medium={stats?.medium ?? 0} low={stats?.low ?? 0} lang={lang} />
        </div>
      </div>

      {/* Table Card */}
      <div className="premium-card" style={{ overflow: "hidden", background: "var(--bg-card)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>
            {lang === "mn" ? "Сүүлийн Ажлууд" : "Recent Tasks"}
          </h3>
          <Link to="/todos" style={{ fontSize: 12, color: "#ffffff", textDecoration: "none", fontWeight: 700, background: "rgba(255, 255, 255, 0.1)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
            {lang === "mn" ? "Бүгдийг харах →" : "View all"}
          </Link>
        </div>

        <div className="dash-table-scroll">
          <div className="dash-table-head" style={{ padding: "12px 24px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { f: "title",     l: lang === "mn" ? "ГАРЧИГ"    : "TITLE" },
              { f: "priority",  l: lang === "mn" ? "ЧУХАЛ"     : "PRIORITY" },
              { f: "status",    l: lang === "mn" ? "ТӨЛӨВ"     : "STATUS" },
              { f: "createdAt", l: lang === "mn" ? "ОГНОО"     : "DATE" },
            ].map(({ f, l }) => (
              <button key={f} onClick={() => toggleSort(f)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: sortField === f ? "#ffffff" : "#64748b", padding: 0, tracking: "0.05em" }}>
                {l}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: 14 }}>
              {lang === "mn" ? "Todo байхгүй байна" : "No tasks found"}
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {sorted.map((todo, i) => (
                <div key={todo.id} className="dash-table-row" style={{ padding: "14px 24px", alignItems: "center", transition: "all .2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[todo.status], flexShrink: 0, boxShadow: `0 0 8px ${STATUS_COLOR[todo.status]}44` }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: todo.status === "completed" ? "line-through" : "none", opacity: todo.status === "completed" ? 0.5 : 1 }}>{todo.title}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: `${PRIORITY_COLOR[todo.priority]}15`, color: PRIORITY_COLOR[todo.priority], width: "fit-content", border: `1px solid ${PRIORITY_COLOR[todo.priority]}25` }}>
                    {priorityLabel[todo.priority]}
                  </span>
                  <span style={{ fontSize: 13, color: STATUS_COLOR[todo.status], fontWeight: 600 }}>
                    {statusLabel[todo.status]}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "mn-MN", { month: "short", day: "numeric" }) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
