import { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { 
  MdChevronLeft, MdChevronRight, MdAdd, MdClose, MdSave, MdDelete, 
  MdEdit, MdCalendarToday, MdViewWeek, MdSchedule, MdCheckCircle,
  MdRadioButtonUnchecked, MdTrendingUp, MdStars
} from "react-icons/md";
import { 
  useGetTodosQuery, useCreateTodoMutation, useUpdateTodoMutation, 
  useUpdateStatusMutation, useTrashTodoMutation 
} from "../redux/slices/api/todoApiSlice";
import { getUserStore, setUserStore, getUserString, setUserString } from "../utils/userStorage";

// ── Constants & Helpers ──────────────────────────────────────────────
const MONTHS_MN = ["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_MN = ["Да","Мя","Лх","Пү","Ба","Бя","Ня"];
const DOW_EN = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const DOW_FULL_MN = ["Даваа","Мягмар","Лхагва","Пүрэв","Баасан","Бямба","Ням"];
const DOW_FULL_EN = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const NOTE_COLORS = [
  { bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", border: "rgba(99, 102, 241, 0.3)" },
  { bg: "rgba(236, 72, 153, 0.15)", text: "#f472b6", border: "rgba(236, 72, 153, 0.3)" },
  { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
  { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
  { bg: "rgba(139, 92, 246, 0.15)", text: "#a78bfa", border: "rgba(139, 92, 246, 0.3)" },
  { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" },
];

const getStore = getUserStore;
const setStore = setUserStore;
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDow = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

// ── Components ──────────────────────────────────────────────

export default function Calendar() {
  const { lang, theme } = useSettings();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("monthly"); // monthly, timetable
  const [events, setEvents] = useState(() => getStore("cal_ev3", {}));
  const [selectedDay, setSelectedDay] = useState(null);
  const [modal, setModal] = useState(null); // {day, idx}
  const [form, setForm] = useState({ text: "", color: 0 });
  
  const [createTodo] = useCreateTodoMutation();
  const { data: todos = [] } = useGetTodosQuery();

  const MO = lang === "mn" ? MONTHS_MN : MONTHS_EN;
  const DW = lang === "mn" ? DOW_MN : DOW_EN;

  const prevMonth = () => { if(month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); };
  const nextMonth = () => { if(month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); };

  const key = (d) => `${year}-${month + 1}-${d}`;
  const getEvents = (d) => {
    const manual = events[key(d)] || [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const todosList = Array.isArray(todos) ? todos : (todos?.todos || []);
    const dbTodos = todosList.filter(t => t.dueDate?.startsWith(dateStr));
    return [
      ...manual.map(e => ({ ...e, type: "manual" })),
      ...dbTodos.map(t => ({ text: t.title, color: t.priority === "high" ? 5 : 0, type: "todo", status: t.status }))
    ];
  };

  const saveEvent = () => {
    if (!form.text.trim()) return;
    const k = key(modal.day);
    const list = [...(events[k] || [])];
    if (modal.idx !== undefined) list[modal.idx] = form; else list.push(form);
    const updated = { ...events, [k]: list };
    setEvents(updated); setStore("cal_ev3", updated);
    setModal(null);
  };

  const deleteEvent = () => {
    const k = key(modal.day);
    const list = (events[k] || []).filter((_, i) => i !== modal.idx);
    const updated = { ...events, [k]: list };
    setEvents(updated); setStore("cal_ev3", updated);
    setModal(null);
  };

  // Grid logic
  const totalDays = daysInMonth(year, month);
  const offset = firstDow(year, month);
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col h-full bg-transparent text-stone-900 dark:text-white overflow-hidden animate-in">
      <style>{`
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); flex: 1; min-height: 0; border-top: 1px solid rgba(255,255,255,0.05); }
        .cal-cell { border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px; transition: all 0.2s; display: flex; flex-direction: column; gap: 4px; position: relative; min-height: 100px; }
        .cal-cell:hover { background: rgba(255,255,255,0.02); }
        .cal-cell.today { background: rgba(99, 102, 241, 0.03); }
        .cal-cell.selected { background: rgba(99, 102, 241, 0.08); box-shadow: inset 0 0 0 1px #6366f1; }
        .cal-event { font-size: 11px; padding: 4px 8px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
        .cal-event:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .tab-btn { padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .tab-btn.active { background: #6366f1; color: #fff; }
        .tab-btn:not(.active) { color: #94a3b8; }
        .tab-btn:not(.active):hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
      `}</style>

      {/* Header Area */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-slate-900/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">{MO[month]} {year}</h2>
            <div className="flex gap-2 mt-1">
              <button onClick={prevMonth} className="p-1 hover:bg-black/10 dark:bg-white/10 rounded-lg transition-colors"><MdChevronLeft size={20}/></button>
              <button onClick={nextMonth} className="p-1 hover:bg-black/10 dark:bg-white/10 rounded-lg transition-colors"><MdChevronRight size={20}/></button>
              <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-2 hover:text-indigo-300">Today</button>
            </div>
          </div>

          <div className="h-8 w-px bg-black/5 dark:bg-white/5 mx-2" />

          <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
            <button onClick={() => setView("monthly")} className={`tab-btn ${view === "monthly" ? "active" : ""}`}>
              <MdCalendarToday size={18}/> {lang === "mn" ? "Сараар" : "Monthly"}
            </button>
            <button onClick={() => setView("timetable")} className={`tab-btn ${view === "timetable" ? "active" : ""}`}>
              <MdSchedule size={18}/> {lang === "mn" ? "Хуваарь" : "Timetable"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setModal({ day: today.getDate(), idx: undefined })} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-stone-900 dark:text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <MdAdd size={20}/> {lang === "mn" ? "Тэмдэглэл" : "Add Event"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {view === "monthly" ? (
          <div className="h-full flex flex-col">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-black/5 dark:border-white/5 bg-slate-900/20 shrink-0">
              {lang === "mn" ? DOW_FULL_MN.map(d => (
                <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">{d}</div>
              )) : DOW_FULL_EN.map(d => (
                <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="cal-grid">
              {cells.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="cal-cell bg-slate-900/10" />;
                const dayEvents = getEvents(d);
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div key={d} onClick={() => setModal({ day: d, idx: undefined })} className={`cal-cell ${isToday ? "today" : ""}`}>
                    <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? "bg-indigo-500 text-stone-900 dark:text-white shadow-lg shadow-indigo-500/30" : "text-slate-400"}`}>
                      {d}
                    </span>
                    <div className="flex flex-col gap-1 overflow-hidden mt-1">
                      {dayEvents.slice(0, 4).map((ev, idx) => (
                        <div 
                          key={idx} 
                          onClick={(e) => { e.stopPropagation(); if(ev.type === "manual") setModal({ day: d, idx }); }}
                          className="cal-event"
                          style={{ background: NOTE_COLORS[ev.color]?.bg || "rgba(255,255,255,0.1)", color: NOTE_COLORS[ev.color]?.text || "#fff", borderColor: NOTE_COLORS[ev.color]?.border || "transparent" }}
                        >
                          {ev.type === "todo" && <span className="mr-1">{ev.status === "completed" ? "✓" : "○"}</span>}
                          {ev.text}
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <span className="text-[9px] font-bold text-slate-600 px-2 mt-1">+{dayEvents.length - 4} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Timetable lang={lang} />
        )}
      </div>

      {/* Event Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setModal(null)}>
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">{modal.idx !== undefined ? "Edit Event" : "New Event"}</h3>
                <button onClick={() => setModal(null)} className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full text-slate-400"><MdClose size={24}/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                  <textarea 
                    autoFocus
                    value={form.text}
                    onChange={e => setForm({ ...form, text: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-stone-900 dark:text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all min-h-[120px] resize-none"
                    placeholder="What's happening?"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Category Color</label>
                  <div className="flex gap-3">
                    {NOTE_COLORS.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => setForm({ ...form, color: i })}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${form.color === i ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                        style={{ background: c.text }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                {modal.idx !== undefined && (
                  <button onClick={deleteEvent} className="flex-1 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                    <MdDelete size={20}/> {lang === "mn" ? "Устгах" : "Delete"}
                  </button>
                )}
                <button onClick={saveEvent} className="flex-[2] px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-stone-900 dark:text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                  <MdSave size={20}/> {lang === "mn" ? "Хадгалах" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Timetable Sub-component ────────────────────────────────────────

function Timetable({ lang }) {
  const SCHED_KEY = "school_schedule_v4";
  const [slots, setSlots] = useState(() => getStore(SCHED_KEY, []));
  const [editing, setEditing] = useState(null);
  const [qForm, setQForm] = useState({ subject: "", start: "09:00", end: "10:00", color: 0, day: 0 });

  const DAYS = lang === "mn" ? DOW_FULL_MN.slice(0, 5) : DOW_FULL_EN.slice(0, 5);
  const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 8 AM to 6 PM

  const toMin = t => { const [h, m] = (t || "00:00").split(":").map(Number); return h * 60 + m; };
  const persist = s => { setSlots(s); setStore(SCHED_KEY, s); };

  const saveSlot = () => {
    if (!qForm.subject) return;
    if (editing === "new") {
      persist([...slots, { ...qForm, id: Date.now() }]);
    } else {
      persist(slots.map(s => s.id === editing ? { ...qForm, id: editing } : s));
    }
    setEditing(null);
  };

  const deleteSlot = (id) => persist(slots.filter(s => s.id !== id));

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex gap-4 mb-6">
        <button onClick={() => { setEditing("new"); setQForm({ subject: "", start: "09:00", end: "10:00", color: 0, day: 0 }); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-stone-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all">
          + Add Class
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-900/20 rounded-3xl border border-black/5 dark:border-white/5 relative">
        <div className="flex min-w-[800px] h-full">
          {/* Time axis */}
          <div className="w-20 shrink-0 border-right border-black/5 dark:border-white/5 bg-slate-900/40">
            <div className="h-12 border-b border-black/5 dark:border-white/5" />
            {hours.map(h => (
              <div key={h} className="h-20 border-b border-black/5 dark:border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Columns */}
          {DAYS.map((day, di) => (
            <div key={day} className="flex-1 border-r border-black/5 dark:border-white/5 relative last:border-0">
              <div className="h-12 border-b border-black/5 dark:border-white/5 flex items-center justify-center bg-slate-900/20 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {day}
              </div>
              <div className="relative h-[880px]">
                {/* Grid lines */}
                {hours.map(h => <div key={h} className="h-20 border-b border-black/5 dark:border-white/5" />)}
                
                {/* Slots */}
                {slots.filter(s => s.day === di).map(s => {
                  const top = (toMin(s.start) - 480) * (80/60); // 8 AM = 480min. 1min = 80/60 px.
                  const height = (toMin(s.end) - toMin(s.start)) * (80/60);
                  return (
                    <div 
                      key={s.id}
                      onClick={() => { setEditing(s.id); setQForm(s); }}
                      className="absolute left-1 right-1 rounded-xl p-3 cursor-pointer shadow-lg transition-all hover:scale-[1.02] active:scale-95 group border-l-4 overflow-hidden"
                      style={{ 
                        top: top + 48, // 48px header
                        height, 
                        background: NOTE_COLORS[s.color]?.bg || "rgba(255,255,255,0.1)", 
                        borderColor: NOTE_COLORS[s.color]?.text || "#fff",
                        color: NOTE_COLORS[s.color]?.text || "#fff"
                      }}
                    >
                      <div className="text-xs font-black leading-tight uppercase tracking-tight">{s.subject}</div>
                      <div className="text-[9px] opacity-60 font-bold mt-1">{s.start} - {s.end}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Edit Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6">Class Details</h3>
            <div className="space-y-4">
              <input value={qForm.subject} onChange={e => setQForm({...qForm, subject: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white outline-none focus:border-indigo-500" placeholder="Subject Name" />
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={qForm.start} onChange={e => setQForm({...qForm, start: e.target.value})} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white outline-none" />
                <input type="time" value={qForm.end} onChange={e => setQForm({...qForm, end: e.target.value})} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white outline-none" />
              </div>
              <select value={qForm.day} onChange={e => setQForm({...qForm, day: Number(e.target.value)})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white outline-none">
                {DAYS.map((d, i) => <option key={i} value={i} className="bg-slate-900">{d}</option>)}
              </select>
              <div className="flex gap-2">
                {NOTE_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setQForm({...qForm, color: i})} className={`w-8 h-8 rounded-full border-2 ${qForm.color === i ? "border-white" : "border-transparent"}`} style={{background: c.text}} />
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              {editing !== "new" && <button onClick={() => deleteSlot(editing)} className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold">Delete</button>}
              <button onClick={saveSlot} className="flex-[2] py-3 bg-indigo-600 text-stone-900 dark:text-white rounded-xl font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
