import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { getUserStore, setUserStore } from "../utils/userStorage";
import { MdAdd, MdImage, MdStickyNote2, MdDelete, MdCleaningServices, MdPushPin, MdClose } from "react-icons/md";

const VB_FONTS = [
  {id:"caveat",    label:"Caveat",       css:"'Caveat', cursive"},
  {id:"pacifico",  label:"Pacifico",     css:"'Pacifico', cursive"},
  {id:"indie",     label:"Indie Flower", css:"'Indie Flower', cursive"},
  {id:"satisfy",   label:"Satisfy",      css:"'Satisfy', cursive"},
  {id:"nunito",    label:"Nunito",       css:"'Nunito', sans-serif"},
  {id:"quicksand", label:"Quicksand",    css:"'Quicksand', sans-serif"},
];
const NOTE_COLORS = ["#fffde7","#fce4ec","#e8eaf6","#e0f7fa","#f3e5f5","#e8f5e9","#fff3e0","#e3f2fd","#fafafa","#fff8e1"];
const PIN_COLORS  = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#f97316","#06b6d4","#ec4899"];
const VB_STICKERS = ["FOCUS","GROW","WIN","PLAN","MOVE","BUILD","SAVE","LEARN","HEALTH","IDEA","CALM","NEXT"];

const getStore = getUserStore;
const setStore = setUserStore;

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
    const bw = rect?.width || 1200, bh = rect?.height || 800;
    saveItems([...items, {
      id: newId, type:"note", x:rnd(bw-200,100), y:rnd(bh-200,100),
      w:180, h:120, text:"", font:"caveat", color: rnd(NOTE_COLORS.length),
      pin: rnd(PIN_COLORS.length), rot: (rnd(21)-10)*0.5,
    }]);
    setSelected(newId);
    // Use timeout to ensure state updates before setting focus
    setTimeout(() => setEditingId(newId), 50);
  };

  const addSticker = (emoji) => {
    const newId = Date.now();
    const rect2 = boardRef.current?.getBoundingClientRect();
    const bw2 = rect2?.width || 1200, bh2 = rect2?.height || 800;
    saveItems([...items, {
      id: newId, type:"sticker", x:rnd(bw2-100,100), y:rnd(bh2-100,100),
      emoji, size:54, rot: (rnd(21)-10)*0.5,
    }]);
    setSelected(newId); setShowStickerPicker(false);
  };

  const addImage = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const newId = Date.now();
      const rect3 = boardRef.current?.getBoundingClientRect();
      const bw3 = rect3?.width || 1200, bh3 = rect3?.height || 800;
      saveItems([...items, {
        id: newId, type:"image", x:rnd(bw3-250,100), y:rnd(bh3-200,100),
        w:220, h:160, src:ev.target.result, rot:(rnd(11)-5)*0.5,
        border:true, pin:rnd(PIN_COLORS.length),
      }]);
      setSelected(newId);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onItemMouseDown = (e, itemId) => {
    // If we're clicking a button or textarea, don't start dragging
    if (e.target.closest('button') || e.target.tagName === 'TEXTAREA' || e.target.closest('.resize-handle')) {
      return;
    }
    
    e.stopPropagation();
    setSelected(itemId);
    const item = items.find(i=>i.id===itemId);
    const rect = boardRef.current.getBoundingClientRect();
    dragRef.current = { 
      mode:"drag", 
      id: itemId, 
      ox: e.clientX - rect.left - item.x, 
      oy: e.clientY - rect.top - item.y,
      moved: false 
    };
  };

  const onResizeMouseDown = (e, itemId) => {
    e.stopPropagation();
    e.preventDefault();
    setSelected(itemId);
    const item = items.find(i=>i.id===itemId);
    dragRef.current = { mode:"resize", id: itemId, startX: e.clientX, startY: e.clientY, startW: item.w||170, startH: item.h||130 };
  };

  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    if (editingId !== null && dragRef.current.mode !== "resize") return;
    
    const rect = boardRef.current.getBoundingClientRect();
    if (dragRef.current.mode === "resize") {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      upd(dragRef.current.id, {
        w: Math.max(100, dragRef.current.startW + dx),
        h: Math.max(80, dragRef.current.startH + dy),
      });
    } else {
      dragRef.current.moved = true;
      upd(dragRef.current.id, {
        x: e.clientX - rect.left - dragRef.current.ox,
        y: e.clientY - rect.top  - dragRef.current.oy,
      });
    }
  };

  const onMouseUp = () => { dragRef.current = null; };

  const clearAll = () => { if(confirm("Clear everything?")) { saveItems([]); setSelected(null); setEditingId(null); } };

  // Keyboard support for deletion
  useEffect(() => {
    const handleKey = (e) => {
      if (selected && (e.key === "Delete" || e.key === "Backspace") && editingId === null) {
        del(selected);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, editingId]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Indie+Flower&family=Pacifico&family=Satisfy&display=swap');
        .vb-toolbar { 
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 8px; padding: 8px;
          background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
          z-index: 100; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .tool-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 14px;
          border-radius: 10px; border: 1px solid transparent; cursor: pointer;
          font-size: 13px; font-weight: 700; transition: all 0.2s; color: #f8fafc;
          background: transparent;
        }
        .tool-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
        .tool-btn.active { background: #6366f1; color: #fff; }
        .action-btn { opacity: 0; transition: all 0.2s; pointer-events: none; }
        .vb-item-container:hover .action-btn { opacity: 1; pointer-events: auto; }
      `}</style>

      {/* Integrated Toolbar */}
      <div className="vb-toolbar" onMouseDown={e => e.stopPropagation()}>
        <button className="tool-btn" onClick={addNote}><MdStickyNote2 size={18}/> {lang==="mn"?"Карт":"Note"}</button>
        <div style={{position:"relative"}}>
          <button className={`tool-btn ${showStickerPicker?"active":""}`} onClick={()=>setShowStickerPicker(v=>!v)}>
            FOCUS
          </button>
          {showStickerPicker && (
            <div style={{position:"absolute",top:"calc(100% + 12px)",left:"50%",transform:"translateX(-50%)",
              background:"#1e293b",borderRadius:16,boxShadow:"0 20px 40px rgba(0,0,0,0.5)",
              border:"1px solid rgba(255,255,255,0.1)",padding:12,width:240,display:"flex",flexWrap:"wrap",gap:6}}>
              {VB_STICKERS.map(s=>(
                <button key={s} onClick={()=>addSticker(s)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-700 border border-white/5 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="tool-btn">
          <MdImage size={18}/> {lang==="mn"?"Зураг":"Image"}
          <input type="file" accept="image/*" style={{display:"none"}} onChange={addImage}/>
        </label>
        
        <div className="w-px h-6 bg-white/10 mx-1" />

        {selItem?.type==="note" && (
          <select value={selItem.font} onChange={e=>upd(selected,{font:e.target.value})}
            className="bg-slate-800 border-none rounded-lg px-2 py-1.5 text-xs text-white outline-none cursor-pointer hover:bg-slate-700">
            {VB_FONTS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        )}

        {selected && (
          <button className="tool-btn hover:text-red-400" onClick={()=>del(selected)}>
            <MdDelete size={18}/>
          </button>
        )}
        <button className="tool-btn text-slate-500 hover:text-white" onClick={clearAll}>
          <MdCleaningServices size={18}/>
        </button>
      </div>

      <div
        ref={boardRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={(e)=> { 
          if(e.target === boardRef.current || e.target.classList.contains('shadow-overlay')) {
            setSelected(null); 
            setEditingId(null);
            setShowStickerPicker(false); 
          }
        }}
        style={{
          flex:1, position:"relative", overflow:"hidden",
          backgroundColor:"#a07850",
          backgroundImage:`url("https://www.transparenttextures.com/patterns/cork-board.png")`,
          backgroundSize: "400px",
          boxShadow:"inset 0 0 100px rgba(0,0,0,0.4)",
          cursor:"default", userSelect:"none",
        }}>

        <div className="shadow-overlay absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]" />

        {items.map(item => {
          const isSel = selected===item.id;
          const isEdit = editingId===item.id;
          const rotate = `rotate(${item.rot||0}deg)`;

          return (
            <div key={item.id}
              onMouseDown={e=>onItemMouseDown(e,item.id)}
              onDoubleClick={(e)=>{
                if(item.type==='note') {
                  e.stopPropagation();
                  setEditingId(item.id);
                }
              }}
              className="vb-item-container"
              style={{
                position:"absolute", left:item.x, top:item.y,
                width:item.w, height:item.h,
                transform:rotate, 
                cursor: isEdit ? "text" : "grab", 
                zIndex:isSel?20:5,
                transition: "box-shadow 0.2s, transform 0.1s",
              }}>
              
              {(item.type === "image" || item.type === "note") && (
                <MdPushPin className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" 
                  size={24} style={{ color: PIN_COLORS[item.pin%PIN_COLORS.length], filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
              )}

              {/* Quick Delete Button (Visible on Hover) */}
              {!isEdit && (
                <button 
                  onClick={(e)=>{e.stopPropagation(); del(item.id);}}
                  className="action-btn absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center z-40 shadow-lg hover:bg-red-600 transition-colors"
                >
                  <MdClose size={14}/>
                </button>
              )}

              {/* Resize Handle */}
              {(item.type === "image" || item.type === "note") && !isEdit && (
                <div onMouseDown={e=>onResizeMouseDown(e,item.id)}
                  className={`action-btn absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-indigo-500 border-2 border-white cursor-nwse-resize z-30 shadow-lg flex items-center justify-center ${isSel ? "opacity-100 scale-110" : ""}`}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
                </div>
              )}

              {/* Item Specific Content */}
              {item.type === "sticker" ? (
                <div style={{
                  fontSize:item.size||48, fontWeight:900, color:"#fff",
                  textShadow:"0 4px 10px rgba(0,0,0,0.5)",
                  filter:isSel?"drop-shadow(0 0 10px #6366f1)":"none",
                }}>
                  {item.emoji}
                </div>
              ) : item.type === "image" ? (
                <div className={`w-full h-full bg-white shadow-xl rounded-[2px] overflow-hidden ${isSel ? "ring-2 ring-indigo-500" : ""}`} style={{ padding: item.border?6:0 }}>
                  <img src={item.src} alt="" className="w-full h-full object-cover rounded-[1px]" />
                </div>
              ) : item.type === "note" ? (
                <div className={`w-full h-full shadow-xl rounded-[2px] p-6 pt-8 ${isSel ? "ring-2 ring-indigo-500" : ""}`} style={{ background: NOTE_COLORS[item.color%NOTE_COLORS.length] }}>
                  {isEdit ? (
                    <textarea autoFocus
                      value={item.text}
                      onChange={e=>upd(item.id,{text:e.target.value})}
                      onBlur={()=>setEditingId(null)}
                      onKeyDown={e => { if(e.key === 'Escape') setEditingId(null); }}
                      className="w-full h-full border-none outline-none bg-transparent overflow-hidden"
                      style={{fontSize:18, fontFamily:VB_FONTS.find(f=>f.id===item.font)?.css, color:"#1e293b", resize:"none"}}/>
                  ) : (
                    <div style={{fontSize:18, fontFamily:VB_FONTS.find(f=>f.id===item.font)?.css, color:"#1e293b", lineHeight:1.4, whiteSpace:"pre-wrap"}}>
                      {item.text || <span className="opacity-20 italic text-sm">{lang==="mn"?"Бичих...":"Edit..."}</span>}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}

        {items.length===0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <MdAdd size={80} className="text-white mb-4" />
            <p className="text-xl font-bold text-white uppercase tracking-widest">Start your vision</p>
          </div>
        )}
      </div>
    </div>
  );
}
