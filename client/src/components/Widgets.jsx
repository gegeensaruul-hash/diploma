import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";

/* ─── storage ─── */
function getWidgets() {
  try { return JSON.parse(localStorage.getItem("app_widgets_v1") || "[]"); } catch { return []; }
}
function saveWidgets(w) { localStorage.setItem("app_widgets_v1", JSON.stringify(w)); }

/* ─── constants ─── */
const WIDGET_TYPES = [
  { id:"finance", icon:"💰", label:"Санхүү",    color:"#22c55e", bg:"#f0fdf4", border:"#bbf7d0", desc:"Орлого / зарлага" },
  { id:"timer",   icon:"⏱",  label:"Зогсоолт",  color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", desc:"Цаг хэмжигч" },
  { id:"files",   icon:"📁",  label:"Файл",      color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe", desc:"Файл хадгалах" },
  { id:"habit",   icon:"🎯",  label:"Зуршил",    color:"#8b5cf6", bg:"#f5f3ff", border:"#ddd6fe", desc:"Өдрийн зуршил" },
  { id:"note",    icon:"📌",  label:"Тэмдэглэл", color:"#ec4899", bg:"#fdf2f8", border:"#fbcfe8", desc:"Хурдан тэмдэглэл" },
  { id:"custom",  icon:"✨",  label:"Өөрийн",    color:"#64748b", bg:"#f8fafc", border:"#e2e8f0", desc:"Өөрөө тохируулах" },
];
const CUSTOM_ICONS = ["✨","🚀","🎨","🏆","📊","🌈","💡","🔥","🎵","🌟","💎","🦋","🎲","⚡","🍀","🧩"];
const COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#64748b","#1e293b","#f97316"];

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
    const next = [...entries, {...form, id:Date.now(), date:new Date().toLocaleDateString("mn-MN")}];
    setEntries(next); onUpdate({...widget, data:{entries:next}});
    setForm({label:"", amount:"", type:"income"}); setShow(false);
  };

  return (
    <div style={{fontSize:12}}>
      <div style={{display:"flex",gap:5,marginBottom:8}}>
        {[{l:"Орлого",v:income,c:"#22c55e"},{l:"Зарлага",v:expense,c:"#ef4444"},{l:"Үлдэгдэл",v:balance,c:balance>=0?"#3b82f6":"#f59e0b"}].map(x=>(
          <div key={x.l} style={{flex:1,background:"#f8fafc",borderRadius:7,padding:"5px",border:"1px solid #f1f5f9",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#94a3b8",marginBottom:1}}>{x.l}</div>
            <div style={{fontWeight:700,color:x.c,fontSize:12}}>{x.v.toLocaleString()}₮</div>
          </div>
        ))}
      </div>
      <div style={{maxHeight:100,overflowY:"auto",marginBottom:6}}>
        {entries.slice(-5).reverse().map(e=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 5px",borderRadius:5,marginBottom:2,background:e.type==="income"?"#f0fdf4":"#fef2f2"}}>
            <span style={{color:"#475569",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.label}</span>
            <span style={{fontWeight:600,color:e.type==="income"?"#22c55e":"#ef4444",flexShrink:0,marginLeft:4}}>{e.type==="income"?"+":"-"}{Number(e.amount).toLocaleString()}₮</span>
            <button type="button" onClick={()=>{const n=entries.filter(x=>x.id!==e.id);setEntries(n);onUpdate({...widget,data:{entries:n}});}} style={{background:"none",border:"none",cursor:"pointer",color:"#cbd5e1",fontSize:12,marginLeft:3,padding:0}}>×</button>
          </div>
        ))}
        {!entries.length && <p style={{color:"#cbd5e1",textAlign:"center",padding:"8px 0"}}>Бичлэг байхгүй</p>}
      </div>
      {show ? (
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="Нэр..." style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 7px",fontSize:11,outline:"none"}}/>
          <div style={{display:"flex",gap:4}}>
            <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="Дүн" style={{flex:1,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 7px",fontSize:11,outline:"none"}}/>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 5px",fontSize:11,outline:"none"}}>
              <option value="income">+ Орлого</option><option value="expense">- Зарлага</option>
            </select>
          </div>
          <div style={{display:"flex",gap:4}}>
            <button type="button" onClick={()=>setShow(false)} style={{flex:1,padding:"4px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#64748b"}}>Болих</button>
            <button type="button" onClick={addEntry} style={{flex:1,padding:"4px",borderRadius:6,border:"none",background:"#22c55e",color:"white",cursor:"pointer",fontSize:11,fontWeight:600}}>Нэмэх</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={()=>setShow(true)} style={{width:"100%",padding:"5px",borderRadius:7,border:"1.5px dashed #bbf7d0",background:"transparent",cursor:"pointer",fontSize:11,color:"#22c55e",fontWeight:600}}>+ Бичлэг нэмэх</button>
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
  const [laps, setLaps]     = useState(widget.data?.laps || []);
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
  const lap   = () => { const l=[...laps,{id:Date.now(),t:secs}]; setLaps(l); onUpdate({...widget,data:{laps:l}}); };
  useEffect(()=>()=>clearInterval(ref.current),[]);

  const pct = mode==="countdown" ? secs/cdTotal.current*100 : null;
  const r = 36, circ = 2*Math.PI*r;

  return (
    <div style={{fontSize:12,textAlign:"center"}}>
      <div style={{display:"flex",background:"#f1f5f9",borderRadius:7,padding:2,marginBottom:8,gap:2}}>
        {[["stopwatch","⏱ Stopwatch"],["countdown","⏳ Countdown"]].map(([m,l])=>(
          <button type="button" key={m} onClick={()=>{pause();setMode(m);setSecs(m==="countdown"?cdTotal.current:0);}}
            style={{flex:1,padding:"3px 0",borderRadius:5,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:mode===m?"white":"transparent",color:mode===m?"#1e293b":"#94a3b8",boxShadow:mode===m?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{l}</button>
        ))}
      </div>
      {mode==="countdown" && !running && secs===0 && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:8}}>
          <input type="number" min={1} max={180} value={cdMin} onChange={e=>{const v=+e.target.value;setCdMin(v);cdTotal.current=v*60;setSecs(v*60);}} style={{width:50,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px",fontSize:13,outline:"none",textAlign:"center"}}/>
          <span style={{fontSize:11,color:"#94a3b8"}}>минут</span>
        </div>
      )}
      {mode==="countdown" ? (
        <div style={{position:"relative",width:80,height:80,margin:"0 auto 8px"}}>
          <svg width={80} height={80} style={{transform:"rotate(-90deg)"}}>
            <circle cx={40} cy={40} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5}/>
            <circle cx={40} cy={40} r={r} fill="none" stroke="#f59e0b" strokeWidth={5}
              strokeDasharray={circ} strokeDashoffset={circ*(1-(pct||0)/100)} strokeLinecap="round"
              style={{transition:"stroke-dashoffset .9s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:"#1e293b"}}>{fmt(secs)}</span>
          </div>
        </div>
      ) : (
        <div style={{fontFamily:"monospace",fontSize:26,fontWeight:700,color:"#1e293b",letterSpacing:2,marginBottom:8}}>{fmt(secs)}</div>
      )}
      <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:6}}>
        {!running
          ? <button type="button" onClick={start} style={{padding:"5px 14px",borderRadius:7,border:"none",cursor:"pointer",background:"#f59e0b",color:"white",fontSize:11,fontWeight:700}}>▶ Эхлэх</button>
          : <button type="button" onClick={pause} style={{padding:"5px 14px",borderRadius:7,border:"none",cursor:"pointer",background:"#ef4444",color:"white",fontSize:11,fontWeight:700}}>⏸ Зогсоох</button>}
        <button type="button" onClick={reset} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #e2e8f0",cursor:"pointer",background:"white",fontSize:11,color:"#64748b"}}>↺</button>
        {mode==="stopwatch" && <button type="button" onClick={lap} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #e2e8f0",cursor:"pointer",background:"white",fontSize:11,color:"#64748b"}}>Lap</button>}
      </div>
      {laps.length>0 && (
        <div style={{maxHeight:60,overflowY:"auto"}}>
          {laps.slice(-4).map((l,i)=>(
            <div key={l.id} style={{display:"flex",justifyContent:"space-between",padding:"1px 4px",background:i%2===0?"#f8fafc":"white",borderRadius:4}}>
              <span style={{color:"#94a3b8"}}>Lap {i+1}</span>
              <span style={{fontFamily:"monospace",color:"#475569",fontWeight:600}}>{fmt(l.t)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════ FILES ════════ */
function FilesWidget({ widget, onUpdate }) {
  const [files, setFiles] = useState(widget.data?.files || []);
  const inputRef = useRef(null);
  const addFile = e => {
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>4*1024*1024){alert("4MB-с бага файл оруулна уу");return;}
    const rd=new FileReader();
    rd.onload=ev=>{
      const f={id:Date.now(),name:file.name,size:file.size,type:file.type,data:ev.target.result,date:new Date().toLocaleDateString("mn-MN")};
      const next=[...files,f]; setFiles(next); onUpdate({...widget,data:{files:next}});
    };
    rd.readAsDataURL(file); e.target.value="";
  };
  const rm=id=>{const n=files.filter(f=>f.id!==id);setFiles(n);onUpdate({...widget,data:{files:n}});};
  const fmtSize=b=>b>1024*1024?`${(b/1024/1024).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`;
  const fIcon=t=>t.startsWith("image/")?"🖼":t.includes("pdf")?"📄":t.includes("word")?"📝":t.includes("sheet")||t.includes("excel")?"📊":"📁";
  return (
    <div style={{fontSize:12}}>
      <div style={{maxHeight:130,overflowY:"auto",marginBottom:7}}>
        {!files.length && <p style={{color:"#cbd5e1",textAlign:"center",padding:"12px 0"}}>Файл байхгүй</p>}
        {files.map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px",borderRadius:6,marginBottom:3,background:"#f8fafc",border:"1px solid #f1f5f9"}}>
            <span style={{fontSize:14,flexShrink:0}}>{fIcon(f.type)}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",margin:0,fontSize:11}}>{f.name}</p>
              <p style={{color:"#94a3b8",margin:0,fontSize:9}}>{fmtSize(f.size)} · {f.date}</p>
            </div>
            <a href={f.data} download={f.name} onClick={e=>e.stopPropagation()} style={{color:"#3b82f6",textDecoration:"none",fontSize:13,flexShrink:0}}>⬇</a>
            <button type="button" onClick={()=>rm(f.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#cbd5e1",fontSize:13,padding:0}}>×</button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" style={{display:"none"}} onChange={addFile}/>
      <button type="button" onClick={()=>inputRef.current?.click()} style={{width:"100%",padding:"6px",borderRadius:7,border:"1.5px dashed #bfdbfe",background:"transparent",cursor:"pointer",fontSize:11,color:"#3b82f6",fontWeight:600}}>+ Файл нэмэх</button>
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
    <div style={{fontSize:12}}>
      {habits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <button type="button" onClick={()=>toggle(h.id)} style={{width:18,height:18,borderRadius:5,border:"none",cursor:"pointer",flexShrink:0,background:h.lastDone===today?"#8b5cf6":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:700}}>{h.lastDone===today?"✓":""}</button>
          <span style={{flex:1,color:h.lastDone===today?"#7c3aed":"#475569",textDecoration:h.lastDone===today?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</span>
          <span style={{fontSize:10,color:"#f59e0b",flexShrink:0}}>🔥{h.streak||0}</span>
          <button type="button" onClick={()=>rm(h.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#cbd5e1",fontSize:13,padding:0}}>×</button>
        </div>
      ))}
      {!habits.length && <p style={{color:"#cbd5e1",textAlign:"center",padding:"8px 0"}}>Зуршил нэмнэ үү</p>}
      <div style={{display:"flex",gap:4,marginTop:4}}>
        <input value={newH} onChange={e=>setNewH(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Шинэ зуршил..." style={{flex:1,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 7px",fontSize:11,outline:"none"}}/>
        <button type="button" onClick={add} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#8b5cf6",color:"white",cursor:"pointer",fontSize:11,fontWeight:600}}>+</button>
      </div>
    </div>
  );
}

/* ════════ QUICK NOTE ════════ */
function QuickNoteWidget({ widget, onUpdate }) {
  const [text, setText] = useState(widget.data?.text || "");
  return (
    <div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Хурдан тэмдэглэл..." style={{width:"100%",minHeight:80,border:"1px solid #fbcfe8",borderRadius:7,padding:"7px",fontSize:12,outline:"none",resize:"vertical",background:"#fdf2f8",color:"#1e293b",fontFamily:"inherit",boxSizing:"border-box",lineHeight:1.6}}/>
      <button type="button" onClick={()=>onUpdate({...widget,data:{text}})} style={{width:"100%",marginTop:4,padding:"5px",borderRadius:6,border:"none",background:"#ec4899",color:"white",cursor:"pointer",fontSize:11,fontWeight:600}}>💾 Хадгалах</button>
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
    <div style={{fontSize:12}}>
      <div style={{maxHeight:110,overflowY:"auto",marginBottom:6}}>
        {items.map(item=>(
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
            <button type="button" onClick={()=>toggle(item.id)} style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${widget.color||"#64748b"}`,background:item.done?(widget.color||"#64748b"):"white",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"white",fontWeight:900}}>{item.done?"✓":""}</button>
            <span style={{flex:1,color:item.done?"#94a3b8":"#475569",textDecoration:item.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.text}</span>
            <button type="button" onClick={()=>rm(item.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#cbd5e1",fontSize:13,padding:0}}>×</button>
          </div>
        ))}
        {!items.length && <p style={{color:"#cbd5e1",textAlign:"center",padding:"6px 0"}}>Хоосон</p>}
      </div>
      <div style={{display:"flex",gap:4}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Нэмэх..." style={{flex:1,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 7px",fontSize:11,outline:"none"}}/>
        <button type="button" onClick={add} style={{padding:"4px 9px",borderRadius:6,border:"none",cursor:"pointer",background:widget.color||"#64748b",color:"white",fontSize:11,fontWeight:600}}>+</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   ADD WIDGET MODAL — Portal-оор render
════════════════════════════════════════ */
export function AddWidgetModal({ onAdd, onClose }) {
  const { theme } = useSettings();
  const [step, setStep]           = useState(1);
  const [pickedType, setPickedType] = useState(null);
  const [name, setName]           = useState("");
  const [icon, setIcon]           = useState("✨");
  const [color, setColor]         = useState("#64748b");

  const pickType = e => {
    e.preventDefault(); e.stopPropagation();
    const typeId = e.currentTarget.dataset.typeid;
    const type   = WIDGET_TYPES.find(t=>t.id===typeId);
    if (!type) return;
    setPickedType(type); setName(type.label); setIcon(type.icon); setStep(2);
  };

  const confirm = e => {
    e.preventDefault(); e.stopPropagation();
    if (!name.trim() || !pickedType) return;
    onAdd({ id:Date.now(), type:pickedType.id, name:name.trim(), icon, color, open:true, data:{} });
  };

  const stopProp = e => e.stopPropagation();

  const modal = (
    <div
      style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}
      onClick={onClose}
    >
      <div onClick={stopProp} style={{background:"white",borderRadius:20,padding:26,width:350,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",maxHeight:"90vh",overflowY:"auto"}}>

        {step === 1 && (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <h3 style={{fontSize:17,fontWeight:800,color:"#1e293b",margin:0}}>Widget нэмэх</h3>
              <button type="button" onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#94a3b8",lineHeight:1,padding:0}}>×</button>
            </div>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Нэмэхийг хүсэж буй widget-ээ сонгоно уу</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {WIDGET_TYPES.map(type => (
                <button type="button" key={type.id} data-typeid={type.id} onClick={pickType}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"12px 13px",borderRadius:13,border:`1.5px solid ${type.border}`,background:type.bg,cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{type.icon}</span>
                  <div>
                    <p style={{fontWeight:700,fontSize:13,color:"#1e293b",margin:0}}>{type.label}</p>
                    <p style={{fontSize:10,color:"#94a3b8",margin:0}}>{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && pickedType && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
              <button type="button" onClick={e=>{e.preventDefault();e.stopPropagation();setStep(1);}}
                style={{background:"#f1f5f9",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,color:"#64748b",fontWeight:600}}>← Буцах</button>
              <h3 style={{fontSize:16,fontWeight:800,color:"#1e293b",margin:0,flex:1}}>Тохируулах</h3>
              <button type="button" onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#94a3b8",padding:0}}>×</button>
            </div>

            {/* preview */}
            <div style={{display:"flex",alignItems:"center",gap:10,background:pickedType.bg,borderRadius:11,padding:"10px 13px",marginBottom:18,border:`1.5px solid ${pickedType.border}`}}>
              <span style={{fontSize:22}}>{icon}</span>
              <span style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{name || "Widget нэр"}</span>
            </div>

            {/* icon */}
            <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:7,letterSpacing:1,textTransform:"uppercase"}}>Icon</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {CUSTOM_ICONS.map(em => (
                <button type="button" key={em} onClick={e=>{e.preventDefault();e.stopPropagation();setIcon(em);}}
                  style={{width:30,height:30,borderRadius:7,fontSize:16,border:`2px solid ${icon===em?theme.accent:"transparent"}`,cursor:"pointer",background:icon===em?"#ede9fe":"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {em}
                </button>
              ))}
            </div>

            {/* name */}
            <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:7,letterSpacing:1,textTransform:"uppercase"}}>Нэр</p>
            <input value={name} onChange={e=>setName(e.target.value)}
              placeholder="Widget нэр..."
              style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"9px 11px",fontSize:14,outline:"none",color:"#1e293b",marginBottom:14,boxSizing:"border-box"}}/>

            {/* color */}
            <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:7,letterSpacing:1,textTransform:"uppercase"}}>Өнгө</p>
            <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap"}}>
              {COLORS.map(c => (
                <button type="button" key={c} onClick={e=>{e.preventDefault();e.stopPropagation();setColor(c);}}
                  style={{width:26,height:26,borderRadius:"50%",background:c,border:"none",cursor:"pointer",outline:color===c?`3px solid ${c}`:"none",outlineOffset:2,boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              ))}
            </div>

            <button type="button" onClick={confirm}
              style={{width:"100%",padding:"11px",borderRadius:11,border:"none",background:`linear-gradient(135deg,${theme.accent},#4f46e5)`,color:"white",cursor:"pointer",fontSize:14,fontWeight:700,boxShadow:`0 4px 14px ${theme.accent}44`}}>
              ✓ Нэмэх
            </button>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ════════════════════════════════════════
   WIDGET PANEL
════════════════════════════════════════ */
export function WidgetPanel() {
  const [widgets, setWidgets] = useState(getWidgets);

  useEffect(()=>saveWidgets(widgets),[widgets]);

  // Sidebar-аас widget нэмэгдэхэд сонсох
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
      case "files":   return <FilesWidget     widget={w} onUpdate={update}/>;
      case "habit":   return <HabitWidget     widget={w} onUpdate={update}/>;
      case "note":    return <QuickNoteWidget widget={w} onUpdate={update}/>;
      default:        return <CustomWidget    widget={w} onUpdate={update}/>;
    }
  };

  return (
    <>
      {widgets.map(w=>(
        <div key={w.id} style={{margin:"5px 8px",borderRadius:11,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.05)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",cursor:"pointer",userSelect:"none"}} onClick={()=>toggle(w.id)}>
            <span style={{fontSize:13,flexShrink:0}}>{w.icon}</span>
            <span style={{flex:1,fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</span>
            <button type="button" onClick={e=>{e.stopPropagation();remove(w.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.25)",fontSize:14,padding:0,lineHeight:1,flexShrink:0}}>×</button>
            <span style={{color:"rgba(255,255,255,0.3)",fontSize:10,flexShrink:0}}>{w.open?"▲":"▼"}</span>
          </div>
          {w.open && (
            <div style={{padding:"4px 9px 9px",background:"white",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
              {renderBody(w)}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
