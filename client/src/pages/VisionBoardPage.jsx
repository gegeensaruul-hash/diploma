import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

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
const VB_STICKERS = ["🌟","💪","✨","🎯","🌸","💫","🔥","🌈","💎","🦋","🌺","⭐","🏆","💡","🌙","❤️","🎀","🍀","🌻","🦄","🎵","☁️","🌊","🍓","🫐","🐝","🌷","🧸","🎪","🎨","🦊","🐱","🌍","🍭","🎸","🏄"];

function getStore(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch{return d;}}
function setStore(k,v){localStorage.setItem(k,JSON.stringify(v));}

export default function VisionBoardPage() {
  const { lang, theme } = useSettings();
  const { id } = useParams();
  const storageKey = `vb3_items_${id}`;
  const [items, setItems] = useState(() => getStore(storageKey, []));
  const [selected, setSelected] = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const boardRef = useRef(null);
  const dragRef  = useRef(null);

  // id өөрчлөгдөх бүрт тухайн board-н өгөгдлийг ачаална
  useEffect(() => {
    setItems(getStore(`vb3_items_${id}`, []));
    setSelected(null);
    setEditingId(null);
    setShowStickerPicker(false);
  }, [id]);

  const saveItems = (it) => { setItems(it); setStore(storageKey, it); };
  const upd = (itemId, patch) => {
    setItems(prev => {
      const next = prev.map(i => i.id===itemId ? {...i,...patch} : i);
      setStore(storageKey, next);
      return next;
    });
  };
  const del = (itemId) => { saveItems(items.filter(i=>i.id!==itemId)); if(selected===itemId) setSelected(null); };
  const selItem = items.find(i=>i.id===selected);
  const rnd = (max,min=0) => Math.floor(Math.random()*(max-min))+min;

  const addNote = () => {
    const newId = Date.now();
    const rect = boardRef.current?.getBoundingClientRect();
    const bw = rect?.width || 900, bh = rect?.height || 600;
    saveItems([...items, {
      id: newId, type:"note", x:rnd(bw-160,40), y:rnd(bh-120,40),
      w:150, text:"", font:"caveat", color: rnd(NOTE_COLORS.length),
      pin: rnd(PIN_COLORS.length), rot: (rnd(21)-10)*0.5,
    }]);
    setSelected(newId); setEditingId(newId);
  };

  const addSticker = (emoji) => {
    const newId = Date.now();
    const rect2 = boardRef.current?.getBoundingClientRect();
    const bw2 = rect2?.width || 900, bh2 = rect2?.height || 600;
    saveItems([...items, {
      id: newId, type:"sticker", x:rnd(bw2-80,40), y:rnd(bh2-80,40),
      emoji, size:48, rot: (rnd(21)-10)*0.5,
    }]);
    setSelected(newId); setShowStickerPicker(false);
  };

  const addImage = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const newId = Date.now();
      const rect3 = boardRef.current?.getBoundingClientRect();
      const bw3 = rect3?.width || 900, bh3 = rect3?.height || 600;
      saveItems([...items, {
        id: newId, type:"image", x:rnd(bw3-180,40), y:rnd(bh3-140,40),
        w:170, h:130, src:ev.target.result, rot:(rnd(11)-5)*0.5,
        border:true, pin:rnd(PIN_COLORS.length),
      }]);
      setSelected(newId);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onMouseDown = (e, itemId) => {
    e.stopPropagation();
    if (editingId === itemId) return;
    setSelected(itemId);
    const item = items.find(i=>i.id===itemId);
    const rect = boardRef.current.getBoundingClientRect();
    dragRef.current = { mode:"drag", id: itemId, ox: e.clientX - rect.left - item.x, oy: e.clientY - rect.top - item.y };
    e.preventDefault();
  };

  const onResizeMouseDown = (e, itemId) => {
    e.stopPropagation();
    e.preventDefault();
    setSelected(itemId);
    const item = items.find(i=>i.id===itemId);
    dragRef.current = { mode:"resize", id: itemId, startX: e.clientX, startY: e.clientY, startW: item.w||170, startH: item.h||130 };
  };

  const onDoubleClick = (e, itemId) => {
    e.stopPropagation();
    setSelected(itemId);
    setEditingId(itemId);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    if (editingId !== null) { dragRef.current = null; return; }
    const rect = boardRef.current.getBoundingClientRect();
    if (dragRef.current.mode === "resize") {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      upd(dragRef.current.id, {
        w: Math.max(80, dragRef.current.startW + dx),
        h: Math.max(60, dragRef.current.startH + dy),
      });
    } else {
      upd(dragRef.current.id, {
        x: Math.max(0, Math.min(rect.width-30,  e.clientX - rect.left - dragRef.current.ox)),
        y: Math.max(0, Math.min(rect.height-20, e.clientY - rect.top  - dragRef.current.oy)),
      });
    }
  };
  const onMouseUp = () => { dragRef.current = null; };

  const onTouchStart = (e, itemId) => {
    setSelected(itemId);
    const item = items.find(i=>i.id===itemId);
    const rect = boardRef.current.getBoundingClientRect();
    const t = e.touches[0];
    dragRef.current = { id: itemId, ox: t.clientX - rect.left - item.x, oy: t.clientY - rect.top - item.y };
  };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const t = e.touches[0];
    upd(dragRef.current.id, {
      x: Math.max(0, Math.min(rect.width-30,  t.clientX - rect.left - dragRef.current.ox)),
      y: Math.max(0, Math.min(rect.height-20, t.clientY - rect.top  - dragRef.current.oy)),
    });
    e.preventDefault();
  };
  const onTouchEnd = () => { dragRef.current = null; };

  const clearAll = () => { saveItems([]); setSelected(null); setEditingId(null); };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",gap:10,fontFamily:"DM Sans"}}>
      <style>{`
        @`}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flexShrink:0}}>
        <h2 style={{fontSize:22,fontWeight:700,color:"#3d3830",margin:0,fontFamily:"DM Sans"}}>
          🎯 Vision Board
        </h2>
        <div style={{flex:1}}/>

        {/* Toolbar buttons */}
        <button onClick={addNote} title={lang==="mn"?"Карт нэмэх":"Add note"}
          style={{fontSize:12,background:"#fffde7",border:"1px solid #fcd34d",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#78350f",fontWeight:700,boxShadow:"1px 2px 4px rgba(0,0,0,0.1)"}}>
          📝 {lang==="mn"?"Карт":"Note"}
        </button>

        <div style={{position:"relative"}}>
          <button onClick={()=>setShowStickerPicker(v=>!v)}
            style={{fontSize:12,background:"#fce4ec",border:"1px solid #f9a8d4",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#9d174d",fontWeight:700,boxShadow:"1px 2px 4px rgba(0,0,0,0.1)"}}>
            🎀 Sticker
          </button>
          {showStickerPicker && (
            <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:200,
              background:"white",borderRadius:12,boxShadow:"0 10px 30px rgba(0,0,0,0.18)",
              border:"1px solid #e2e8f0",padding:10,width:260,display:"flex",flexWrap:"wrap",gap:4}}>
              {VB_STICKERS.map(s=>(
                <button key={s} onClick={()=>addSticker(s)}
                  style={{fontSize:24,background:"none",border:"none",cursor:"pointer",padding:"4px 5px",borderRadius:6,transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <label style={{fontSize:12,background:"#e0f2fe",border:"1px solid #7dd3fc",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#075985",fontWeight:700,boxShadow:"1px 2px 4px rgba(0,0,0,0.1)"}}>
          🖼 {lang==="mn"?"Зураг":"Image"}
          <input type="file" accept="image/*" style={{display:"none"}} onChange={addImage}/>
        </label>

        {selItem?.type==="note" && (
          <select value={selItem.font} onChange={e=>upd(selected,{font:e.target.value})}
            style={{fontSize:12,border:"1px solid #e2e8f0",borderRadius:8,padding:"5px 8px",background:"white",cursor:"pointer",fontFamily:VB_FONTS.find(f=>f.id===selItem.font)?.css}}>
            {VB_FONTS.map(f=><option key={f.id} value={f.id} style={{fontFamily:f.css}}>{f.label}</option>)}
          </select>
        )}

        {selected && (
          <button onClick={()=>del(selected)}
            style={{fontSize:12,background:"#fde2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"#991b1b",fontWeight:700}}>
            🗑
          </button>
        )}

        {items.length > 0 && (
          <button onClick={clearAll}
            style={{fontSize:12,background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"#64748b",fontWeight:600}}>
            {lang==="mn"?"Цэвэрлэх":"Clear all"}
          </button>
        )}
      </div>

      {/* Cork Board — full remaining height */}
      <div
        ref={boardRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e)=>{
          if (editingId !== null) return; // editing горимд board click-г үл тоох
          setSelected(null);setShowStickerPicker(false);
        }}
        style={{
          flex:1, position:"relative", overflow:"hidden",
          borderRadius:14, border:"10px solid #a07850",
          backgroundColor:"#c8a97e",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.8 0.6 0.3 0 0.1 0.6 0.45 0.2 0 0.05 0.3 0.25 0.1 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          boxShadow:"inset 0 0 60px rgba(80,40,5,0.3), 0 6px 24px rgba(0,0,0,0.25)",
          cursor:"default", userSelect:"none", minHeight:400,
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
                fontSize:item.size||48, lineHeight:1,
                transform:`rotate(${item.rot||0}deg)`,
                cursor:"grab", zIndex:isSel?20:5,
                filter:isSel?"drop-shadow(0 0 8px rgba(99,102,241,0.9))":"drop-shadow(1px 3px 4px rgba(0,0,0,0.35))",
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
                boxShadow:isSel?"0 0 0 3px #6366f1, 4px 6px 16px rgba(0,0,0,0.35)":"4px 6px 16px rgba(0,0,0,0.35)",
                borderRadius:4, border:item.border?"5px solid white":"none",
              }}>
              <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",
                width:16,height:16,borderRadius:"50%",background:PIN_COLORS[item.pin%PIN_COLORS.length],
                boxShadow:"0 2px 6px rgba(0,0,0,0.45)",border:"2px solid rgba(255,255,255,0.7)",zIndex:2}}/>
              <img src={item.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:1,display:"block"}}/>
              {/* Resize handle — баруун доод булан */}
              {isSel && (
                <div
                  onMouseDown={e=>onResizeMouseDown(e,item.id)}
                  style={{
                    position:"absolute", right:-6, bottom:-6,
                    width:16, height:16, borderRadius:"50%",
                    background:"#6366f1", border:"2px solid white",
                    cursor:"nwse-resize", zIndex:30,
                    boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
                  }}
                />
              )}
            </div>
          );

          if (item.type==="note") {
            const fontCss = VB_FONTS.find(f=>f.id===item.font)?.css||VB_FONTS[0].css;
            return (
              <div key={item.id}
                onMouseDown={e=>onMouseDown(e,item.id)}
                onDoubleClick={e=>onDoubleClick(e,item.id)}
                onTouchStart={e=>onTouchStart(e,item.id)}
                style={{
                  position:"absolute", left:item.x, top:item.y,
                  width:item.w||150, minHeight:90,
                  background:NOTE_COLORS[item.color%NOTE_COLORS.length],
                  transform:`rotate(${item.rot||0}deg)`,
                  cursor:editingId===item.id?"text":"grab", zIndex:isSel?20:5,
                  boxShadow:isSel?"0 0 0 3px #6366f1, 4px 6px 18px rgba(0,0,0,0.28)":"3px 5px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.7)",
                  borderRadius:4, padding:"18px 12px 12px",
                  transition:"box-shadow .12s",
                }}>
                <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",
                  width:16,height:16,borderRadius:"50%",background:PIN_COLORS[item.pin%PIN_COLORS.length],
                  boxShadow:"0 2px 6px rgba(0,0,0,0.45)",border:"2px solid rgba(255,255,255,0.7)",zIndex:2}}/>
                {editingId===item.id ? (
                  <textarea autoFocus
                    value={item.text}
                    onChange={e=>{e.stopPropagation();upd(item.id,{text:e.target.value});}}
                    onClick={e=>e.stopPropagation()}
                    onMouseDown={e=>{e.stopPropagation(); dragRef.current=null;}}
                    onDoubleClick={e=>e.stopPropagation()}
                    onBlur={()=>setTimeout(()=>setEditingId(null),200)}
                    style={{width:"100%",minHeight:70,resize:"both",border:"none",outline:"none",
                      background:"transparent",fontSize:15,fontFamily:fontCss,
                      color:"#2d1a05",lineHeight:1.5,boxSizing:"border-box"}}/>
                ) : (
                  <div style={{fontSize:15,fontFamily:fontCss,color:"#2d1a05",
                    lineHeight:1.5,wordBreak:"break-word",minHeight:60,whiteSpace:"pre-wrap"}}>
                    {item.text || <span style={{opacity:0.3,fontSize:12,fontStyle:"italic"}}>
                      {lang==="mn"?"2x дарж бичих...":"Dbl-click to edit..."}
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
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            color:"rgba(92,58,30,0.45)",fontSize:16,fontFamily:"DM Sans",textAlign:"center",pointerEvents:"none",gap:8}}>
            <span style={{fontSize:48}}>🎯</span>
            <span>{lang==="mn"?"Карт, sticker, зураг нэмж эхлэх":"Add notes, stickers & images to get started"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
