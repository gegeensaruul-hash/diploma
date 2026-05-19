import { useState, useEffect, useRef } from "react";
import { MdClose, MdSend, MdAdd, MdLock, MdLockOpen, MdDelete } from "react-icons/md";
import { getUserStore, setUserStore } from "../utils/userStorage";

const getStore = getUserStore;
const setStore = setUserStore;

const ENVELOPE_STYLES = [
  { bg:"#fce8ec", border:"#f48fb1", flap:"#e91e8c" },
  { bg:"#e8eaf6", border:"#9fa8da", flap:"#5c6bc0" },
  { bg:"#e8f5e9", border:"#a5d6a7", flap:"#4caf50" },
  { bg:"#fff8e1", border:"#ffe082", flap:"#ffc107" },
  { bg:"#e3f2fd", border:"#90caf9", flap:"#2196f3" },
  { bg:"#f3e5f5", border:"#ce93d8", flap:"#9c27b0" },
  { bg:"#fbe9e7", border:"#ffab91", flap:"#ff5722" },
  { bg:"#e0f2f1", border:"#80cbc4", flap:"#009688" },
];

function FloatingLetter({ capsule, onClick }) {
  const ref = useRef(null);
  const pos = useRef({ x: capsule.floatX, y: capsule.floatY, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4 });
  const animRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    const animate = () => {
      const p = pos.current;
      const pw = parent.offsetWidth - 140;
      const ph = parent.offsetHeight - 120;
      p.x += p.vx; p.y += p.vy;
      if (p.x <= 0 || p.x >= pw) { p.vx *= -1; p.x = Math.max(0, Math.min(p.x, pw)); }
      if (p.y <= 0 || p.y >= ph) { p.vy *= -1; p.y = Math.max(0, Math.min(p.y, ph)); }
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const isOpen = Date.now() >= capsule.openAt;
  const es = ENVELOPE_STYLES[capsule.colorIdx % ENVELOPE_STYLES.length];
  const W = 130, H = 86;
  const fmt10 = (ts) => { const d = new Date(ts); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

  return (
    <div ref={ref} onClick={onClick}
      style={{ position:"absolute", cursor:"pointer", zIndex:2, userSelect:"none", width:W, height:H+38 }}
      onMouseEnter={e=>e.currentTarget.querySelector(".env-body").style.filter="drop-shadow(0 8px 22px rgba(0,0,0,0.22))"}
      onMouseLeave={e=>e.currentTarget.querySelector(".env-body").style.filter="drop-shadow(0 3px 10px rgba(0,0,0,0.12))"}>
      <svg className="env-body" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{ filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.12))", transition:"filter .2s", display:"block" }}>
        <rect x="1" y="1" width={W-2} height={H-2} rx="5" fill={es.bg} stroke={es.border} strokeWidth="1.2"/>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=><rect key={"t"+i} x={i*12} y="1" width="6" height="5" fill={i%2===0?"#e53935":"#1565c0"} opacity="0.85"/>)}
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=><rect key={"b"+i} x={i*12} y={H-6} width="6" height="5" fill={i%2===0?"#1565c0":"#e53935"} opacity="0.85"/>)}
        {[0,1,2,3,4,5,6,7,8].map(i=><rect key={"l"+i} x="1" y={6+i*9} width="5" height="5" fill={i%2===0?"#e53935":"#1565c0"} opacity="0.85"/>)}
        {[0,1,2,3,4,5,6,7,8].map(i=><rect key={"r"+i} x={W-6} y={6+i*9} width="5" height="5" fill={i%2===0?"#1565c0":"#e53935"} opacity="0.85"/>)}
        {isOpen
          ? <path d={`M6 18 L${W/2} ${H*0.48} L${W-6} 18`} fill="none" stroke={es.border} strokeWidth="1.2"/>
          : <path d={`M6 6 L${W/2} ${H*0.48} L${W-6} 6 Z`} fill={es.flap} opacity="0.45"/>}
        <path d={`M6 ${H-6} L${W/2} ${H*0.52} L${W-6} ${H-6}`} fill="none" stroke={es.border} strokeWidth="1" opacity="0.4"/>
        <path d={`M6 6 L${W*0.38} ${H*0.5} L6 ${H-6}`} fill="none" stroke={es.border} strokeWidth="1" opacity="0.3"/>
        <path d={`M${W-6} 6 L${W*0.62} ${H*0.5} L${W-6} ${H-6}`} fill="none" stroke={es.border} strokeWidth="1" opacity="0.3"/>
        <rect x={W-34} y="12" width="24" height="28" rx="3" fill="white" stroke={es.border} strokeWidth="1"/>
        <rect x={W-33} y="13" width="22" height="26" rx="2" fill={es.bg} stroke={es.border} strokeWidth="0.5" strokeDasharray="2,1"/>
        <circle cx={W-22} cy="26" r="8" fill="white" opacity="0.7"/>
        <rect x="12" y={H*0.52} width="42" height="3" rx="1.5" fill={es.border} opacity="0.3"/>
        <rect x="12" y={H*0.52+7} width="34" height="3" rx="1.5" fill={es.border} opacity="0.3"/>
        <rect x="12" y={H*0.52+14} width="38" height="3" rx="1.5" fill={es.border} opacity="0.3"/>
        <circle cx={W-46} cy={H-16} r="4" fill={isOpen ? es.flap : es.border} opacity="0.75"/>
      </svg>
      <div style={{ marginTop:4, background:"rgba(255,255,255,0.88)", borderRadius:8, padding:"3px 8px", backdropFilter:"blur(4px)" }}>
        <div style={{ fontSize:11, fontWeight:600, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {capsule.title.length>15 ? capsule.title.slice(0,15)+"…" : capsule.title}
        </div>
        <div style={{ fontSize:10, color:"#94a3b8" }}>{fmt10(capsule.openAt)}</div>
      </div>
    </div>
  );
}

export default function FutureCapsulePage() {
  const [capsules, setCapsules] = useState(() => getStore("future_capsules_v2", []));
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [email, setEmail] = useState("");
  const [mood, setMood] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [sending, setSending] = useState(false);
  const boardRef = useRef(null);

  useEffect(() => { const t = setInterval(()=>setNow(Date.now()),30000); return ()=>clearInterval(t); }, []);

  const isOpen = (c) => now >= c.openAt;
  const daysLeft = (c) => { const d=c.openAt-now; if(d<=0)return null; return `${Math.ceil(d/86400000)} өдөр үлдсэн`; };
  const fmt = (ts) => { const d=new Date(ts); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

  const save = () => {
    if (!text.trim() || !openDate) return;
    const bw = boardRef.current?.offsetWidth || 800;
    const bh = boardRef.current?.offsetHeight || 500;
    const c = {
      uid: Date.now(), colorIdx: mood,
      title: title.trim() || "Миний захидал",
      text, mood:"", email,
      createdAt: Date.now(),
      openAt: new Date(openDate).getTime(),
      emailSent: false,
      floatX: 80 + Math.random()*(bw-280),
      floatY: 60 + Math.random()*(bh-160),
    };
    const updated = [c, ...capsules];
    setCapsules(updated); setStore("future_capsules_v2", updated);
    setText(""); setTitle(""); setOpenDate(""); setMood(0); setEmail("");
    setShowForm(false);
  };

  const del = (uid) => { const u=capsules.filter(c=>c.uid!==uid); setCapsules(u); setStore("future_capsules_v2",u); setSelected(null); };

  const sendEmail = async (capsule) => {
    if (!capsule.email) return;
    setSending(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";
      const res = await fetch(`${API_BASE}/capsule/send-email`, {
        method:"POST", credentials:"include",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ to:capsule.email, subject:`Future Capsule: ${capsule.title}`, title:capsule.title, text:capsule.text, mood:capsule.mood, createdAt:fmt(capsule.createdAt) }),
      });
      if (res.ok) {
        const u = capsules.map(c=>c.uid===capsule.uid?{...c,emailSent:true}:c);
        setCapsules(u); setStore("future_capsules_v2",u);
        setSelected(s=>s?{...s,emailSent:true}:s);
      }
    } catch(e){console.error(e);}
    setSending(false);
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate()+1);
  const inp = { width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none" };

  return (
    <div className="capsule-page" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 56px)", background:"linear-gradient(160deg,#f8fafc,#f4f7fb)", overflow:"hidden" }}>
      <style>{`
        .capsule-page button,.capsule-page input,.capsule-page textarea{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}
        .capsule-page button:hover{transform:translateY(-1px)}
        .capsule-page .env-body{transition:filter .25s ease,transform .25s ease}
      `}</style>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", flexShrink:0, background:"rgba(255,255,255,0.7)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.9)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:12,height:32,borderRadius:99,background:"linear-gradient(180deg,#7c3aed,#db2777)",display:"inline-block" }}/>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#1e293b" }}>Future Capsule</div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>{capsules.length} захидал · Ирээдүйн өөртөө</div>
          </div>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:50, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#7c3aed,#db2777)", color:"white", fontSize:13, fontWeight:600, boxShadow:"0 4px 14px rgba(124,58,237,0.3)" }}>
          <MdAdd size={17}/> Захидал бичих
        </button>
      </div>

      {/* Board */}
      <div ref={boardRef} style={{ flex:1, position:"relative", overflow:"hidden" }}>
        {capsules.length===0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, pointerEvents:"none" }}>
            <span style={{ width:54,height:54,borderRadius:18,background:"rgba(148,163,184,.16)",boxShadow:"inset 0 0 0 1px rgba(148,163,184,.22)" }}/>
            <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>Одоохондоо захидал байхгүй</p>
          </div>
        )}
        {capsules.map(c=>(
          <FloatingLetter key={c.uid} capsule={c} isOpen={isOpen} onClick={()=>setSelected(c)}/>
        ))}
      </div>

      {/* Write Form */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"white", borderRadius:24, padding:28, width:460, maxHeight:"88vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:17, fontWeight:700, color:"#1e293b", margin:0 }}>Захидал бичих</h2>
              <button onClick={()=>setShowForm(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><MdClose size={16} color="#64748b"/></button>
            </div>
            <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>ГАРЧИГ</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Захидлын гарчиг..." style={{...inp, marginBottom:12}} onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>НЭЭХ ОГНОО</label>
                <input type="date" value={openDate} min={minDate.toISOString().split("T")[0]} onChange={e=>setOpenDate(e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>GMAIL ХАЯГ</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com" style={inp} onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
              </div>
            </div>
            <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:8 }}>ДУГТУЙН ЗАГВАР</label>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              {ENVELOPE_STYLES.map((s,i)=>(
                <div key={i} onClick={()=>setMood(i)} style={{ cursor:"pointer", borderRadius:8, padding:3, border:`2.5px solid ${mood===i?"#7c3aed":"transparent"}` }}>
                  <svg width="50" height="36" viewBox="0 0 50 36">
                    <rect x="1" y="1" width="48" height="34" rx="4" fill={s.bg} stroke={s.border} strokeWidth="1.5"/>
                    <path d="M1 1 Q25 -2 49 1 L49 13 L25 22 L1 13 Z" fill={s.flap} opacity="0.6"/>
                    <path d="M1 35 L25 21 L49 35" fill="none" stroke={s.border} strokeWidth="1" opacity="0.5"/>
                  </svg>
                </div>
              ))}
            </div>
            <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>ЗАХИДЛЫН АГУУЛГА</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Өөртөө юу хэлмээр байна вэ?..." style={{...inp, resize:"vertical", fontFamily:"inherit", lineHeight:1.6, marginBottom:18}} onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowForm(false)} style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", color:"#64748b", fontSize:13, cursor:"pointer" }}>Болих</button>
              <button onClick={save} disabled={!text.trim()||!openDate} style={{ padding:"9px 22px", borderRadius:10, border:"none", background:text.trim()&&openDate?"linear-gradient(135deg,#7c3aed,#db2877)":"#e2e8f0", color:text.trim()&&openDate?"white":"#94a3b8", fontSize:13, fontWeight:600, cursor:text.trim()&&openDate?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:6 }}>
                <MdSend size={14}/> Хөлдөөх
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail popup */}
      {selected && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setSelected(null)}>
          <div style={{ background:"white", borderRadius:24, padding:28, width:400, boxShadow:"0 24px 80px rgba(0,0,0,0.22)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#db2877)" }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#1e293b" }}>{selected.title}</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>{fmt(selected.createdAt)} бичсэн</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><MdClose size={15} color="#64748b"/></button>
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, marginBottom:14, background:isOpen(selected)?"#ede9fe":"#f1f5f9", color:isOpen(selected)?"#7c3aed":"#64748b", fontSize:12, fontWeight:600 }}>
              {isOpen(selected)?<MdLockOpen size={12}/>:<MdLock size={12}/>}
              {isOpen(selected)?`${fmt(selected.openAt)} нээгдсэн`:`Нээгдэх: ${fmt(selected.openAt)}`}
            </div>
            {isOpen(selected)?(
              <>
                <div style={{ background:"#faf5ff", borderRadius:12, padding:14, marginBottom:16, fontSize:13, color:"#1e293b", lineHeight:1.8, whiteSpace:"pre-wrap", fontStyle:"italic" }}>{selected.text}</div>
                <div style={{ display:"flex", gap:8 }}>
                  {selected.email&&(
                    <button onClick={()=>sendEmail(selected)} disabled={sending||selected.emailSent} style={{ flex:1, padding:"9px", borderRadius:10, border:"none", cursor:"pointer", background:selected.emailSent?"#f0fdf4":"linear-gradient(135deg,#7c3aed,#db2877)", color:selected.emailSent?"#16a34a":"white", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      {selected.emailSent?"Илгээгдсэн":sending?"Илгээж байна...":"Gmail рүү илгээх"}
                    </button>
                  )}
                  <button onClick={()=>del(selected.uid)} style={{ padding:"9px 14px", borderRadius:10, border:"none", background:"#fff1f2", color:"#f43f5e", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:600 }}>
                    <MdDelete size={14}/> Устгах
                  </button>
                </div>
              </>
            ):(
              <div style={{ background:"#f8fafc", borderRadius:12, padding:20, textAlign:"center", color:"#94a3b8" }}>
                <div style={{ width:42,height:42,borderRadius:14,background:"#e2e8f0",margin:"0 auto 8px" }}/>
                <div style={{ fontSize:14, fontWeight:600, color:"#475569", marginBottom:4 }}>Ирээдүйн захиа (битүүмжилсэн)</div>
                <div style={{ fontSize:12, marginBottom:4 }}>Нээгдэх: {fmt(selected.openAt)}</div>
                <div style={{ fontSize:12, color:"#f59e0b" }}>Одоохондоо уншиж болохгүй</div>
                {daysLeft(selected)&&<div style={{ marginTop:8, fontSize:11 }}>{daysLeft(selected)}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
