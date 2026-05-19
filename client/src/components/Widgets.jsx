import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import { getUserStore, setUserStore } from "../utils/userStorage";
import { MdAdd, MdClose, MdCheck, MdDelete, MdChevronRight, MdExpandMore, MdSave } from "react-icons/md";

/* ─── storage ─── */
function getWidgets() {
  return getUserStore("app_widgets_v1", []);
}
function saveWidgets(w) { setUserStore("app_widgets_v1", w); }

/* ─── constants ─── */
const WIDGET_TYPES = [
  { id:"finance", icon:"💰", label:"Finance",    color:"#22c55e", bg:"rgba(34, 197, 94, 0.1)", border:"rgba(34, 197, 94, 0.2)", desc:"Income & Expense" },
  { id:"timer",   icon:"⏱",  label:"Timer",      color:"#f59e0b", bg:"rgba(245, 158, 11, 0.1)", border:"rgba(245, 158, 11, 0.2)", desc:"Stopwatch / CD" },
  { id:"habit",   icon:"🎯",  label:"Habit",      color:"#8b5cf6", bg:"rgba(139, 92, 246, 0.1)", border:"rgba(139, 92, 246, 0.2)", desc:"Daily streaks" },
  { id:"note",    icon:"📌",  label:"Quick Note", color:"#ec4899", bg:"rgba(236, 72, 153, 0.1)", border:"rgba(236, 72, 153, 0.2)", desc:"Sticky note" },
  { id:"custom",  icon:"✨",  label:"Custom",     color:"#64748b", bg:"rgba(100, 116, 139, 0.1)", border:"rgba(100, 116, 139, 0.2)", desc:"Custom list" },
];
const CUSTOM_ICONS = ["✨","🚀","🎨","🏆","📊","🌈","💡","🔥","🎵","🌟","💎","🦋","🎲","⚡","🍀","🧩"];
const COLORS = ["#6366f1","#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#64748b","#1e293b"];

/* ════════ FINANCE ════════ */
function FinanceWidget({ widget, onUpdate }) {
  const [entries, setEntries] = useState(widget.data?.entries || []);
  const [form, setForm] = useState({ label:"", amount:"", type:"income" });
  const [show, setShow] = useState(false);

  const income  = entries.filter(e=>e.type==="income").reduce((s,e)=>s+Number(e.amount),0);
  const expense = entries.filter(e=>e.type==="expense").reduce((s,e)=>s+Number(e.amount),0);
  const balance = income - expense;

  const addEntry = () => {
    if (!form.label.trim() || !form.amount) return;
    const next = [...entries, {...form, id:Date.now(), date:new Date().toLocaleDateString()}];
    setEntries(next); onUpdate({...widget, data:{entries:next}});
    setForm({label:"", amount:"", type:"income"}); setShow(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[{l:"In",v:income,c:"#22c55e"},{l:"Out",v:expense,c:"#ef4444"},{l:"Net",v:balance,c:balance>=0?"#6366f1":"#f59e0b"}].map(x=>(
          <div key={x.l} className="flex-1 bg-white/3 rounded-lg p-2 border border-white/5 text-center">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{x.l}</div>
            <div className="font-bold text-[11px]" style={{color:x.c}}>${x.v.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {entries.slice(-5).reverse().map(e=>(
          <div key={e.id} className={`flex items-center justify-between p-2 rounded-lg border border-white/5 ${e.type==="income"?"bg-green-500/5":"bg-red-500/5"}`}>
            <span className="text-[11px] text-slate-300 truncate flex-1">{e.label}</span>
            <span className={`text-[11px] font-bold ${e.type==="income"?"text-green-400":"text-red-400"}`}>
              {e.type==="income"?"+":"-"}${Number(e.amount).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {show ? (
        <div className="space-y-2 p-2 bg-white/2 rounded-xl border border-white/5">
          <input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="Entry name..." className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"/>
          <div className="flex gap-2">
            <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="Amount" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"/>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
              <option value="income">+ In</option><option value="expense">- Out</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShow(false)} className="flex-1 p-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
            <button onClick={addEntry} className="flex-1 p-2 rounded-lg bg-indigo-500 text-white text-[10px] font-bold shadow-lg shadow-indigo-500/20">Add</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShow(true)} className="w-full p-2 rounded-xl border-2 border-dashed border-white/10 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 text-[11px] font-bold transition-all">+ Add Entry</button>
      )}
    </div>
  );
}

/* ════════ TIMER ════════ */
function TimerWidget({ widget, onUpdate }) {
  const [secs, setSecs]     = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode]     = useState("stopwatch");
  const [cdMin, setCdMin]   = useState(widget.data?.cdMin || 25);
  const cdTotal = useRef(cdMin * 60);
  const ref = useRef(null);

  const fmt = s => {
    const m = Math.floor(s/60), sc = s%60;
    return `${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`;
  };

  const start = () => {
    if (running) return; setRunning(true);
    ref.current = setInterval(()=>setSecs(s=>{
      if (mode==="countdown") { if(s<=1){clearInterval(ref.current);setRunning(false);return 0;} return s-1; }
      return s+1;
    }),1000);
  };
  const pause = () => { clearInterval(ref.current); setRunning(false); };
  const reset = () => { clearInterval(ref.current); setRunning(false); setSecs(mode==="countdown"?cdTotal.current:0); };
  
  useEffect(()=>()=>clearInterval(ref.current),[]);

  return (
    <div className="text-center">
      <div className="flex bg-white/5 rounded-xl p-1 mb-4 gap-1">
        {["stopwatch","countdown"].map(m=>(
          <button key={m} onClick={()=>{pause();setMode(m);setSecs(m==="countdown"?cdTotal.current:0);}}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode===m?"bg-white/10 text-white shadow-lg":"text-slate-500"}`}>{m}</button>
        ))}
      </div>
      <div className="font-mono text-3xl font-black text-white tracking-widest mb-4 tabular-nums">
        {fmt(secs)}
      </div>
      <div className="flex gap-2 justify-center">
        {!running
          ? <button onClick={start} className="px-6 py-2 rounded-xl bg-indigo-500 text-white text-[11px] font-black shadow-lg shadow-indigo-500/30">START</button>
          : <button onClick={pause} className="px-6 py-2 rounded-xl bg-red-500 text-white text-[11px] font-black shadow-lg shadow-red-500/30">STOP</button>}
        <button onClick={reset} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5">↺</button>
      </div>
    </div>
  );
}

/* ════════ HABIT ════════ */
function HabitWidget({ widget, onUpdate }) {
  const [habits, setHabits] = useState(widget.data?.habits || []);
  const [newH, setNewH]     = useState("");
  const today = new Date().toDateString();
  
  const toggle=id=>{const n=habits.map(h=>h.id===id?{...h,lastDone:h.lastDone===today?"":today,streak:h.lastDone===today?Math.max(0,(h.streak||1)-1):(h.streak||0)+1}:h);setHabits(n);onUpdate({...widget,data:{habits:n}});};
  const add=()=>{if(!newH.trim())return;const n=[...habits,{id:Date.now(),name:newH.trim(),lastDone:"",streak:0}];setHabits(n);onUpdate({...widget,data:{habits:n}});setNewH("");};
  const rm=id=>{const n=habits.filter(h=>h.id!==id);setHabits(n);onUpdate({...widget,data:{habits:n}});};

  return (
    <div className="space-y-2">
      {habits.map(h=>(
        <div key={h.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/3 border border-white/5 group">
          <button onClick={()=>toggle(h.id)} className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${h.lastDone===today?"bg-indigo-500 border-indigo-500":"border-white/10 hover:border-indigo-500/50"}`}>
            {h.lastDone===today && <MdCheck size={12} color="white" />}
          </button>
          <span className={`flex-1 text-[12px] font-medium transition-all ${h.lastDone===today?"text-slate-500 line-through":"text-slate-200"}`}>{h.name}</span>
          <span className="text-[11px] text-orange-400 font-bold">🔥{h.streak||0}</span>
          <button onClick={()=>rm(h.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
            <MdDelete size={16} />
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-4 bg-white/3 p-1.5 rounded-xl border border-white/5">
        <input value={newH} onChange={e=>setNewH(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add habit..." className="flex-1 bg-transparent text-[12px] text-white px-2 outline-none"/>
        <button onClick={add} className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20"><MdAdd size={20}/></button>
      </div>
    </div>
  );
}

/* ════════ QUICK NOTE ════════ */
function QuickNoteWidget({ widget, onUpdate }) {
  const [text, setText] = useState(widget.data?.text || "");
  return (
    <div className="space-y-3">
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type something..." 
        className="w-full min-h-[100px] bg-white/3 border border-white/5 rounded-xl p-3 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50 resize-none custom-scrollbar"/>
      <button onClick={()=>onUpdate({...widget,data:{text}})} className="w-full py-2.5 rounded-xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
        <MdSave size={16} /> Save Note
      </button>
    </div>
  );
}

/* ════════ CUSTOM ════════ */
function CustomWidget({ widget, onUpdate }) {
  const [items, setItems] = useState(widget.data?.items || []);
  const [input, setInput] = useState("");
  const add=()=>{if(!input.trim())return;const n=[...items,{id:Date.now(),text:input.trim(),done:false}];setItems(n);onUpdate({...widget,data:{items:n}});setInput("");};
  const toggle=id=>{const n=items.map(x=>x.id===id?{...x,done:!x.done}:x);setItems(n);onUpdate({...widget,data:{items:n}});};
  const rm=id=>{const n=items.filter(x=>x.id!==id);setItems(n);onUpdate({...widget,data:{items:n}});};
  return (
    <div className="space-y-2">
      <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
        {items.map(item=>(
          <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/3 group transition-all">
            <button onClick={()=>toggle(item.id)} className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${item.done?`bg-indigo-500 border-indigo-500`:"border-white/10"}`}>
              {item.done && <MdCheck size={12} color="white" />}
            </button>
            <span className={`flex-1 text-[12px] transition-all ${item.done?"text-slate-500 line-through":"text-slate-300"}`}>{item.text}</span>
            <button onClick={()=>rm(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
              <MdDelete size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2 bg-white/3 p-1.5 rounded-xl border border-white/5">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add item..." className="flex-1 bg-transparent text-[12px] text-white px-2 outline-none"/>
        <button onClick={add} className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20"><MdAdd size={20}/></button>
      </div>
    </div>
  );
}

/* ════════ ADD WIDGET MODAL ════════ */
export function AddWidgetModal({ onAdd, onClose }) {
  const { theme } = useSettings();
  const [step, setStep]           = useState(1);
  const [pickedType, setPickedType] = useState(null);
  const [name, setName]           = useState("");
  const [icon, setIcon]           = useState("✨");
  const [color, setColor]         = useState("#6366f1");

  const pickType = typeId => {
    const type = WIDGET_TYPES.find(t=>t.id===typeId);
    if (!type) return;
    setPickedType(type); setName(type.label); setIcon(type.icon); setStep(2);
  };

  const confirm = () => {
    if (!name.trim() || !pickedType) return;
    onAdd({ id:Date.now(), type:pickedType.id, name:name.trim(), icon, color, open:true, data:{} });
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/80 backdrop-blur-md p-6 animate-in" onClick={onClose}>
      <div className="bg-[#0f172a] rounded-[32px] border border-white/10 shadow-2xl w-full max-w-sm p-8" onClick={e=>e.stopPropagation()}>
        {step === 1 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white tracking-tight">Add Widget</h3>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white transition-all"><MdClose size={24} /></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {WIDGET_TYPES.map(type => (
                <button key={type.id} onClick={() => pickType(type.id)}
                  className="flex items-center gap-4 p-4 rounded-[20px] bg-white/3 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left">
                  <span className="text-3xl">{type.icon}</span>
                  <div>
                    <p className="text-[15px] font-bold text-white mb-0.5">{type.label}</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <button onClick={()=>setStep(1)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><MdChevronRight size={24} style={{transform:"rotate(180deg)"}}/></button>
              <h3 className="text-xl font-bold text-white tracking-tight">Customize</h3>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
              <span className="text-3xl">{icon}</span>
              <span className="text-lg font-bold text-white">{name || "Unnamed"}</span>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Widget Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="My Widget"/>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Select Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {CUSTOM_ICONS.map(em => (
                  <button key={em} onClick={()=>setIcon(em)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${icon===em?"bg-indigo-500 text-white":"bg-white/5 text-slate-500 hover:bg-white/10"}`}>{em}</button>
                ))}
              </div>
            </div>
            <button onClick={confirm} className="w-full py-4 rounded-[20px] bg-indigo-500 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all">Launch Widget</button>
          </div>
        )}
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

/* ════════ WIDGET PANEL ════════ */
export function WidgetPanel() {
  const [widgets, setWidgets] = useState(getWidgets);
  useEffect(()=>saveWidgets(widgets),[widgets]);
  useEffect(()=>{
    const handler = () => setWidgets(getWidgets());
    window.addEventListener("widget-added", handler);
    return () => window.removeEventListener("widget-added", handler);
  },[]);

  const update = updated => setWidgets(p=>p.map(w=>w.id===updated.id?updated:w));
  const remove = id      => setWidgets(p=>p.filter(w=>w.id!==id));
  const toggle = id      => setWidgets(p=>p.map(w=>w.id===id?{...w,open:!w.open}:w));

  const renderBody = w => {
    switch(w.type) {
      case "finance": return <FinanceWidget   widget={w} onUpdate={update}/>;
      case "timer":   return <TimerWidget     widget={w} onUpdate={update}/>;
      case "habit":   return <HabitWidget     widget={w} onUpdate={update}/>;
      case "note":    return <QuickNoteWidget widget={w} onUpdate={update}/>;
      default:        return <CustomWidget    widget={w} onUpdate={update}/>;
    }
  };

  return (
    <div className="space-y-2">
      {widgets.map(w=>(
        <div key={w.id} className="mx-2 rounded-2xl overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none group" onClick={()=>toggle(w.id)}>
            <span className="text-lg">{w.icon}</span>
            <span className="flex-1 text-[12px] font-bold text-slate-200 truncate">{w.name}</span>
            <button onClick={e=>{e.stopPropagation();remove(w.id);}} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1">
              <MdClose size={16} />
            </button>
            <div className={`text-slate-600 transition-transform ${w.open?"rotate-180":""}`}><MdExpandMore size={18}/></div>
          </div>
          {w.open && (
            <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-in">
              {renderBody(w)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
