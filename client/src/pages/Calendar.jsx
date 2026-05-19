import { useState, useRef, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { MdChevronLeft, MdChevronRight, MdAdd, MdClose, MdSave, MdDelete, MdEdit } from "react-icons/md";
import { useGetTodosQuery, useCreateTodoMutation, useUpdateTodoMutation, useUpdateStatusMutation, useTrashTodoMutation } from "../redux/slices/api/todoApiSlice";
import { getUserStore, setUserStore, getUserString, setUserString } from "../utils/userStorage";


/* ════════════════════════════════════════════════════════
   SchoolSchedule component
   ════════════════════════════════════════════════════════ */
const DAYS_MN = ["Даваа","Мягмар","Лхагва","Пүрэв","Баасан"];
const DAYS_EN = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const SCHED_KEY = "school_schedule_v4";

/* time "HH:MM" → minutes from midnight */
const toMin = t => { const [h,m]=(t||"00:00").split(":").map(Number); return h*60+m; };
/* minutes → px offset (1min = 1px, scaled) */
const HOUR_H = 60; // px per hour

function SchoolSchedule({ lang }) {
  const DAYS = lang==="mn" ? DAYS_MN : DAYS_EN;
  const COLORS = ["#e0e7ff","#fce7f3","#dcfce7","#fef9c3","#ffe4e6","#e0f2fe","#f3e8ff","#fff7ed"];

  const initSched = () => {
    return getUserStore(SCHED_KEY, []);
  };

  const [slots, setSlots]         = useState(initSched); // [{subject,start,end,color,col,emoji}]
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing]     = useState(null); // slot index or "new"
  const [newCol, setNewCol]       = useState(0);
  const [subject, setSubject]     = useState("");
  const [start, setStart]         = useState("09:00");
  const [end, setEnd]             = useState("10:00");
  const [color, setColor]         = useState("#e0e7ff");
  const [slotEmoji, setSlotEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [title, setTitle]         = useState(() => {
    return getUserString("sched_title_v4", lang === "mn" ? "Хичээлийн хуваарь" : "School schedule");
  });
  const [editTitle, setEditTitle] = useState(false);

  // Visible time range
  const [startHour, setStartHour] = useState(8);
  const [endHour,   setEndHour]   = useState(18);
  const totalMins = (endHour - startHour) * 60;
  const totalPx   = totalMins; // 1min = 1px

  const persist = s => { setSlots(s); setUserStore(SCHED_KEY, s); };

  const openNew = (col) => {
    setNewCol(col); setSubject(""); setStart(`${String(startHour).padStart(2,"0")}:00`);
    setEnd(`${String(startHour+1).padStart(2,"0")}:00`); setColor("#e0e7ff"); setSlotEmoji(""); setEditing("new");
  };

  const openEdit = (idx) => {
    const s=slots[idx];
    setSubject(s.subject); setStart(s.start); setEnd(s.end); setColor(s.color);
    setSlotEmoji(s.emoji || ""); setEditing(idx);
  };

  const saveSlot = () => {
    if(!subject.trim()){ setEditing(null); return; }
    if(editing==="new"){
      persist([...slots,{subject:subject.trim(),start,end,color,col:newCol,emoji:slotEmoji}]);
    } else {
      persist(slots.map((s,i)=>i!==editing?s:{...s,subject:subject.trim(),start,end,color,emoji:slotEmoji}));
    }
    setEditing(null);
    setShowEmojiPicker(false);
  };

  const deleteSlot = (idx) => persist(slots.filter((_,i)=>i!==idx));

  // Hour labels
  const hours = Array.from({length: endHour-startHour+1},(_,i)=>startHour+i);

  const slotTop  = s => ((toMin(s.start) - startHour*60) / totalMins) * totalPx;
  const slotH    = s => Math.max(20, ((toMin(s.end) - toMin(s.start)) / totalMins) * totalPx);

  return (
    <div className="school-schedule" style={{marginTop:24,paddingBottom:32}}>
      <style>{`
        .school-schedule button,.school-schedule input{transition:background .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease}
        .school-schedule button:hover{transform:translateY(-1px)}
        .school-schedule .sched-slot{transition:filter .18s ease,box-shadow .18s ease,transform .18s ease}
        .school-schedule .sched-slot:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(15,23,42,.12)!important}
      `}</style>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 20px",background:"#ffffff",borderRadius:16,
        border:"1px solid #e5e7eb",boxShadow:"0 12px 30px rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {editTitle ? (
            <input autoFocus value={title} onChange={e=>{setTitle(e.target.value);setUserString("sched_title_v4",e.target.value);}}
              onBlur={()=>setEditTitle(false)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")setEditTitle(false);}}
              style={{fontFamily:"DM Sans",fontSize:18,fontWeight:600,color:"#3a3530",
                border:"none",borderBottom:"2px solid #7c3aed",outline:"none",background:"transparent",minWidth:200}}/>
          ) : (
            <span onClick={()=>setEditTitle(true)} title="Дарж засах"
              style={{fontFamily:"DM Sans",fontSize:18,fontWeight:600,color:"#3a3530",
                cursor:"text",borderBottom:"2px dashed #e0dbd5"}}>
              {title}
            </span>
          )}

        </div>
        <button onClick={()=>setCollapsed(c=>!c)}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#9b948a"}}>
          {collapsed?"▼":"▲"}
        </button>
      </div>

      {!collapsed && (
        <div style={{background:"#ffffff",borderRadius:16,marginTop:12,
          border:"1px solid #e5e7eb",boxShadow:"0 18px 40px rgba(15,23,42,0.07)",overflowX:"auto"}}>

          {/* Edit modal */}
          {editing!==null && (
            <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",
              justifyContent:"center",background:"rgba(0,0,0,0.3)"}}
              onClick={()=>{ setEditing(null); setShowEmojiPicker(false); }}>
              <div onClick={e=>e.stopPropagation()}
                style={{background:"#ffffff",borderRadius:14,padding:20,width:280,
                  boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 12px",color:"#1e293b"}}>
                  {editing==="new"?(lang==="mn"?"Хичээл нэмэх":"Add class"):(lang==="mn"?"Хичээл засах":"Edit class")}
                </p>
                <input autoFocus value={subject} placeholder={lang==="mn"?"Хичээлийн нэр":"Subject"}
                  onChange={e=>setSubject(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")saveSlot();if(e.key==="Escape")setEditing(null);}}
                  style={{width:"100%",border:"1px solid #e0dbd5",borderRadius:8,padding:"7px 10px",
                    fontSize:13,fontWeight:600,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#9b948a",marginBottom:3}}>{lang==="mn"?"Эхлэх":"Start"}</div>
                    <input type="time" value={start} onChange={e=>setStart(e.target.value)}
                      style={{width:"100%",border:"1px solid #e0dbd5",borderRadius:8,
                        padding:"6px 8px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <span style={{color:"#9b948a",marginTop:16}}>–</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#9b948a",marginBottom:3}}>{lang==="mn"?"Дуусах":"End"}</div>
                    <input type="time" value={end} onChange={e=>setEnd(e.target.value)}
                      style={{width:"100%",border:"1px solid #e0dbd5",borderRadius:8,
                        padding:"6px 8px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                  {COLORS.map(c=>(
                    <div key={c} onClick={()=>setColor(c)}
                      style={{width:22,height:22,borderRadius:5,background:c,cursor:"pointer",
                        border:color===c?"2.5px solid #7c3aed":"2px solid transparent",boxSizing:"border-box"}}/>
                  ))}
                </div>

                {/* ── Sticker picker ── */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,color:"#9b948a",marginBottom:5,fontWeight:600}}>
                    {lang==="mn" ? "СТИКЕР" : "STICKER"}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(v => !v)}
                      style={{
                        width:36, height:36, borderRadius:8,
                        border: showEmojiPicker ? "2px solid #7c3aed" : "1px solid #e0dbd5",
                        background: showEmojiPicker ? "#f5f0ff" : "#ffffff",
                        fontSize:20, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                      {slotEmoji || "+"}
                    </button>
                    {slotEmoji && (
                      <button type="button" onClick={() => setSlotEmoji("")}
                        style={{fontSize:11,color:"#9b948a",background:"none",border:"none",cursor:"pointer"}}>
                        {lang==="mn" ? "Арилгах" : "Clear"}
                      </button>
                    )}
                  </div>

                  {showEmojiPicker && (
                    <div style={{
                      marginTop:8, background:"#f8f7f5", borderRadius:10, padding:10,
                      border:"1px solid #e0dbd5", maxHeight:160, overflowY:"auto",
                    }}>
                      {[
                        ["READ","NOTE","WRITE","BOOK","SCI","ART","MUSIC","MOVE"],
                        ["FOCUS","WIN","DONE","IDEA","PLAN","BUILD","NEXT","CALM"],
                      ].map((row, ri) => (
                        <div key={ri} style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:ri===0?4:0}}>
                          {row.map(label => (
                            <button key={label} type="button"
                              onClick={() => { setSlotEmoji(label); setShowEmojiPicker(false); }}
                              style={{
                                minWidth:42, height:28, borderRadius:6, fontSize:9, fontWeight:800,
                                border: slotEmoji===label ? "2px solid #7c3aed" : "1px solid transparent",
                                background: slotEmoji===label ? "#f5f0ff" : "transparent",
                                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                                transition:"all 0.1s",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background="#ede9fe"}
                              onMouseLeave={e => e.currentTarget.style.background = slotEmoji===label ? "#f5f0ff" : "transparent"}>
                              {label}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveSlot}
                    style={{flex:1,padding:"8px",borderRadius:8,border:"none",
                      background:"#7c3aed",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    {lang==="mn"?"Хадгалах":"Save"}
                  </button>
                  {editing!=="new" && (
                    <button onClick={()=>{deleteSlot(editing);setEditing(null);}}
                      style={{padding:"8px 12px",borderRadius:8,border:"1px solid #fecdd3",
                        background:"#fff1f2",color:"#e11d48",fontSize:13,cursor:"pointer"}}>Delete</button>
                  )}
                  <button onClick={()=>setEditing(null)}
                    style={{padding:"8px 12px",borderRadius:8,border:"1px solid #e0dbd5",
                      background:"#ffffff",fontSize:13,cursor:"pointer"}}>x</button>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          <div style={{paddingTop:32,overflowX:"auto"}}>
          <div style={{display:"flex",minWidth:600}}>
            {/* Time axis */}
            <div style={{width:52,flexShrink:0,position:"relative",height:totalPx,
              borderRight:"1px solid #e5e7eb",background:"#f8fafc"}}>
              {hours.map(h=>(
                <div key={h} style={{position:"absolute",top:(h-startHour)*HOUR_H-8,
                  right:6,fontSize:10,color:"#b0a8a0",fontWeight:600,userSelect:"none"}}>
                  {String(h).padStart(2,"0")}:00
                </div>
              ))}
              {/* Hour lines */}
              {hours.map(h=>(
                <div key={h} style={{position:"absolute",top:(h-startHour)*HOUR_H,
                  left:0,right:0,borderTop:"1px solid #f0ece6"}}/>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((day,ci)=>(
              <div key={ci} style={{flex:1,position:"relative",height:totalPx,
                borderRight:ci<DAYS.length-1?"1px solid #e5e7eb":"none",
                cursor:"pointer"}}
                onClick={()=>openNew(ci)}>
                {/* Day header */}
                <div style={{position:"absolute",top:-32,left:0,right:0,textAlign:"center",
                  fontSize:12,fontWeight:700,color:"#334155",userSelect:"none"}}>
                  {day}
                </div>
                {/* Hour lines */}
                {hours.map(h=>(
                  <div key={h} style={{position:"absolute",top:(h-startHour)*HOUR_H,
                    left:0,right:0,borderTop:"1px solid #e5e7eb"}}/>
                ))}
                {/* Half-hour lines */}
                {hours.slice(0,-1).map(h=>(
                  <div key={h} style={{position:"absolute",top:(h-startHour)*HOUR_H+30,
                    left:4,right:4,borderTop:"1px dashed #cbd5e1"}}/>
                ))}
                {/* Slots for this column */}
                {slots.filter(s=>s.col===ci).map((s,si)=>{
                  const idx=slots.findIndex((_,i)=>slots.filter(x=>x.col===ci)[si]===slots[i]);
                  const top=slotTop(s), h=slotH(s);
                  return(
                    <div key={si}
                      className="sched-slot"
                      onClick={e=>{e.stopPropagation();openEdit(idx);}}
                      style={{position:"absolute",top,left:3,right:3,height:h,
                        background:s.color,borderRadius:8,padding:"4px 8px",
                        boxShadow:"0 2px 8px rgba(0,0,0,0.1)",cursor:"pointer",
                        overflow:"hidden",zIndex:1,transition:"filter .15s",
                        borderLeft:`3px solid ${s.color==="white"?"#7c3aed":s.color.replace("e0","a0")}`}}
                      onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.92)"}
                      onMouseLeave={e=>e.currentTarget.style.filter="none"}>
                      <div style={{fontSize:11,fontWeight:700,color:"#1e293b",lineHeight:1.3,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                        display:"flex",alignItems:"center",gap:3}}>
                        {s.emoji && <span style={{fontSize:12}}>{s.emoji}</span>}
                        {s.subject}
                      </div>
                      {h>30&&<div style={{fontSize:9,color:"#475569",marginTop:1}}>
                        {s.start} – {s.end}
                      </div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          </div>
          </div>
      )}
    </div>
  );
}


const MONTH_MN = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];
const MONTH_FULL_MN = ["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"];
const MONTH_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_MN = ["Да","Мя","Лх","Пү","Ба","Бя","Ня"];
const DOW_EN = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const DOW_FULL_MN = ["ДАВАА","МЯГМАР","ЛХАГВА","ПҮРЭВ","БААСАН","БЯМБА","НЯМ"];
const DOW_FULL_EN = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

const getStore = getUserStore;
const setStore = setUserStore;

// ══════════════════════════════════════════
//  WEEKLY PLANNER COMPONENT
// ══════════════════════════════════════════
function WeeklyPlanner({ year, month, lang }) {
  const today = new Date();
  // Get Monday of current week
  const getMonday = (d) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    dt.setDate(dt.getDate() + diff);
    return dt;
  };
  const [weekStart, setWeekStart] = useState(() => getMonday(today));

  const DOW_SHORT = lang === "mn"
    ? ["ДАВ","МЯГ","ЛХА","ПҮР","БАА","БЯМ","НЯМ"]
    : ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const DOW_FULL_W = lang === "mn"
    ? ["Даваа","Мягмар","Лхагва","Пүрэв","Баасан","Бямба","Ням"]
    : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fmtDate = (d) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const isToday = (d) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const wKey = (d) => `wpl_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const wkNoteKey = `wpl_note_${weekStart.getFullYear()}_${weekStart.getMonth()}_${weekStart.getDate()}`;
  const wkHabitKey = `wpl_habits_${weekStart.getFullYear()}_${weekStart.getMonth()}_${weekStart.getDate()}`;

  const defaultTasks = () => Array.from({ length: 5 }, () => ({ text: "", done: false }));

  const [dayTasks, setDayTasks] = useState(() => {
    const obj = {};
    weekDays.forEach(d => { obj[wKey(d)] = getStore(wKey(d), defaultTasks()); });
    return obj;
  });
  const [weekNote, setWeekNote] = useState(() => getStore(wkNoteKey, ""));
  const [habitChecks, setHabitChecks] = useState(() => getStore(wkHabitKey, {}));

  // Reload when week changes
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    const obj = {};
    Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d); dd.setDate(dd.getDate() + i); return dd;
    }).forEach(dd => { obj[wKey(dd)] = getStore(wKey(dd), defaultTasks()); });
    setDayTasks(obj);
    setWeekNote(getStore(`wpl_note_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`, ""));
    setHabitChecks(getStore(`wpl_habits_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`, {}));
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    const obj = {};
    Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d); dd.setDate(dd.getDate() + i); return dd;
    }).forEach(dd => { obj[wKey(dd)] = getStore(wKey(dd), defaultTasks()); });
    setDayTasks(obj);
    setWeekNote(getStore(`wpl_note_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`, ""));
    setHabitChecks(getStore(`wpl_habits_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`, {}));
  };

  const updateTask = (dayKey, i, field, val) => {
    const updated = (dayTasks[dayKey] || defaultTasks()).map((t, j) =>
      j === i ? { ...t, [field]: val } : t
    );
    const newObj = { ...dayTasks, [dayKey]: updated };
    setDayTasks(newObj);
    setStore(dayKey, updated);
  };
  const addTask = (dayKey) => {
    const cur = dayTasks[dayKey] || defaultTasks();
    const updated = [...cur, { text: "", done: false }];
    setDayTasks({ ...dayTasks, [dayKey]: updated });
    setStore(dayKey, updated);
  };

  const HABITS_DEF = [
    { id: "reading", emoji: "R", label: lang === "mn" ? "Унших" : "Reading" },
    { id: "journal", emoji: "J", label: lang === "mn" ? "Тэмдэглэл" : "Journal Time" },
    { id: "exercise", emoji: "E", label: lang === "mn" ? "Дасгал хөдөлгөөн" : "Morning exercise" },
    { id: "water", emoji: "W", label: lang === "mn" ? "8 аяга ус" : "8 cups water" },
  ];

  const toggleHabit = (dayKey, hid) => {
    const cur = habitChecks[dayKey] || [];
    const updated = cur.includes(hid) ? cur.filter(x => x !== hid) : [...cur, hid];
    const newObj = { ...habitChecks, [dayKey]: updated };
    setHabitChecks(newObj);
    setStore(wkHabitKey, newObj);
  };

  const HABIT_COLORS = ["#f4a0a0", "#f4c070", "#a0c4a0", "#a0b8e8", "#d4a0d4", "#a0d4d4", "#f4d0a0"];

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const DAY_COLORS = [
    { bg: "#fef9f0", accent: "#e8a090", border: "#f5e8e0" },
    { bg: "#f0f7f0", accent: "#7daa7d", border: "#d8ead8" },
    { bg: "#f0f4fc", accent: "#8098cc", border: "#d0dcf0" },
    { bg: "#fdf5f0", accent: "#d48a70", border: "#f0ddd0" },
    { bg: "#fdf0f8", accent: "#c090b8", border: "#ead0e8" },
    { bg: "#f5f0ff", accent: "#9070c8", border: "#dcd0f0" },
    { bg: "#f0faf5", accent: "#60a880", border: "#c8e8d8" },
  ];

  return (
    <div style={{ fontFamily:"DM Sans", background: "#faf8f5", minHeight: "100vh", padding: "0 0 32px" }}>
      <style>{`
        @.wp-day-task:focus { outline: none; }
        .wp-day-task::placeholder { color: #d0c8c0; }
        .wp-task-row:hover .wp-del-btn { opacity: 1 !important; }
        .wp-note-area:focus { outline: none; }
        .wp-note-area::placeholder { color: #c8c0b8; }
        .wp-day-col:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "18px 24px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "0.5px solid #ece8e2" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily:"DM Sans", fontSize: 22, fontWeight: 600, color: "#3a3530", letterSpacing: ".01em" }}>
            ✦ <em>Weekly</em> Planner
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400, letterSpacing: ".05em" }}>
            {lang === "mn" ? "Огноо" : "Date"}&nbsp;
            <span style={{ color: "#c07070", fontWeight: 600 }}>{fmtDate(weekStart)} – {fmtDate(weekEnd)}</span>
          </span>
          <button onClick={prevWeek} style={{ background: "#f5f0ee", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#c07070", fontSize: 13 }}>‹</button>
          <button onClick={nextWeek} style={{ background: "#f5f0ee", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#c07070", fontSize: 13 }}>›</button>
        </div>
      </div>

      {/* Body: left = days grid, right = to-do list + habits + notes */}
      <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>

        {/* LEFT: 7 day columns */}
        <div style={{ flex: "0 0 auto", width: "calc(100% - 280px)", padding: "14px 0 0 16px", display: "flex", flexDirection: "column", gap: 0 }}>
          {weekDays.map((d, di) => {
            const dk = wKey(d);
            const tasks = dayTasks[dk] || defaultTasks();
            const col = DAY_COLORS[di % 7];
            const isSat = di === 5, isSun = di === 6;
            return (
              <div key={di} className="wp-day-col" style={{
                display: "flex",
                borderRadius: 10,
                marginBottom: 6,
                background: col.bg,
                border: `0.5px solid ${col.border}`,
                overflow: "hidden",
                transition: "box-shadow .15s",
                minHeight: 52,
              }}>
                {/* Day label */}
                <div style={{
                  width: 54, flexShrink: 0,
                  background: isToday(d) ? col.accent : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "8px 4px",
                  borderRight: `0.5px solid ${col.border}`,
                }}>
                  <div style={{ fontSize: 9, color: isToday(d) ? "#fff" : col.accent, fontWeight: 600, letterSpacing: ".08em", marginBottom: 2 }}>
                    {DOW_SHORT[di]}
                  </div>
                  <div style={{ fontFamily:"DM Sans", fontSize: 22, color: isToday(d) ? "#fff" : isSat || isSun ? "#9ab8d4" : "#3a3530", fontWeight: 400, lineHeight: 1 }}>
                    {String(d.getDate()).padStart(2, "0")}
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ flex: 1, padding: "6px 10px", display: "flex", flexDirection: "column", gap: 2, justifyContent: "center" }}>
                  {tasks.map((t, ti) => (
                    <div key={ti} className="wp-task-row" style={{ display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
                      {/* bullet */}
                      <div
                        onClick={() => updateTask(dk, ti, "done", !t.done)}
                        style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: t.done ? col.accent : "transparent",
                          border: `1.5px solid ${col.accent}`,
                          flexShrink: 0, cursor: "pointer", transition: "background .1s",
                        }} />
                      <input
                        className="wp-day-task"
                        value={t.text}
                        onChange={e => updateTask(dk, ti, "text", e.target.value)}
                        placeholder={ti === 0 ? (lang === "mn" ? "Өнөөдрийн даалгавар..." : "Today's task...") : ""}
                        style={{
                          flex: 1, border: "none", background: "transparent",
                          fontSize: 12.5, color: t.done ? "#bbb" : "#5a5350",
                          textDecoration: t.done ? "line-through" : "none",
                          fontFamily:"DM Sans",
                        }}
                      />
                      <button
                        className="wp-del-btn"
                        onClick={() => {
                          if (tasks.length <= 1) return;
                          const updated = tasks.filter((_, j) => j !== ti);
                          setDayTasks({ ...dayTasks, [dk]: updated });
                          setStore(dk, updated);
                        }}
                        style={{ opacity: 0, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#d4a0a0", padding: 0, transition: "opacity .15s" }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addTask(dk)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: col.accent, textAlign: "left", padding: "1px 0 0 12px", fontFamily:"DM Sans", opacity: 0.6 }}>
                    + {lang === "mn" ? "нэмэх" : "add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 272, flexShrink: 0, padding: "14px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* TO-DO LIST (week aggregate) */}
          <div style={{ background: "#fff", border: "0.5px solid #ece8e2", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, letterSpacing: ".1em", color: "#bbb", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
              {lang === "mn" ? "Хийх зүйлс" : "TO-DO LIST"}
            </div>
            {(() => {
              const allTasks = weekDays.flatMap(d => {
                const tasks = dayTasks[wKey(d)] || [];
                return tasks.filter(t => t.text.trim());
              });
              return allTasks.length === 0 ? (
                <div style={{ fontSize: 11, color: "#d0c8c0", fontStyle: "italic" }}>{lang === "mn" ? "Даалгавар байхгүй" : "No tasks yet"}</div>
              ) : (
                allTasks.slice(0, 12).map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: 2,
                      border: `1.5px solid ${t.done ? "#d4a0a0" : "#ddd"}`,
                      background: t.done ? "#f2e8e8" : "transparent",
                      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {t.done && <span style={{ fontSize: 7, color: "#d4a0a0", lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 11.5, color: t.done ? "#bbb" : "#5a5350", textDecoration: t.done ? "line-through" : "none" }}>
                      {t.text}
                    </span>
                  </div>
                ))
              );
            })()}
          </div>

          {/* HABITS */}
          <div style={{ background: "#fff", border: "0.5px solid #ece8e2", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, letterSpacing: ".1em", color: "#bbb", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
              {lang === "mn" ? "Зуршил" : "HABITS"}
            </div>
            {/* header row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(7, 20px)", gap: 2, marginBottom: 4, alignItems: "center" }}>
              <div />
              {DOW_SHORT.map((d, i) => (
                <div key={i} style={{ fontSize: 7, color: "#bbb", textAlign: "center", fontWeight: 600 }}>{d.slice(0, 1)}</div>
              ))}
            </div>
            {HABITS_DEF.map((hb, hi) => (
              <div key={hb.id} style={{ display: "grid", gridTemplateColumns: "1fr repeat(7, 20px)", gap: 2, marginBottom: 5, alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#7a7470", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12 }}>{hb.emoji}</span>
                  <span>{hb.label}</span>
                </div>
                {weekDays.map((d, di) => {
                  const dk = wKey(d);
                  const checked = (habitChecks[dk] || []).includes(hb.id);
                  return (
                    <div
                      key={di}
                      onClick={() => toggleHabit(dk, hb.id)}
                      style={{
                        width: 16, height: 16, borderRadius: "50%",
                        background: checked ? HABIT_COLORS[hi % HABIT_COLORS.length] : "#f5f0ee",
                        border: `1.5px solid ${checked ? HABIT_COLORS[hi % HABIT_COLORS.length] : "#e0d8d4"}`,
                        cursor: "pointer", margin: "auto",
                        transition: "background .1s, border .1s",
                      }} />
                  );
                })}
              </div>
            ))}
          </div>

          {/* NOTES */}
          <div style={{ background: "#fff", border: "0.5px solid #ece8e2", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, letterSpacing: ".1em", color: "#bbb", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
              {lang === "mn" ? "Тэмдэглэл" : "NOTES"}
            </div>
            <div style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #f0ece6 23px, #f0ece6 24px)", paddingBottom: 4 }}>
              <textarea
                className="wp-note-area"
                value={weekNote}
                onChange={e => {
                  setWeekNote(e.target.value);
                  setStore(wkNoteKey, e.target.value);
                }}
                placeholder={lang === "mn" ? "Энэ долоо хоногийн тэмдэглэл..." : "Write your weekly notes here..."}
                style={{
                  width: "100%", minHeight: 80, resize: "none",
                  border: "none", background: "transparent",
                  fontSize: 12.5, color: "#5a5350", lineHeight: "24px",
                  fontFamily:"DM Sans",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function firstDow(y,m){const d=new Date(y,m,1).getDay();return d===0?6:d-1;}




/* ═══════════════════════════════════════════
   VISION BOARD — Cork board style
═══════════════════════════════════════════ */
const VB_FONTS = [
  {id:"caveat",    label:"Caveat",       css:"DM Sans"},
  {id:"pacifico",  label:"Pacifico",     css:"DM Sans"},
  {id:"indie",     label:"Indie Flower", css:"DM Sans"},
  {id:"satisfy",   label:"Satisfy",      css:"DM Sans"},
  {id:"nunito",    label:"Nunito",       css:"DM Sans"},
  {id:"quicksand", label:"Quicksand",    css:"DM Sans"},
];
const NOTE_COLORS = ["#fffde7","#fce4ec","#e8eaf6","#e0f7fa","#f3e5f5","#e8f5e9","#fff3e0","#e3f2fd","#fafafa","#fff8e1"];
const PIN_COLORS  = ["#e05252","#5272e0","#52c052","#e0c052","#a052e0","#e07852","#52b8e0","#e05288"];
const VB_STICKERS = ["FOCUS","GROW","WIN","PLAN","MOVE","BUILD","SAVE","LEARN","HEALTH","IDEA","CALM","NEXT"];

function VisionBoard({ lang, theme }) {
  const BOARD_W = 560, BOARD_H = 340;
  const [items, setItems] = useState(() => getStore("vb3_items", []));
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("select"); // select | note | sticker
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const boardRef = useRef(null);
  const dragRef  = useRef(null); // {id, ox, oy}

  const saveItems = (it) => { setItems(it); setStore("vb3_items", it); };
  const upd = (id, patch) => saveItems(items.map(i => i.id===id ? {...i,...patch} : i));
  const del = (id) => { saveItems(items.filter(i=>i.id!==id)); if(selected===id) setSelected(null); };

  const selItem = items.find(i=>i.id===selected);

  // Random position within board
  const rnd = (max,min=0) => Math.floor(Math.random()*(max-min))+min;

  const addNote = () => {
    const id = Date.now();
    const rect = boardRef.current?.getBoundingClientRect();
    const bw = rect?.width || BOARD_W, bh = rect?.height || BOARD_H;
    saveItems([...items, {
      id, type:"note", x:rnd(bw-120,20), y:rnd(bh-100,20),
      w:120, text:"", font:"caveat", color: rnd(NOTE_COLORS.length),
      pin: rnd(PIN_COLORS.length), rot: (rnd(21)-10)*0.5,
    }]);
    setSelected(id); setEditingId(id); setMode("select");
  };

  const addSticker = (emoji) => {
    const id = Date.now();
    const rect2 = boardRef.current?.getBoundingClientRect();
    const bw2 = rect2?.width || BOARD_W, bh2 = rect2?.height || BOARD_H;
    saveItems([...items, {
      id, type:"sticker", x:rnd(bw2-60,20), y:rnd(bh2-60,20),
      emoji, size:36, rot: (rnd(21)-10)*0.5,
    }]);
    setSelected(id); setShowStickerPicker(false); setMode("select");
  };

  const addImage = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const id = Date.now();
      const rect3 = boardRef.current?.getBoundingClientRect();
      const bw3 = rect3?.width || BOARD_W, bh3 = rect3?.height || BOARD_H;
      saveItems([...items, {
        id, type:"image", x:rnd(bw3-130,20), y:rnd(bh3-100,20),
        w:130, h:100, src:ev.target.result, rot:(rnd(11)-5)*0.5,
        border:true, pin:rnd(PIN_COLORS.length),
      }]);
      setSelected(id); setMode("select");
    };
    reader.readAsDataURL(file);
  };

  // Drag logic
  const onMouseDown = (e, id) => {
    e.stopPropagation();
    if (e.detail === 2) { setEditingId(id); return; }
    if (editingId === id) return; // don't drag while editing this note
    setSelected(id);
    const item = items.find(i=>i.id===id);
    const rect = boardRef.current.getBoundingClientRect();
    dragRef.current = { id, ox: e.clientX - rect.left - item.x, oy: e.clientY - rect.top - item.y };
    e.preventDefault(); // only prevent default when actually starting drag
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    if (editingId !== null) { dragRef.current = null; return; } // don't drag while editing
    const rect = boardRef.current.getBoundingClientRect();
    const nx = e.clientX - rect.left - dragRef.current.ox;
    const ny = e.clientY - rect.top  - dragRef.current.oy;
    upd(dragRef.current.id, { x: Math.max(0, Math.min(rect.width-30, nx)), y: Math.max(0, Math.min(rect.height-20, ny)) });
  };
  const onMouseUp = () => { dragRef.current = null; };

  // Touch drag
  const onTouchStart = (e, id) => {
    setSelected(id);
    const item = items.find(i=>i.id===id);
    const rect = boardRef.current.getBoundingClientRect();
    const t = e.touches[0];
    dragRef.current = { id, ox: t.clientX - rect.left - item.x, oy: t.clientY - rect.top - item.y };
  };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const t = e.touches[0];
    upd(dragRef.current.id, {
      x: Math.max(0, Math.min(rect.width-30, t.clientX - rect.left - dragRef.current.ox)),
      y: Math.max(0, Math.min(rect.height-20, t.clientY - rect.top  - dragRef.current.oy)),
    });
    e.preventDefault();
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:700,color:"#5c3a1e",letterSpacing:.5,textTransform:"uppercase"}}>Vision Board</span>
        <div style={{flex:1}}/>
        {/* Add note */}
        <button onClick={addNote} title={lang==="mn"?"Карт нэмэх":"Add note"}
          style={{fontSize:11,background:"#fffde7",border:"1px solid #fcd34d",borderRadius:6,padding:"3px 9px",cursor:"pointer",color:"#78350f",fontWeight:600,boxShadow:"1px 1px 3px rgba(0,0,0,0.1)"}}>
          {lang==="mn"?"Карт":"Note"}
        </button>
        {/* Add sticker */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowStickerPicker(v=>!v)}
            style={{fontSize:11,background:"#fce4ec",border:"1px solid #f9a8d4",borderRadius:6,padding:"3px 9px",cursor:"pointer",color:"#9d174d",fontWeight:600,boxShadow:"1px 1px 3px rgba(0,0,0,0.1)"}}>
            {lang==="mn"?"Sticker":"Sticker"}
          </button>
          {showStickerPicker && (
            <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,zIndex:100,
              background:"white",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
              border:"1px solid #e2e8f0",padding:8,width:220,display:"flex",flexWrap:"wrap",gap:3}}>
              {VB_STICKERS.map(s=>(
                <button key={s} onClick={()=>addSticker(s)}
                  style={{fontSize:10,fontWeight:800,background:"none",border:"1px solid #e2e8f0",cursor:"pointer",padding:"5px 7px",borderRadius:6,transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Add image */}
        <label style={{fontSize:11,background:"#e0f2fe",border:"1px solid #7dd3fc",borderRadius:6,padding:"3px 9px",cursor:"pointer",color:"#075985",fontWeight:600,boxShadow:"1px 1px 3px rgba(0,0,0,0.1)"}}>
          {lang==="mn"?"Зураг":"Image"}
          <input type="file" accept="image/*" style={{display:"none"}} onChange={addImage}/>
        </label>
        {/* Delete selected */}
        {selected && (
          <button onClick={()=>del(selected)}
            style={{fontSize:11,background:"#fde2e2",border:"1px solid #fca5a5",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#991b1b",fontWeight:600}}>
            Delete
          </button>
        )}
        {/* Font picker for selected note */}
        {selItem?.type==="note" && (
          <select value={selItem.font} onChange={e=>upd(selected,{font:e.target.value})}
            style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"3px 6px",background:"white",cursor:"pointer",fontFamily:VB_FONTS.find(f=>f.id===selItem.font)?.css}}>
            {VB_FONTS.map(f=><option key={f.id} value={f.id} style={{fontFamily:f.css}}>{f.label}</option>)}
          </select>
        )}
      </div>

      {/* Cork Board */}
      <div
        ref={boardRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={()=>{dragRef.current=null;}}
        onClick={()=>{setSelected(null);setShowStickerPicker(false);setEditingId(null);}}
        style={{
          width:"100%", height:BOARD_H, position:"relative", overflow:"hidden",
          borderRadius:10, border:"7px solid #a07850",
          backgroundColor:"#c8a97e",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.8 0.6 0.3 0 0.1 0.6 0.45 0.2 0 0.05 0.3 0.25 0.1 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          boxShadow:"inset 0 0 40px rgba(80,40,5,0.28), 0 4px 16px rgba(0,0,0,0.2)",
          cursor:"default", userSelect:"none",
        }}>
        {/* Cork grain overlay */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"repeating-linear-gradient(43deg,rgba(190,140,80,0.06) 0,rgba(190,140,80,0.06) 1px,transparent 1px,transparent 9px),repeating-linear-gradient(-41deg,rgba(140,90,40,0.05) 0,rgba(140,90,40,0.05) 1px,transparent 1px,transparent 9px)"}}/>

        {/* Items */}
        {items.map(item => {
          const isSel = selected===item.id;

          if (item.type==="sticker") return (
            <div key={item.id}
              onMouseDown={e=>onMouseDown(e,item.id)}
              onTouchStart={e=>onTouchStart(e,item.id)}
              style={{
                position:"absolute", left:item.x, top:item.y,
                fontSize:item.size||36, lineHeight:1,
                transform:`rotate(${item.rot||0}deg)`,
                cursor:"grab", zIndex:isSel?20:5,
                filter:isSel?"drop-shadow(0 0 6px rgba(99,102,241,0.8))":"drop-shadow(1px 2px 3px rgba(0,0,0,0.3))",
                transition:"filter .15s",
              }}>
              {item.emoji}
            </div>
          );

          if (item.type==="image") return (
            <div key={item.id}
              onMouseDown={e=>onMouseDown(e,item.id)}
              onTouchStart={e=>onTouchStart(e,item.id)}
              style={{
                position:"absolute", left:item.x, top:item.y,
                width:item.w, height:item.h,
                transform:`rotate(${item.rot||0}deg)`,
                cursor:"grab", zIndex:isSel?20:5,
                boxShadow:isSel?"0 0 0 2.5px #6366f1, 3px 4px 12px rgba(0,0,0,0.3)":"3px 4px 12px rgba(0,0,0,0.3)",
                borderRadius:3,
                border:item.border?"4px solid white":"none",
              }}>
              {/* Pin */}
              <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",
                width:14,height:14,borderRadius:"50%",background:PIN_COLORS[item.pin%PIN_COLORS.length],
                boxShadow:"0 2px 5px rgba(0,0,0,0.4)",border:"2px solid rgba(255,255,255,0.6)",zIndex:2}}/>
              <img src={item.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:1,display:"block"}}/>
            </div>
          );

          if (item.type==="note") {
            const fontCss = VB_FONTS.find(f=>f.id===item.font)?.css||VB_FONTS[0].css;
            return (
              <div key={item.id}
                onMouseDown={e=>onMouseDown(e,item.id)}
                onTouchStart={e=>onTouchStart(e,item.id)}
                style={{
                  position:"absolute", left:item.x, top:item.y,
                  width:item.w||120, minHeight:70,
                  background:NOTE_COLORS[item.color%NOTE_COLORS.length],
                  transform:`rotate(${item.rot||0}deg)`,
                  cursor:editingId===item.id?"text":"grab", zIndex:isSel?20:5,
                  boxShadow:isSel?"0 0 0 2.5px #6366f1, 3px 5px 14px rgba(0,0,0,0.25)":"2px 4px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.7)",
                  borderRadius:3, padding:"14px 8px 8px",
                  transition:"box-shadow .12s",
                }}>
                {/* Pin */}
                <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",
                  width:14,height:14,borderRadius:"50%",background:PIN_COLORS[item.pin%PIN_COLORS.length],
                  boxShadow:"0 2px 5px rgba(0,0,0,0.4)",border:"2px solid rgba(255,255,255,0.6)",zIndex:2}}/>
                {editingId===item.id ? (
                  <textarea autoFocus
                    value={item.text}
                    onChange={e=>{e.stopPropagation();upd(item.id,{text:e.target.value});}}
                    onClick={e=>e.stopPropagation()}
                    onMouseDown={e=>e.stopPropagation()}
                    onBlur={()=>setTimeout(()=>setEditingId(null),150)}
                    style={{width:"100%",minHeight:50,resize:"both",border:"none",outline:"none",
                      background:"transparent",fontSize:13,fontFamily:fontCss,
                      color:"#2d1a05",lineHeight:1.4,boxSizing:"border-box"}}/>
                ) : (
                  <div style={{fontSize:13,fontFamily:fontCss,color:"#2d1a05",
                    lineHeight:1.4,wordBreak:"break-word",minHeight:40,whiteSpace:"pre-wrap"}}>
                    {item.text || <span style={{opacity:0.3,fontSize:11,fontStyle:"italic"}}>
                      {lang==="mn"?"2x дарж бичих...":"Dbl-click..."}
                    </span>}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}

        {/* Empty hint */}
        {items.length===0 && (
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
            color:"rgba(92,58,30,0.4)",fontSize:12,fontFamily:"DM Sans",textAlign:"center",pointerEvents:"none"}}>
            {lang==="mn"?"Карт, sticker, зураг нэмэх":"Add notes, stickers & images"}
          </div>
        )}
      </div>
    </div>
  );
}

function EditableItem({ text, done, accent, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  const commit = () => {
    const t = val.trim();
    if (t && t !== text) onEdit(t);
    else setVal(text);
    setEditing(false);
  };

  if (editing) return (
    <div style={{display:"flex",alignItems:"center",gap:3,padding:"1px 2px"}}>
      <div style={{width:13,height:13,borderRadius:3,flexShrink:0,border:"1.5px solid #cbd5e1",background:"white"}}/>
      <input ref={inputRef} value={val}
        onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape"){setVal(text);setEditing(false);} }}
        onBlur={commit}
        autoFocus
        style={{fontSize:10,border:"none",outline:"none",background:"transparent",
          color:"#475569",width:"100%",padding:0,lineHeight:1.3}}/>
    </div>
  );

  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{display:"flex",alignItems:"center",gap:3,padding:"1px 2px",
        borderRadius:4,background:hovered?"#f1f5f9":"transparent",transition:"background .1s",userSelect:"none"}}>
      {/* Checkbox */}
      <div onClick={onToggle} style={{width:13,height:13,borderRadius:3,flexShrink:0,cursor:"pointer",
        background:done?accent:"white",
        border:`1.5px solid ${done?accent:"#cbd5e1"}`,
        display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
        {done&&<svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      {/* Text — double click to edit */}
      <span onDoubleClick={()=>{ setVal(text); setEditing(true); }}
        style={{fontSize:10,flex:1,color:done?"#94a3b8":"#475569",
          textDecoration:"none",
          whiteSpace:"normal",wordBreak:"break-word",
          lineHeight:1.3,cursor:"text"}}>
        {text}
      </span>
      {/* Delete button — show on hover */}
      {hovered&&<span onClick={onDelete}
        style={{fontSize:9,color:"#fca5a5",cursor:"pointer",
          lineHeight:1,padding:"0 1px",flexShrink:0}}>✕</span>}
    </div>
  );
}

function AddTodoInline({ dk, onAdd }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const inputRef = useRef(null);

  const commit = () => {
    const text = val.trim();
    if (text) {
      const prev = getStore(`cal_dtodo_${dk}`, []);
      setStore(`cal_dtodo_${dk}`, [...prev, {text, done:false}]);
      onAdd();
    }
    setVal(""); setEditing(false);
  };

  if (!editing) return (
    <button onClick={()=>{ setEditing(true); setTimeout(()=>inputRef.current?.focus(),50); }}
      style={{display:"flex",alignItems:"center",gap:2,background:"none",border:"none",
        cursor:"pointer",padding:"1px 2px",borderRadius:4,color:"#cbd5e1",fontSize:10,
        transition:"color .1s",marginTop:1}}
      onMouseEnter={e=>e.currentTarget.style.color="#94a3b8"}
      onMouseLeave={e=>e.currentTarget.style.color="#cbd5e1"}>
      <span style={{fontSize:12,lineHeight:1}}>+</span> todo
    </button>
  );

  return (
    <div style={{display:"flex",alignItems:"center",gap:2,marginTop:1}}>
      <div style={{width:13,height:13,borderRadius:3,flexShrink:0,border:"1.5px solid #cbd5e1",background:"white"}}/>
      <input ref={inputRef} value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape"){setVal("");setEditing(false);} }}
        onBlur={commit}
        style={{fontSize:10,border:"none",outline:"none",background:"transparent",
          color:"#475569",width:"100%",padding:0,lineHeight:1.3}}
        placeholder="todo..."/>
    </div>
  );
}

// Popup дотор todo нэмэх input component
function PopupTodoInput({ onAdd }) {
  const [val, setVal] = useState("");
  const commit = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(""); }
  };
  return (
    <div className="kr-popup-todo-add" onClick={e=>e.stopPropagation()}>
      <span style={{fontSize:14,color:"#94a3b8",flexShrink:0}}>+</span>
      <input
        value={val}
        onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") commit(); }}
        placeholder="Todo нэмэх..."
        onClick={e=>e.stopPropagation()}
      />
      {val&&<span style={{fontSize:11,color:"#3b82f6",cursor:"pointer",flexShrink:0}} onClick={commit}>Нэмэх</span>}
    </div>
  );
}

export default function Calendar() {
  const { t, theme, lang } = useSettings();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(()=>getStore("cal_ev3",{}));

  // DB-с бүх todo-уудыг татаж, dueDate-тэй нь calendar дээр харуулна
  const { data: todoData } = useGetTodosQuery({ limit: 200 }, { pollingInterval: 30000 });
  const [createTodo] = useCreateTodoMutation();
  const [updateTodo]   = useUpdateTodoMutation();
  const [updateStatus] = useUpdateStatusMutation();
  const [trashTodo]    = useTrashTodoMutation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDate, setQuickDate] = useState("");

  // Todo-уудыг огноогоор нь group хийнэ
  // dueDate нь "YYYY-MM-DD" форматтай тул UTC parse хийж timezone shift-аас сэргийлнэ
  const todoEventsByDate = {};
  (todoData?.todos || []).forEach(todo => {
    if (!todo.dueDate) return;
    // "YYYY-MM-DD" string-г шууд задалж, timezone shift-аас зайлсхийнэ
    const parts = todo.dueDate.split("-");
    if (parts.length !== 3) return;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10); // 1-based month
    const d = parseInt(parts[2], 10);
    const k = `${y}-${m}-${d}`;
    if (!todoEventsByDate[k]) todoEventsByDate[k] = [];
    todoEventsByDate[k].push(todo);
  });

  // Calendar-ийн нэг өдрийн бүх event: localStorage + DB todos
  const getAllEvents = (dateKey) => {
    const manual = events[dateKey] || [];
    const dbTodos = todoEventsByDate[dateKey] || [];
    const todoEvents = dbTodos.map(td => ({
      text: td.title,
      color: td.status === "completed" ? 3 : td.priority === "high" ? 6 : td.status === "in_progress" ? 2 : 0,
      font: "nunito",
      stickers: [],
      _isTodo: true,
      _todo: td,
    }));
    return [...manual, ...todoEvents];
  };
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({text:"",color:0,font:"caveat",stickers:[]});
  const [stickerOpen, setStickerOpen] = useState(false);
  const [topNote, setTopNote] = useState(()=>getStore("cal_tnote",""));
  const [priorities, setPriorities] = useState(()=>getStore("cal_pri",["","",""]));
  const DEFAULT_HABITS = [
    {id:1,emoji:"S",name:"7-8 цаг унтах"},
    {id:2,emoji:"E",name:"Дасгал хийх"},
    {id:3,emoji:"M",name:"Meditation"},
    {id:4,emoji:"R",name:"Ном унших"},
    {id:5,emoji:"W",name:"2л ус уух"},
  ];
  const [habits, setHabits] = useState(()=>{
    const stored = getStore("cal_habits", DEFAULT_HABITS);
    return (stored && stored.length > 0) ? stored : DEFAULT_HABITS;
  });
  const [habitChecks, setHabitChecks] = useState(()=>getStore("cal_hchecks",{}));
  const [habitModal, setHabitModal] = useState(false);
  const [newHabit, setNewHabit] = useState({emoji:"H",name:""});
  // Monthly Goals: сар бүрт тусдаа хадгална
  const goalsKey = (y, m) => `cal_goals_${y}-${m+1}`;
  const [monthGoals, setMonthGoals] = useState(()=>getStore(goalsKey(today.getFullYear(), today.getMonth()),""));

  // Сонгосон өдөр — mini calendar дарахад шилждэг, scroll хийнэ
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const cellRefs = useRef({});

  // Daily To-Do: өдөр бүрт тусдаа
  const dailyTodoKey = (y, m, d) => `cal_dtodo_${y}-${m+1}-${d}`;
  const defaultTodos = () => Array.from({length:9}, ()=>({text:"", done:false}));
  const [dailyTodos, setDailyTodos] = useState(()=>getStore(dailyTodoKey(today.getFullYear(), today.getMonth(), today.getDate()), defaultTodos()));

  const [activeTab, setActiveTab] = useState("YEARLY");
  const [activeNote, setActiveNote] = useState(1);

  const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const toggleHabit = (dateKey, habitId) => {
    const cur = habitChecks[dateKey] || [];
    const next = cur.includes(habitId) ? cur.filter(id=>id!==habitId) : [...cur, habitId];
    const u = {...habitChecks, [dateKey]: next};
    setHabitChecks(u); setStore("cal_hchecks", u);
  };
  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    const h = [...habits, {id: Date.now(), emoji: newHabit.emoji, name: newHabit.name}];
    setHabits(h); setStore("cal_habits", h);
    setNewHabit({emoji:"H", name:""});
  };
  const removeHabit = (id) => {
    const h = habits.filter(hb=>hb.id!==id);
    setHabits(h); setStore("cal_habits", h);
  };

  const MO_S = lang==="mn"?MONTH_MN:MONTH_EN;
  const MO_F = lang==="mn"?MONTH_FULL_MN:MONTH_FULL_EN;
  const DW_S = lang==="mn"?DOW_MN:DOW_EN;
  const DW_F = lang==="mn"?DOW_FULL_MN:DOW_FULL_EN;

  const prevM = ()=>{
    const newM = month===0?11:month-1;
    const newY = month===0?year-1:year;
    if(month===0){setYear(newY);} setMonth(newM);
    setSelectedDay(1);
    setMonthGoals(getStore(goalsKey(newY, newM),""));
    loadDailyTodos(newY, newM, 1);
  };
  const nextM = ()=>{
    const newM = month===11?0:month+1;
    const newY = month===11?year+1:year;
    if(month===11){setYear(newY);} setMonth(newM);
    setSelectedDay(1);
    setMonthGoals(getStore(goalsKey(newY, newM),""));
    loadDailyTodos(newY, newM, 1);
  };

  // Mini calendar дээр өдөр дарахад тэр өдрийн cell рүү scroll хийнэ
  const calendarGridRef = useRef(null);
  const handleMiniDayClick = (d) => {
    if (!d) return;
    setSelectedDay(d);
    loadDailyTodos(year, month, d);
    // Scroll to cell
    setTimeout(() => {
      const ref = cellRefs.current[`${year}-${month+1}-${d}`];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 50);
  };

  // Сар өөрчлөгдөхөд Goals болон DailyTodos-ийг дахин уншина
  const handleMonthGoalsChange = (val) => {
    setMonthGoals(val);
    setStore(goalsKey(year, month), val);
  };

  const loadDailyTodos = (y, m, d) => {
    const loaded = getStore(dailyTodoKey(y, m, d), defaultTodos());
    setDailyTodos(loaded);
    setSelectedDay(d);
  };

  const saveDailyTodos = (updated, y, m, d) => {
    setDailyTodos(updated);
    setStore(dailyTodoKey(y, m, d), updated);
  };

  const key  = (d)=>`${year}-${month+1}-${d}`;
  const evs  = (d)=>getAllEvents(key(d));
  const isToday = (d)=>d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();

  const openAdd=(day)=>{ setModal({day,idx:undefined}); setForm({text:"",color:0,font:"caveat",stickers:[]}); setStickerOpen(false); };
  const openEdit=(day,idx,e)=>{ e.stopPropagation(); const ev=evs(day)[idx]; setModal({day,idx}); setForm({text:ev.text,color:ev.color,font:ev.font||"caveat",stickers:ev.stickers||[]}); setStickerOpen(false); };

  const save=()=>{
    if(!form.text.trim()&&form.stickers.length===0) return;
    const k=key(modal.day); const list=[...(events[k]||[])];
    if(modal.idx!==undefined) list[modal.idx]=form; else list.push(form);
    const u={...events,[k]:list}; setEvents(u); setStore("cal_ev3",u); setModal(null);
  };
  const del=()=>{
    const k=key(modal.day); const list=[...(events[k]||[])];
    list.splice(modal.idx,1);
    const u={...events,[k]:list}; setEvents(u); setStore("cal_ev3",u); setModal(null);
  };
  const toggleS=(id)=>setForm(f=>({...f,stickers:f.stickers.includes(id)?f.stickers.filter(s=>s!==id):[...f.stickers,id]}));
  const savePri=(i,v)=>{ const a=[...priorities]; a[i]=v; setPriorities(a); setStore("cal_pri",a); };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return;
    try {
      await createTodo({
        title: quickTitle.trim(),
        status: "todo",
        priority: "normal",
        dueDate: quickDate || undefined,
      }).unwrap();
      setQuickTitle("");
      setShowQuickAdd(false);
    } catch(e) { console.error(e); }
  };

  const [habitPopup, setHabitPopup] = useState(null); // {day, rect}
  const [popupTodos, setPopupTodos] = useState([]); // popup-ийн todo-уудыг state-д хадгална
  const [todosVersion, setTodosVersion] = useState(0); // cell-г re-render хийх trigger
  const [hoveredDay, setHoveredDay] = useState(null);

  const total=daysInMonth(year,month); const off=firstDow(year,month);
  const cells=[]; for(let i=0;i<off;i++) cells.push(null); for(let d=1;d<=total;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);
  const mini=[]; for(let i=0;i<off;i++) mini.push(null); for(let d=1;d<=total;d++) mini.push(d);

  const ff=(id)=>FONTS.find(f=>f.id===id)?.css||FONTS[0].css;
  const sc=(c)=>SCOLORS[c]||SCOLORS[0];

  return (
    <div className="kr-calendar-page" style={{fontFamily:"DM Sans",overflowY:"auto",background:"linear-gradient(180deg,#f8fafc 0%,#f4f7fb 100%)",borderRadius:18,padding:18}}>
      <style>{`
        @.kr-cal-wrap{background:#f8f6f2;border:1px solid #e0dbd4;border-radius:0;overflow:hidden;width:100%;}
        .kr-top-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 16px 0;border-bottom:0.5px solid #e5e0d8;background:#fff;}
        .kr-tab{font-size:9px;padding:5px 10px;border-radius:6px 6px 0 0;color:#999;cursor:pointer;letter-spacing:.06em;border:0.5px solid transparent;border-bottom:none;background:transparent;}
        .kr-tab.active{background:#fff;color:#3a3530;border-color:#e0dbd4;font-weight:600;}
        .kr-tab2{font-size:9px;padding:3px 9px;border-radius:4px;color:#aaa;cursor:pointer;letter-spacing:.05em;}
        .kr-tab2.active{background:#ede9e3;color:#5a5350;}
        .kr-tab2:hover{background:#f3f0eb;}
        .kr-sidebar{width:148px;min-width:148px;background:#fff;border-right:0.5px solid #e8e3dc;padding:14px 12px;display:flex;flex-direction:column;gap:14px;}
        .kr-section-title{font-size:8px;letter-spacing:.1em;color:#bbb;text-transform:uppercase;margin-bottom:6px;border-bottom:0.5px solid #ece8e2;padding-bottom:4px;}
        .kr-mini-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;}
        .kr-mini-day{font-size:7px;color:#999;text-align:center;padding:2px 0;border-radius:3px;cursor:pointer;}
        .kr-mini-day.today{background:#f2e8e8;color:#c07070;font-weight:600;border-radius:4px;}
        .kr-mini-day.other{color:#ddd;}
        .kr-goals-box{background:#fafaf8;border:0.5px solid #ece8e2;border-radius:8px;padding:8px;min-height:60px;}
        .kr-day-hdr{padding:8px 0 6px;text-align:center;font-size:10px;color:#999;letter-spacing:.05em;font-weight:500;}
        .kr-day-hdr.sat{color:#9ab8d4;} .kr-day-hdr.sun{color:#d49a9a;}
        .kr-cell{border-right:0.5px solid #ece8e2;border-bottom:0.5px solid #ece8e2;padding:5px 6px;min-height:0;height:100%;box-sizing:border-box;background:#fff;cursor:pointer;position:relative;overflow:visible;transition:background .15s;display:flex;flex-direction:column;justify-content:flex-start;vertical-align:top;}
        .kr-cell:hover{background:#fdf9f7;}
        .kr-cell.other-month{background:#fafaf8;}
        .kr-cell.sat{background:#f5f8fc;} .kr-cell.sun{background:#fdf5f5;}
        .kr-cell.today-cell{background:#fef6f0;}
        .kr-day-num{font-size:11px;font-weight:500;color:#5a5350;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:4px;flex-shrink:0;}
        .kr-day-num.sat{color:#9ab8d4;} .kr-day-num.sun{color:#d49a9a;} .kr-day-num.other{color:#d5d0c8;}
        .kr-day-num.today-num{background:#e8a090;color:#fff;}
        .kr-event{font-size:12px;color:#7a7470;padding:2px 4px;border-radius:3px;margin-bottom:2px;line-height:1.4;display:flex;align-items:center;gap:3px;}
        .kr-event::before{content:'·';color:#c8b0b0;}
        .kr-event.pink{background:#fdeaea;color:#c07070;} .kr-event.pink::before{color:#d49a9a;}
        .kr-event.blue{background:#eaf0f8;color:#7090b0;} .kr-event.blue::before{color:#9ab8d4;}
        .kr-event.green{background:#eaf4ee;color:#6a9070;} .kr-event.green::before{color:#a0c4a8;}
        .kr-event.yellow{background:#fdf6e3;color:#a08040;} .kr-event.yellow::before{color:#d4b870;}
        .kr-month-tab{writing-mode:vertical-rl;text-orientation:mixed;font-size:8px;letter-spacing:.12em;color:#ccc;padding:12px 6px;cursor:pointer;border-bottom:0.5px solid #ece8e2;text-transform:uppercase;transition:color .15s,background .15s;flex:1;display:flex;align-items:center;justify-content:center;}
        .kr-month-tab.active{background:#f2e8e8;color:#c07070;font-weight:600;}
        .kr-month-tab:hover{color:#aaa;background:#fafaf8;}
        .kr-todo-item{display:flex;align-items:center;gap:4px;padding:3px 0;font-size:13px;color:#888;}
        .kr-todo-check{width:12px;height:12px;border:1px solid #ddd;border-radius:3px;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .kr-todo-check.done{background:#e8d5d5;border-color:#d4a0a0;}
        .kr-add-btn{font-size:8px;color:#c8b0b0;cursor:pointer;padding:2px 4px;border-radius:4px;border:none;background:none;}
        .kr-add-btn:hover{color:#a08888;background:#f5f0ee;}
        .kr-plus-btn{width:18px;height:18px;border-radius:5px;border:1.5px solid #c8d8c8;background:#f0f7f0;display:none;align-items:center;justify-content:center;cursor:pointer;font-size:13px;font-weight:600;color:#6a9a6a;transition:all .15s;flex-shrink:0;line-height:1;}
        .kr-plus-btn:hover{background:#d4ecd4;border-color:#6a9a6a;color:#3a7a3a;}
        .kr-cell:hover .kr-plus-btn{display:flex;}
        .kr-habit-popup{position:fixed;z-index:200;background:#fff;border-radius:16px;box-shadow:0 8px 25px rgba(0,0,0,0.15);padding:18px 20px;min-width:280px;max-width:320px;max-height:85vh;overflow-y:auto;border:1px solid #e5e7eb;}
        .kr-habit-popup-title{display:flex;align-items:center;justify-content:space-between;font-size:16px;font-weight:600;color:#1f2937;margin-bottom:12px;}
        .kr-habit-popup-icon{width:28px;height:28px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:white;}
        .kr-habit-pct{font-size:14px;font-weight:600;color:#374151;margin-bottom:6px;}
        .kr-habit-bar{height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;margin-bottom:16px;}
        .kr-habit-bar-fill{height:100%;border-radius:4px;transition:width .4s ease;}
        .kr-habit-row{display:flex;align-items:center;gap:12px;padding:8px 6px;cursor:pointer;border-radius:8px;transition:background .15s;}
        .kr-habit-row:hover{background:#f8fafc;}
        .kr-habit-cb{width:20px;height:20px;border-radius:6px;border:2px solid #d1d5db;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;background:#f3f4f6;}
        .kr-habit-cb.checked{background:#3b82f6;border-color:#3b82f6;}
        .kr-habit-name{font-size:14px;color:#374151;flex:1;}
        .kr-popup-divider{border:none;border-top:1px solid #e5e7eb;margin:14px 0;}
        .kr-popup-todo-section{font-size:12px;font-weight:600;color:#6b7280;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
        .kr-popup-todo-add{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;border:1.5px dashed #d1d5db;margin-top:8px;transition:all .15s;}
        .kr-popup-todo-add:hover{border-color:#6b7280;background:#f9fafb;}
        .kr-popup-todo-add input{flex:1;border:none;outline:none;font-size:13px;color:#374151;background:transparent;cursor:text;}
        .kr-popup-todo-add input::placeholder{color:#9ca3af;}
        .kr-popup-todo-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background .15s;}
        .kr-popup-todo-item:hover{background:#f8fafc;}
        .kr-popup-todo-cb{width:18px;height:18px;border-radius:4px;border:2px solid #d1d5db;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;background:#f3f4f6;}
        .kr-popup-todo-cb.done{background:#3b82f6;border-color:#3b82f6;}
        .ccell:hover{background:#eef4ed!important;} .ccell:hover .cadd{opacity:1!important;}
        .echip:hover{filter:brightness(0.93);}
        .pinput{background:transparent;border:none;outline:none;width:100%;font-family:"DM Sans";font-size:14px;color:#3d3830;}
        .pinput::placeholder{color:#c4b8b0;}
        .kr-cal-wrap{background:#f8fafc!important;border:1px solid #e6edf5!important;border-radius:18px!important;overflow:hidden!important;width:100%;box-shadow:0 16px 44px rgba(15,23,42,0.08);}
        .kr-top-nav{padding:14px 18px 0!important;background:rgba(255,255,255,0.94)!important;border-bottom:1px solid #edf2f7!important;backdrop-filter:blur(10px);}
        .kr-tab{font-size:10px!important;padding:7px 12px!important;border-radius:10px 10px 0 0!important;transition:background .15s,color .15s,box-shadow .15s;}
        .kr-tab:hover{background:#f8fafc!important;color:#475569!important;}
        .kr-tab.active{color:#1e293b!important;border-color:#e2e8f0!important;box-shadow:0 -1px 10px rgba(15,23,42,0.05);}
        .kr-tab2{font-size:10px!important;padding:5px 10px!important;border-radius:999px!important;transition:background .15s,color .15s;}
        .kr-tab2.active{background:#ede9fe!important;color:#6d28d9!important;font-weight:800;}
        .kr-sidebar{background:#fff!important;border-right:1px solid #e8edf3!important;padding:16px 14px!important;gap:16px!important;}
        .kr-section-title{font-size:9px!important;color:#94a3b8!important;border-bottom:1px solid #eef2f7!important;font-weight:800;}
        .kr-goals-box{background:#f8fafc!important;border:1px solid #e8edf3!important;border-radius:12px!important;}
        .kr-mini-day{font-size:9px!important;border-radius:6px!important;padding:4px 0!important;transition:background .15s,color .15s,transform .15s;}
        .kr-mini-day:hover{background:#f1f5f9!important;color:#334155!important;transform:translateY(-1px);}
        .kr-mini-day.today{background:#7c3aed!important;color:white!important;font-weight:800!important;}
        .kr-day-hdr{padding:10px 0 8px!important;font-size:11px!important;font-weight:800!important;color:#64748b!important;background:#f8fafc;}
        .kr-cell{border-color:#e8edf3!important;padding:7px 8px!important;background:#fff!important;transition:background .15s,box-shadow .15s,transform .15s;}
        .kr-cell:hover{background:#fffaf7!important;box-shadow:inset 0 0 0 1px rgba(124,58,237,0.18);}
        .kr-cell.other-month{background:#f8fafc!important;}
        .kr-cell.sat{background:#f6fbff!important;} .kr-cell.sun{background:#fff7f7!important;}
        .kr-cell.today-cell{background:#fff7ed!important;box-shadow:inset 0 0 0 2px rgba(249,115,22,0.18);}
        .kr-day-num{font-size:12px!important;font-weight:800!important;width:24px!important;height:24px!important;border-radius:8px!important;}
        .kr-day-num.today-num{background:#f97316!important;color:white!important;box-shadow:0 6px 16px rgba(249,115,22,0.28);}
        .kr-event{font-size:12px!important;padding:4px 7px!important;border-radius:8px!important;margin-bottom:4px!important;font-weight:700!important;box-shadow:0 1px 4px rgba(15,23,42,0.05);}
        .kr-plus-btn{width:22px!important;height:22px!important;border-radius:8px!important;background:#ecfdf5!important;color:#16a34a!important;border:1px solid #bbf7d0!important;box-shadow:0 4px 12px rgba(22,163,74,0.16);}
        .kr-month-tab{font-size:9px!important;border-color:#e8edf3!important;transition:background .15s,color .15s;}
        .kr-month-tab.active{background:#ede9fe!important;color:#6d28d9!important;font-weight:900!important;}
        .kr-habit-popup{border-radius:18px!important;box-shadow:0 20px 60px rgba(15,23,42,0.18)!important;border:1px solid #e8edf3!important;}
        .kr-popup-todo-add,.kr-popup-todo-item{border-radius:10px!important;}
        @media (max-width: 760px){
          .kr-sidebar{display:none!important;}
          .kr-top-nav{align-items:flex-start!important;gap:10px!important;flex-wrap:wrap!important;}
          .kr-month-tab{padding:9px 5px!important;}
          .kr-calendar-page{padding:10px!important;border-radius:14px!important;}
          .kr-cal-wrap{overflow-x:auto!important;border-radius:14px!important;}
          .kr-main-body{min-width:720px!important;}
          .kr-top-nav > div{flex-wrap:wrap!important;}
          .kr-calendar-grid{min-width:640px!important;}
          .kr-cell{min-height:96px!important;padding:6px!important;}
          .kr-event{font-size:11px!important;padding:3px 6px!important;}
        }
        @media (max-width: 520px){
          .kr-main-body{min-width:660px!important;}
          .kr-calendar-grid{min-width:590px!important;}
          .kr-day-hdr{font-size:10px!important;}
          .kr-day-num{width:22px!important;height:22px!important;font-size:11px!important;}
        }
      `}</style>


      {/* Korean-style Monthly Calendar */}
      <div className="kr-cal-wrap">
        {/* Top Nav */}
        <div className="kr-top-nav">
          <div style={{display:"flex",alignItems:"center",gap:10}}>

            <span style={{fontFamily:"DM Sans",fontSize:17,fontWeight:500,color:"#3a3530",letterSpacing:".02em"}}>
              {lang==="mn"?"Сарын хуанли":"Monthly"}
            </span>
            <span style={{fontSize:10,color:"#bbb",marginLeft:2}}>Monthly Calendar</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",gap:2,alignItems:"flex-end"}}>
              {["YEARLY","WEEK"].map(tab=>(
                <div key={tab} className={`kr-tab${activeTab===tab?" active":""}`} onClick={()=>setActiveTab(tab)}>{tab}</div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:"#bbb"}}>
              <span>Notes</span>
              {[1,2,3,4,5].map(n=>(
                <span key={n} style={{cursor:"pointer",padding:"2px 4px",color:activeNote===n?"#e8a0a0":"#bbb",fontWeight:activeNote===n?600:400}}
                  onClick={()=>setActiveNote(n)}>{String(n).padStart(2,"0")}</span>
              ))}
            </div>
            <span style={{fontSize:13,color:"#aaa",cursor:"pointer"}}>⊟</span>
            <div style={{width:1,height:18,background:"#e5e0d8",margin:"0 2px"}}/>
            <button onClick={()=>setHabitModal(true)}
              style={{
                display:"flex",alignItems:"center",gap:5,
                padding:"5px 12px",borderRadius:8,border:"1px solid #e5e0d8",
                background:"white",color:"#7c6f6a",cursor:"pointer",
                fontSize:11,fontWeight:600,
                boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                transition:"all .15s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="#f9f5f2";e.currentTarget.style.borderColor="#c8b0a8";}}
              onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.borderColor="#e5e0d8";}}>
              {lang==="mn"?"Habits":"Manage Habits"}
            </button>
          </div>
        </div>



        {/* Main Body */}
        <div className="kr-main-body" style={{display:"flex"}}>
          {activeTab === "WEEK" ? (
            <div style={{flex:1}}>
              <WeeklyPlanner year={year} month={month} lang={lang} />
            </div>
          ) : (<>
          {/* Sidebar */}
          <div className="kr-sidebar">
            {/* Month + nav */}
            <div>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <div style={{fontFamily:"DM Sans",fontSize:42,color:"#3a3530",lineHeight:1,fontWeight:400}}>{String(month+1).padStart(2,"0")}</div>
                <div style={{display:"flex",flexDirection:"column"}}>
                  <span style={{fontSize:9,color:"#bbb"}}>{year}</span>
                  <span style={{fontSize:12,color:"#5a5350",fontWeight:500}}>{MO_F[month]}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:4,marginTop:6}}>
                <button onClick={prevM} style={{flex:1,background:"#f5f0ee",border:"none",borderRadius:6,padding:"5px 0",cursor:"pointer",color:"#c07070",fontSize:12}}>‹</button>
                <button onClick={nextM} style={{flex:1,background:"#f5f0ee",border:"none",borderRadius:6,padding:"5px 0",cursor:"pointer",color:"#c07070",fontSize:12}}>›</button>
              </div>
            </div>

            {/* Mini calendar — дарахад тэр өдөр рүү шилждэг */}
            <div>
              <div className="kr-section-title">Mini Calendar</div>
              <div className="kr-mini-grid">
                {(lang==="mn"?["Да","Мя","Лх","Пү","Ба","Бя","Ня"]:["M","T","W","T","F","S","S"]).map((d,i)=>(
                  <div key={i} style={{fontSize:7,color:i>=5?"#d4b0b0":"#ccc",textAlign:"center",padding:"1px 0"}}>{d}</div>
                ))}
                {mini.map((d,i)=>(
                  <div key={i}
                    className={`kr-mini-day${isToday(d)?" today":""}${!d?" other":""}${d&&d===selectedDay&&!isToday(d)?" selected":""}`}
                    style={{
                      color:isToday(d)?undefined:d===selectedDay?("#fff"):i%7===5?"#9ab8d4":i%7===6?"#d49a9a":undefined,
                      background:d===selectedDay&&!isToday(d)?"#c8a8a8":undefined,
                      borderRadius:3,
                      cursor:d?"pointer":"default",
                      fontWeight:d===selectedDay?600:undefined,
                    }}
                    onClick={()=>{ if(d){ handleMiniDayClick(d); } }}>
                    {d||""}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Goals — сар бүрт тусдаа хадгалагдана */}
            <div>
              <div className="kr-section-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>Monthly Goals</span>
                <span style={{fontSize:7,color:"#d4a0a0",letterSpacing:0}}>{MO_S[month]}</span>
              </div>
              <div className="kr-goals-box">
                <textarea
                  value={monthGoals}
                  onChange={e=>handleMonthGoalsChange(e.target.value)}
                  placeholder={lang==="mn"?"Энэ сарын зорилго...":"Monthly goals..."}
                  style={{width:"100%",minHeight:50,resize:"none",border:"none",outline:"none",background:"transparent",fontSize:13,color:"#7a7470",lineHeight:1.5,boxSizing:"border-box"}}
                />
              </div>
            </div>

            {/* To-Do List — өдөр бүрт тусдаа (сонгосон өдрийн зуршлын жагсаалт) */}
            <div style={{flex:1}}>
              <div className="kr-section-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>To-Do List</span>
                <span style={{fontSize:7,color:"#d4a0a0",letterSpacing:0}}>
                  {String(month+1).padStart(2,"0")}/{String(selectedDay).padStart(2,"0")}
                </span>
              </div>
              {dailyTodos.map((todo,i)=>(
                <div key={i} className="kr-todo-item">
                  <span style={{color:"#d4a0a0",fontSize:12,minWidth:14}}>{i+1}</span>
                  <div className={`kr-todo-check${todo.done?" done":""}`}
                    onClick={()=>{
                      const u=dailyTodos.map((t,j)=>j===i?{...t,done:!t.done}:t);
                      saveDailyTodos(u,year,month,selectedDay);
                    }}>
                    {todo.done&&<span style={{fontSize:9,color:"#d4a0a0"}}>✓</span>}
                  </div>
                  <input
                    value={todo.text}
                    onChange={e=>{
                      const u=dailyTodos.map((t,j)=>j===i?{...t,text:e.target.value}:t);
                      saveDailyTodos(u,year,month,selectedDay);
                    }}
                    placeholder={i===0?(lang==="mn"?"Өнөөдрийн зуршил...":"Today's habits..."):`${i+1}...`}
                    style={{background:"transparent",border:"none",outline:"none",fontSize:13,color:todo.done?"#ccc":"#6b7280",textDecoration:"none",width:"100%"}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid + Month Tabs */}
          <div className="kr-calendar-grid" style={{display:"flex",flex:1,minHeight:0}}>
            <div style={{flex:1,display:"flex",flexDirection:"column"}}>
              {/* Day Headers */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"0.5px solid #ece8e2",background:"#fff"}}>
                {(lang==="mn"?DOW_FULL_MN:DOW_FULL_EN).map((d,i)=>(
                  <div key={d} className={`kr-day-hdr${i===5?" sat":i===6?" sun":""}`}>{d}</div>
                ))}
              </div>

              {/* Calendar cells */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gridAutoRows:"minmax(80px,1fr)",flex:1}}>
                {cells.map((day,ci)=>{
                  const dk = day ? key(day) : null;
                  const dayAllEvents = dk ? getAllEvents(dk) : [];
                  // todosVersion-г dependency болгосноор popup нэмэх үед cell автоматаар шинэчлэгдэнэ
                  const dayTodos = dk ? (todosVersion >= 0 ? getStore(`cal_dtodo_${dk}`,[]) : []) : [];
                  const checks = dk ? (habitChecks[dk]||[]) : [];
                  const colIdx = ci%7;
                  const isSat = colIdx===5, isSun = colIdx===6;
                  const cellKey = day ? `${year}-${month+1}-${day}` : null;
                  const isSelected = day && day===selectedDay;
                  const pct = habits.length>0 ? Math.round(checks.length/habits.length*100) : 0;
                  return (
                    <div key={ci}
                      ref={el=>{ if(cellKey && el) cellRefs.current[cellKey]=el; }}
                      className={`kr-cell${!day?" other-month":""}${isSat?" sat":""}${isSun?" sun":""}${isToday(day)?" today-cell":""}`}
                      style={{
                        borderRight:colIdx<6?"0.5px solid #ece8e2":"none",
                        outline:isSelected&&!isToday(day)?"1.5px solid #d4a0a0":"none",
                        outlineOffset:"-1.5px",
                      }}
                      onClick={()=>{ if(day){ loadDailyTodos(year,month,day); setSelectedDay(day); } }}>
                      {day&&<>
                        {/* Date number + + button side by side */}
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                          <div className={`kr-day-num${isSat?" sat":isSun?" sun":""}${isToday(day)?" today-num":""}`}>{day}</div>
                          <div style={{display:"flex",alignItems:"center",gap:3}}>
                            {/* Habit progress indicator */}
                            {habits.length>0&&checks.length>0&&(
                              <div style={{fontSize:7,color:pct===100?"#22c55e":"#9ab0a8",fontWeight:600}}>{pct}%</div>
                            )}
                            {/* Simple todo completion indicator - just a dot if any todos exist and some completed */}
                            {dayTodos.filter(t=>t.text).length>0&&dayTodos.filter(t=>t.text&&t.done).length>0&&(
                              <div style={{
                                width:4,
                                height:4,
                                borderRadius:"50%",
                                background:"#22c55e",
                                border:"1px solid rgba(34,197,94,0.3)"
                              }}/>
                            )}
                            <div className="kr-plus-btn"
                              onClick={e=>{
                                e.stopPropagation();
                                const rect=e.currentTarget.closest(".kr-cell").getBoundingClientRect();
                                const newPopup = habitPopup?.day===day ? null : {day, rect};
                                setHabitPopup(newPopup);
                                if (newPopup) {
                                  // popup нээхэд тухайн өдрийн todo-г state-д ачаална
                                  const loaded = getStore(`cal_dtodo_${year}-${month+1}-${day}`, defaultTodos());
                                  setPopupTodos(loaded);
                                }
                              }}>+</div>
                          </div>
                        </div>


                        {/* Events (manual + DB todos) */}
                        {dayAllEvents.slice(0,4).map((ev,ei)=>{
                          // DB todo — card загвар
                          if(ev._isTodo){
                            const td=ev._todo||{};
                            const done=td.status==="completed";
                            const PCOLORS={
                              high:  {bg:"#fff1f2",bar:"#e11d48",text:"#be123c"},
                              medium:{bg:"#fffbeb",bar:"#d97706",text:"#92400e"},
                              low:   {bg:"#f0fdf4",bar:"#16a34a",text:"#15803d"},
                            };
                            const pc=done?{bg:"#f8fafc",bar:"#cbd5e1",text:"#94a3b8"}:(PCOLORS[td.priority]||PCOLORS.medium);
                            return(
                              <div key={ei}
                                style={{
                                  display:"flex",alignItems:"center",gap:4,
                                  background:pc.bg, borderRadius:6, marginBottom:3,
                                  boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
                                  opacity:done?0.7:1, position:"relative", transition:"all 0.15s",
                                }}
                                onMouseEnter={e=>{
                                  e.currentTarget.style.transform="translateY(-1px)";
                                  e.currentTarget.style.boxShadow="0 3px 8px rgba(0,0,0,0.12)";
                                  const a=e.currentTarget.querySelector('.cal-todo-actions');
                                  if(a) a.style.opacity='1';
                                }}
                                onMouseLeave={e=>{
                                  e.currentTarget.style.transform="translateY(0)";
                                  e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.07)";
                                  const a=e.currentTarget.querySelector('.cal-todo-actions');
                                  if(a) a.style.opacity='0';
                                }}>
                                <div style={{width:3,alignSelf:"stretch",background:pc.bar,flexShrink:0,borderRadius:"6px 0 0 6px"}}/>
                                <div
                                  onClick={e=>{
                                    e.stopPropagation();
                                    updateStatus({id:td.id,status:done?"todo":"completed"});
                                  }}
                                  style={{
                                    width:16,height:16,flexShrink:0,cursor:"pointer",
                                    border:`2px solid ${done?pc.bar:"#d1d5db"}`,borderRadius:4,
                                    background:done?pc.bar:"white",
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    zIndex:5,
                                  }}>
                                  {done&&<svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6.5 7,1.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span style={{
                                  flex:1,fontSize:9,lineHeight:1.3,
                                  color:pc.text,padding:"3px 0",
                                  textDecoration:done?"line-through":"none",
                                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                                }}>{ev.text}</span>
                                {/* Actions */}
                                <div className="cal-todo-actions"
                                  style={{display:"flex",gap:1,opacity:0,transition:"opacity 0.15s",paddingRight:2}}>
                                  <button onClick={e=>{
                                    e.stopPropagation();
                                    const t=prompt("Засах:",td.title);
                                    if(t&&t.trim()&&t!==td.title) updateTodo({id:td.id,title:t.trim()});
                                  }} style={{background:"none",border:"none",cursor:"pointer",
                                    color:"#60a5fa",padding:"1px",display:"flex"}}
                                  title="Засах"><MdEdit size={10}/></button>
                                  <button onClick={e=>{
                                    e.stopPropagation();
                                    if(confirm("Устгах уу?")) trashTodo(td.id);
                                  }} style={{background:"none",border:"none",cursor:"pointer",
                                    color:"#f87171",padding:"1px",display:"flex"}}
                                  title="Устгах"><MdDelete size={10}/></button>
                                </div>
                              </div>
                            );
                          }
                          // Manual event
                          const cls=ev.color===0?"yellow":ev.color===1||ev.color===6?"pink":ev.color===2||ev.color===7?"blue":"green";
                          return (
                            <div key={ei} className={`kr-event ${cls}`}
                              style={{opacity:1}}
                              onClick={e=>{ e.stopPropagation(); openEdit(day,ei,e); }}>
                              {ev.stickers&&ev.stickers.length>0&&<span style={{width:10,height:10,display:"inline-block"}} dangerouslySetInnerHTML={{__html:STICKERS.find(s=>s.id===ev.stickers[0])?.svg||""}}/>}
                              <span style={{whiteSpace:"normal",wordBreak:"break-word"}}>{ev.text}</span>
                            </div>
                          );
                        })}

                        {/* Daily Todos - card style */}
                        {dayTodos.filter(t=>t.text).slice(0,3).map((todo,ti)=>{
                          const PCOLORS = {
                            high:   { bg:"#fff1f2", bar:"#e11d48", text:"#be123c" },
                            medium: { bg:"#fffbeb", bar:"#d97706", text:"#92400e" },
                            low:    { bg:"#f0fdf4", bar:"#16a34a", text:"#15803d" },
                          };
                          const pc = todo.done
                            ? { bg:"#f8fafc", bar:"#cbd5e1", text:"#94a3b8" }
                            : (PCOLORS[todo.priority] || PCOLORS.medium);
                          return (
                          <div key={ti}
                            style={{
                              display:"flex", alignItems:"center", gap:4,
                              background: pc.bg,
                              borderRadius:6,
                              marginBottom:3,
                              overflow:"hidden",
                              boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
                              opacity: todo.done ? 0.7 : 1,
                              position:"relative",
                              transition:"all 0.15s",
                            }}
                            onMouseEnter={e=>{
                              e.currentTarget.style.transform="translateY(-1px)";
                              e.currentTarget.style.boxShadow="0 3px 8px rgba(0,0,0,0.12)";
                              e.currentTarget.querySelector('.cal-todo-actions').style.opacity='1';
                            }}
                            onMouseLeave={e=>{
                              e.currentTarget.style.transform="translateY(0)";
                              e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.07)";
                              e.currentTarget.querySelector('.cal-todo-actions').style.opacity='0';
                            }}>
                            {/* Left color bar */}
                            <div style={{width:3,alignSelf:"stretch",background:pc.bar,flexShrink:0,borderRadius:"6px 0 0 6px"}}/>
                            {/* Checkbox */}
                            <div
                              onClick={e=>{
                                e.stopPropagation();
                                const u=dayTodos.map((t,i)=>i===ti?{...t,done:!t.done}:t);
                                setStore(`cal_dtodo_${dk}`,u);
                                setTodosVersion(v=>v+1);
                              }}
                              style={{
                                width:12,height:12,flexShrink:0,cursor:"pointer",
                                border:`1.5px solid ${todo.done?pc.bar:"#d1d5db"}`,
                                borderRadius:3,
                                background:todo.done?pc.bar:"white",
                                display:"flex",alignItems:"center",justifyContent:"center",
                              }}>
                              {todo.done&&<svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1.5,4 3,5.5 6.5,2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            {/* Text */}
                            <span style={{
                              flex:1, fontSize:9, lineHeight:1.3,
                              color: todo.done?"#94a3b8":pc.text,
                              textDecoration:todo.done?"line-through":"none",
                              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                              padding:"3px 0",
                            }}>{todo.text}</span>
                            {/* Actions */}
                            <div className="cal-todo-actions"
                              style={{display:"flex",gap:1,opacity:0,transition:"opacity 0.15s",paddingRight:2}}>
                              <button onClick={e=>{
                                e.stopPropagation();
                                const newText=prompt("Edit todo:",todo.text);
                                if(newText&&newText.trim()&&newText!==todo.text){
                                  const u=dayTodos.map((t,i)=>i===ti?{...t,text:newText.trim()}:t);
                                  setStore(`cal_dtodo_${dk}`,u); setTodosVersion(v=>v+1);
                                }
                              }} style={{background:"none",border:"none",cursor:"pointer",color:"#60a5fa",padding:"1px",display:"flex"}}
                              title="Edit"><MdEdit size={10}/></button>
                              <button onClick={e=>{
                                e.stopPropagation();
                                if(confirm("Delete?")){
                                  const u=dayTodos.filter((_,i)=>i!==ti);
                                  setStore(`cal_dtodo_${dk}`,u); setTodosVersion(v=>v+1);
                                }
                              }} style={{background:"none",border:"none",cursor:"pointer",color:"#f87171",padding:"1px",display:"flex"}}
                              title="Delete"><MdDelete size={10}/></button>
                            </div>
                          </div>
                          );
                        })}

                        {/* Show "+" indicator if more todos exist */}
                        {dayTodos.filter(t=>t.text).length>3&&(
                          <div style={{
                            fontSize:8,
                            color:"#94a3b8",
                            textAlign:"center",
                            padding:"2px 0",
                            background:"rgba(148,163,184,0.1)",
                            borderRadius:3,
                            cursor:"pointer"
                          }}
                          onClick={e=>{
                            e.stopPropagation();
                            const rect=e.currentTarget.closest(".kr-cell").getBoundingClientRect();
                            const newPopup = habitPopup?.day===day ? null : {day, rect};
                            setHabitPopup(newPopup);
                            if (newPopup) {
                              const loaded = getStore(`cal_dtodo_${year}-${month+1}-${day}`, defaultTodos());
                              setPopupTodos(loaded);
                            }
                          }}>
                            +{dayTodos.filter(t=>t.text).length-3} more
                          </div>
                        )}


                      </>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Month Tabs (right side) */}
            <div style={{display:"flex",flexDirection:"column",borderLeft:"0.5px solid #ece8e2"}}>
              {MONTHS_EN.map((m,i)=>(
                <div key={m} className={`kr-month-tab${i===month?" active":""}`}
                  onClick={()=>{
                    const newDay = 1;
                    setMonth(i);
                    setSelectedDay(newDay);
                    setMonthGoals(getStore(goalsKey(year, i),""));
                    loadDailyTodos(year, i, newDay);
                  }}>
                  {m}
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>
      </div>

      {/* ── School Schedule ── */}
      <SchoolSchedule lang={lang} />

      {/* Daily Habit Popup */}
      {habitPopup&&(()=>{
        const dk2 = `${year}-${month+1}-${habitPopup.day}`;
        const checks2 = habitChecks[dk2]||[];
        const popTodos = popupTodos;
        // All Todos хуудаснаас нэмсэн todo-г тухайн өдрөөр шүүнэ
        const popDateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(habitPopup.day).padStart(2,"0")}`;
        const popDbTodos = (todoEventsByDate[popDateKey] || []).filter(td=>td.status!=="trashed");
        // Progress = habits + todos хоёрыг нэгтгэж тооцоолно
        const totalItems = habits.length + popTodos.filter(t=>t.text).length + popDbTodos.length;
        const doneItems = checks2.length + popTodos.filter(t=>t.text&&t.done).length + popDbTodos.filter(t=>t.status==="completed").length;
        const pct2 = totalItems>0 ? (doneItems/totalItems*100).toFixed(1) : 0;
        const rect = habitPopup.rect;
        const winH = window.innerHeight;
        const winW = window.innerWidth;
        const popH = 120 + habits.length*40 + 60;
        const top = rect.bottom+8+popH>winH ? Math.max(8, rect.top-popH-8) : rect.bottom+8;
        const left = Math.min(Math.max(8, rect.left-20), winW-310);

        const savePopTodo = (updated) => {
          setStore(`cal_dtodo_${year}-${month+1}-${habitPopup.day}`, updated);
          setPopupTodos(updated); // popup state шинэчилнэ
          setTodosVersion(v => v + 1); // cell-г re-render хийнэ
          if (habitPopup.day === selectedDay) setDailyTodos(updated);
        };

        return (
          <>
            <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setHabitPopup(null)}/>
            <div className="kr-habit-popup" style={{top, left}} onClick={e=>e.stopPropagation()}>
              {/* Title */}
              <div className="kr-habit-popup-title">
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div className="kr-habit-popup-icon">H</div>
                  <div>
                    <div style={{fontSize:16,fontWeight:600,color:"#1f2937"}}>Daily Habit</div>
                    <div style={{fontSize:11,color:"#6b7280"}}>
                      {year}/{String(month+1).padStart(2,"0")}/{String(habitPopup.day).padStart(2,"0")}
                    </div>
                  </div>
                </div>
                <button onClick={()=>setHabitPopup(null)} 
                        style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#9ca3af",padding:"4px"}}>×</button>
              </div>

              {/* Progress */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span className="kr-habit-pct">{pct2}%</span>
                <div className="kr-habit-bar" style={{flex:1,margin:0}}>
                  <div className="kr-habit-bar-fill" style={{width:`${pct2}%`,background:Number(pct2)===100?"#22c55e":"#3b82f6"}}/>
                </div>
              </div>
              <div style={{marginBottom:8}}/>

              {/* Daily Habits нэмэх */}
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:20,height:20,background:"#8b5cf6",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"white",fontSize:10,fontWeight:600}}>H</span>
                </div>
                <span style={{fontSize:12,fontWeight:600,color:"#6b7280"}}>
                  {lang==="mn"?"Habit нэмэх":"Add Habit"}
                </span>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                <input
                  id="popup-habit-emoji"
                  defaultValue="H"
                  style={{width:38,border:"1.5px solid #e5e7eb",borderRadius:7,padding:"5px 6px",fontSize:15,textAlign:"center",outline:"none",fontFamily:"inherit"}}
                />
                <input
                  id="popup-habit-name"
                  placeholder={lang==="mn"?"Habit нэр...":"Habit name..."}
                  onKeyDown={e=>{
                    if(e.key==="Enter"){
                      const name=e.target.value.trim();
                      const emoji=document.getElementById("popup-habit-emoji").value||"H";
                      if(!name) return;
                      const newH={id:Date.now(),name,emoji};
                      const updated=[...habits,newH];
                      setHabits(updated);
                      setStore("cal_habits",updated);
                      e.target.value="";
                    }
                  }}
                  style={{flex:1,border:"1.5px solid #e5e7eb",borderRadius:7,padding:"5px 10px",fontSize:13,outline:"none",fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor="#8b5cf6"}
                  onBlur={e=>e.target.style.borderColor="#e5e7eb"}
                />
                <button
                  onClick={()=>{
                    const name=document.getElementById("popup-habit-name").value.trim();
                    const emoji=document.getElementById("popup-habit-emoji").value||"H";
                    if(!name) return;
                    const newH={id:Date.now(),name,emoji};
                    const updated=[...habits,newH];
                    setHabits(updated);
                    setStore("cal_habits",updated);
                    document.getElementById("popup-habit-name").value="";
                  }}
                  style={{background:"#8b5cf6",border:"none",borderRadius:7,color:"white",fontSize:18,width:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>

              {/* Divider + Todo section */}
              <hr className="kr-popup-divider"/>
              <div className="kr-popup-todo-section">
                <div style={{width:20,height:20,background:"#f97316",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"white",fontSize:10,fontWeight:600}}>T</span>
                </div>
                <span>{lang==="mn"?"Өнөөдрийн ажил":"Daily Todos"}</span>
              </div>

              {/* Existing todos */}
              {popTodos.filter(t=>t.text).map((td,ti)=>(
                <div key={ti} className="kr-popup-todo-item"
                  onClick={()=>{
                    const u=popTodos.map((t,j)=>j===ti?{...t,done:!t.done}:t);
                    savePopTodo(u);
                  }}>
                  <div className={`kr-popup-todo-cb${td.done?" done":""}`}>
                    {td.done&&<svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{fontSize:13,color:td.done?"#94a3b8":"#374151",textDecoration:"none",flex:1}}>{td.text}</span>
                </div>
              ))}

              {/* DB todos from All Todos page */}
              {popDbTodos.map((td,ti)=>{
                const PCOLORS={
                  high:  {bg:"#fff1f2",bar:"#e11d48",text:"#be123c"},
                  medium:{bg:"#fffbeb",bar:"#d97706",text:"#92400e"},
                  low:   {bg:"#f0fdf4",bar:"#16a34a",text:"#15803d"},
                };
                const done=td.status==="completed";
                const pc=done?{bg:"#f8fafc",bar:"#cbd5e1",text:"#94a3b8"}:(PCOLORS[td.priority]||PCOLORS.medium);
                return(
                  <div key={td.id||ti}
                    style={{
                      display:"flex",alignItems:"center",gap:8,padding:"6px 8px",
                      borderRadius:8,marginBottom:4,background:pc.bg,
                      border:`1px solid ${pc.bar}33`,opacity:done?0.72:1,
                      transition:"all .15s",position:"relative",
                    }}
                    onMouseEnter={e=>e.currentTarget.querySelector('.pdb-actions').style.opacity='1'}
                    onMouseLeave={e=>e.currentTarget.querySelector('.pdb-actions').style.opacity='0'}>
                    {/* Checkbox */}
                    <div onClick={()=>updateStatus({id:td.id,status:done?"todo":"completed"})}
                      style={{
                        width:18,height:18,flexShrink:0,borderRadius:5,cursor:"pointer",
                        border:`2px solid ${done?pc.bar:"#d1d5db"}`,
                        background:done?pc.bar:"white",
                        display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",
                      }}>
                      {done&&<svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{width:3,height:18,borderRadius:2,background:pc.bar,flexShrink:0}}/>
                    <span style={{fontSize:13,flex:1,color:done?"#94a3b8":pc.text,
                      textDecoration:done?"line-through":"none",lineHeight:1.3}}>{td.title}</span>
                    {td.priority&&(
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,flexShrink:0,
                        background:`${pc.bar}22`,color:pc.text,fontWeight:700}}>
                        {td.priority==="high"?"Өндөр":td.priority==="medium"?"Дунд":"Бага"}
                      </span>
                    )}
                    <div className="pdb-actions"
                      style={{display:"flex",gap:2,opacity:0,transition:"opacity .15s",flexShrink:0}}>
                      <button
                        onClick={()=>{
                          const t=prompt("Засах:",td.title);
                          if(t&&t.trim()&&t!==td.title) updateTodo({id:td.id,title:t.trim()});
                        }}
                        style={{background:"none",border:"none",cursor:"pointer",
                          color:"#60a5fa",padding:"2px",display:"flex",alignItems:"center"}}
                        title="Засах"><MdEdit size={13}/></button>
                      <button
                        onClick={()=>{ if(confirm("Устгах уу?")) trashTodo(td.id); }}
                        style={{background:"none",border:"none",cursor:"pointer",
                          color:"#f87171",padding:"2px",display:"flex",alignItems:"center"}}
                        title="Устгах"><MdDelete size={13}/></button>
                    </div>
                  </div>
                );
              })}

              {/* Add new todo input */}
              <PopupTodoInput
                onAdd={(text)=>{
                  const emptyIdx = popTodos.findIndex(t=>!t.text);
                  let updated;
                  if(emptyIdx>=0){
                    updated = popTodos.map((t,i)=>i===emptyIdx?{text,done:false}:t);
                  } else {
                    updated = [...popTodos, {text,done:false}];
                  }
                  savePopTodo(updated);
                }}
              />

              {/* Daily Habits section */}
              {habits.length>0&&(<>
                <hr className="kr-popup-divider" style={{margin:"10px 0"}}/>
                <div className="kr-popup-todo-section">
                  <div style={{width:20,height:20,background:"#8b5cf6",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{color:"white",fontSize:10,fontWeight:600}}>H</span>
                  </div>
                  <span>{lang==="mn"?"Өнөөдрийн habit":"Daily Habits"}</span>
                </div>
                {habits.map(hb=>{
                  const checked=checks2.includes(hb.id);
                  const isEditing = habitPopup._editingId === hb.id;
                  return (
                    <div key={hb.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 2px",borderRadius:7,background:isEditing?"#f8f7ff":"transparent"}}>
                      {isEditing ? (
                        <input
                          autoFocus
                          defaultValue={hb.name}
                          onKeyDown={e=>{
                            if(e.key==="Enter"){
                              const newName=e.target.value.trim();
                              if(newName){
                                setHabits(prev=>prev.map(h=>h.id===hb.id?{...h,name:newName}:h));
                                setStore("cal_habits", habits.map(h=>h.id===hb.id?{...h,name:newName}:h));
                              }
                              setHabitPopup(p=>({...p,_editingId:null}));
                            }
                            if(e.key==="Escape") setHabitPopup(p=>({...p,_editingId:null}));
                          }}
                          onBlur={e=>{
                            const newName=e.target.value.trim();
                            if(newName){
                              setHabits(prev=>prev.map(h=>h.id===hb.id?{...h,name:newName}:h));
                              setStore("cal_habits", habits.map(h=>h.id===hb.id?{...h,name:newName}:h));
                            }
                            setHabitPopup(p=>({...p,_editingId:null}));
                          }}
                          style={{flex:1,border:"1.5px solid #8b5cf6",borderRadius:6,padding:"3px 8px",fontSize:13,outline:"none",fontFamily:"inherit"}}
                        />
                      ) : (
                        <>
                          <div className={`kr-popup-todo-cb${checked?" done":""}`}
                            onClick={()=>toggleHabit(dk2,hb.id)} style={{cursor:"pointer"}}>
                            {checked&&<svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span style={{fontSize:15,lineHeight:1}}>{hb.emoji}</span>
                          <span onClick={()=>toggleHabit(dk2,hb.id)} style={{fontSize:13,color:checked?"#94a3b8":"#374151",textDecoration:checked?"line-through":"none",flex:1,cursor:"pointer"}}>{hb.name}</span>
                          <button onClick={e=>{e.stopPropagation();setHabitPopup(p=>({...p,_editingId:hb.id}));}}
                            style={{background:"none",border:"none",cursor:"pointer",padding:"2px 4px",borderRadius:4,lineHeight:1,color:"#9ca3af",display:"flex",alignItems:"center"}}
                            title="Засах"><MdEdit size={14}/></button>
                          <button onClick={e=>{
                            e.stopPropagation();
                            if(!window.confirm(`"${hb.name}" устгах уу?`)) return;
                            const updated=habits.filter(h=>h.id!==hb.id);
                            setHabits(updated);
                            setStore("cal_habits",updated);
                          }}
                            style={{background:"none",border:"none",cursor:"pointer",padding:"2px 4px",borderRadius:4,lineHeight:1,color:"#f87171",display:"flex",alignItems:"center"}}
                            title="Устгах"><MdDelete size={15}/></button>
                        </>
                      )}
                    </div>
                  );
                })}
              </>)}
            </div>
          </>
        );
      })()}

      {/* Quick Add Todo Modal */}
      {showQuickAdd&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.32)",backdropFilter:"blur(4px)"}}
          onClick={()=>setShowQuickAdd(false)}>
          <div style={{background:"white",borderRadius:20,padding:24,width:360,
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)",border:"1px solid #f0ebe5"}}
            onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:10,
                  background:"linear-gradient(135deg,#e8a090,#c87060)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:"0 3px 10px rgba(200,112,96,0.4)"}}>
                  <MdAdd size={20} color="white"/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"#3a3530"}}>Шинэ даалгавар</div>
                  <div style={{fontSize:11,color:"#bbb"}}>New Todo</div>
                </div>
              </div>
              <button onClick={()=>setShowQuickAdd(false)}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#c4b8b0",lineHeight:1}}>×</button>
            </div>

            {/* Title input */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:"#9b948a",letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:5}}>Гарчиг</label>
              <input
                autoFocus
                value={quickTitle}
                onChange={e=>setQuickTitle(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") handleQuickAdd(); if(e.key==="Escape") setShowQuickAdd(false); }}
                placeholder="Даалгаврын гарчиг..."
                style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #ece8e2",borderRadius:10,
                  padding:"10px 14px",fontSize:14,color:"#3a3530",outline:"none",
                  fontFamily:"DM Sans",background:"#faf9f7",
                  transition:"border-color .15s"}}
                onFocus={e=>e.target.style.borderColor="#e8a090"}
                onBlur={e=>e.target.style.borderColor="#ece8e2"}
              />
            </div>

            {/* Date picker */}
            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,fontWeight:600,color:"#9b948a",letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:5}}>Огноо</label>
              <input
                type="date"
                value={quickDate}
                onChange={e=>setQuickDate(e.target.value)}
                style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #ece8e2",borderRadius:10,
                  padding:"9px 14px",fontSize:13,color:"#3a3530",outline:"none",
                  background:"#faf9f7",cursor:"pointer",
                  transition:"border-color .15s"}}
                onFocus={e=>e.target.style.borderColor="#e8a090"}
                onBlur={e=>e.target.style.borderColor="#ece8e2"}
              />
            </div>

            {/* Buttons */}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowQuickAdd(false)}
                style={{padding:"9px 18px",borderRadius:10,border:"1px solid #ece8e2",
                  background:"white",color:"#9b948a",fontSize:13,cursor:"pointer",fontWeight:500,
                  fontFamily:"DM Sans"}}>
                Болих
              </button>
              <button onClick={handleQuickAdd}
                style={{padding:"9px 22px",borderRadius:10,border:"none",
                  background:quickTitle.trim()?"linear-gradient(135deg,#e8a090,#c87060)":"#e0dbd4",
                  color:"white",fontSize:13,cursor:quickTitle.trim()?"pointer":"default",
                  fontWeight:700,fontFamily:"DM Sans",
                  boxShadow:quickTitle.trim()?"0 3px 10px rgba(200,112,96,0.35)":"none",
                  transition:"all .15s"}}>
                Нэмэх
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Habit modal */}
      {habitModal&&(
        <div style={{position:"fixed",inset:0,zIndex:70,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)"}}>
          <div style={{background:"white",borderRadius:20,padding:24,width:340,maxHeight:"80vh",overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <span style={{fontSize:16,fontWeight:700,color:"#1e293b"}}>🔄 Daily Habits</span>
              <button onClick={()=>setHabitModal(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#94a3b8"}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {habits.map(hb=>(
                <div key={hb.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                  background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                  <span style={{fontSize:18}}>{hb.emoji}</span>
                  <span style={{flex:1,fontSize:13,color:"#334155"}}>{hb.name}</span>
                  <button onClick={()=>removeHabit(hb.id)}
                    style={{background:"none",border:"none",cursor:"pointer",color:"#f87171",fontSize:14,padding:"2px 4px"}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input value={newHabit.emoji} onChange={e=>setNewHabit(p=>({...p,emoji:e.target.value}))}
                style={{width:40,textAlign:"center",fontSize:18,border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 4px",outline:"none"}}/>
              <input value={newHabit.name} onChange={e=>setNewHabit(p=>({...p,name:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&addHabit()}
                placeholder={lang==="mn"?"Habit нэр...":"Habit name..."}
                style={{flex:1,fontSize:13,border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 10px",outline:"none"}}/>
              <button onClick={addHabit}
                style={{background:theme.accent,color:"white",border:"none",borderRadius:8,
                  padding:"7px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>+</button>
            </div>
          </div>
        </div>
      )}

      {modal&&(
        <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.28)",backdropFilter:"blur(4px)",padding:16}}>
          <div style={{width:"100%",maxWidth:420,borderRadius:22,background:sc(form.color).bg,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"12px 14px 6px",flexWrap:"wrap"}}>
              {SCOLORS.map((c,i)=>(
                <button key={i} onClick={()=>setForm(f=>({...f,color:i}))}
                  style={{width:16,height:16,borderRadius:"50%",background:c.bg,border:form.color===i?"2px solid #475569":`2px solid ${c.border}`,cursor:"pointer",flexShrink:0}}/>
              ))}
              <div style={{flex:1}}/>
              <select value={form.font} onChange={e=>setForm(f=>({...f,font:e.target.value}))}
                style={{fontSize:11,border:"1px solid #ddd",borderRadius:6,padding:"2px 6px",background:"white",cursor:"pointer",fontFamily:ff(form.font)}}>
                {FONTS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#9b948a",marginLeft:4}}><MdClose size={17}/></button>
            </div>
            <div style={{padding:"2px 14px 4px",fontSize:11,color:"#9b948a"}}>{year}/{month+1}/{modal.day}</div>
            <div style={{padding:"0 14px"}}>
              <textarea autoFocus placeholder={lang==="mn"?"Тэмдэглэл бичих...":"Write something..."}
                value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} rows={4}
                style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:17,
                  fontFamily:ff(form.font),color:sc(form.color).text,resize:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
            </div>
            <div style={{padding:"4px 14px 10px"}}>
              <button onClick={()=>setStickerOpen(p=>!p)}
                style={{fontSize:11,border:"1px solid #e0e0e0",borderRadius:8,padding:"3px 10px",background:"white",cursor:"pointer",color:"#6b6358",marginBottom:stickerOpen?8:0}}>
                Sticker
              </button>
              {stickerOpen&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {STICKERS.map(st=>(
                    <button key={st.id} onClick={()=>toggleS(st.id)} title={st.label}
                      style={{width:38,height:38,borderRadius:8,
                        border:form.stickers.includes(st.id)?`2px solid ${theme.accent}`:"1px solid #e0e0e0",
                        background:"white",cursor:"pointer",padding:3,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{width:28,height:28,display:"block"}} dangerouslySetInnerHTML={{__html:st.svg}}/>
                    </button>
                  ))}
                </div>
              )}
              {form.stickers.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                  {form.stickers.map(sid=>{
                    const st=STICKERS.find(s=>s.id===sid);
                    if(!st) return null;
                    return <span key={sid} style={{width:28,height:28,display:"inline-block"}} dangerouslySetInnerHTML={{__html:st.svg}}/>;
                  })}
                </div>
              )}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px 14px"}}>
              {modal.idx!==undefined
                ?<button onClick={del} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#9b948a"}}><MdDelete size={13}/>{lang==="mn"?"Устгах":"Delete"}</button>
                :<div/>}
              <button onClick={save} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 16px",borderRadius:10,border:"none",background:theme.accent,color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                <MdSave size={13}/>{lang==="mn"?"Хадгалах":"Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
