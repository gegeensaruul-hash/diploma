import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import { getUserStore, setUserStore } from "../utils/userStorage";
import { 
  MdSearch, MdAdd, MdEdit, MdDelete, MdChevronLeft, MdChevronRight, 
  MdBook, MdFolder, MdTimer, MdClose, MdSave, MdFormatBold, 
  MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdFormatListBulleted,
  MdFormatListNumbered, MdImage, MdBrush, MdPalette, MdGridOn, MdLineWeight, MdMoreHoriz,
  MdRefresh, MdEmojiEmotions
} from "react-icons/md";

/* ─── storage ─── */
function getNotes()    { return getUserStore("app_notes_v3", []); }
function getSubjects() { return getUserStore("app_subjects_v1", []); }
function saveNotes(n)    { setUserStore("app_notes_v3", n); }
function saveSubjects(s) { setUserStore("app_subjects_v1", s); }

/* ─── constants ─── */
const COVERS = [
  { id:"dark",     bg:"#1e293b", bg2:"#0f172a", spine:"#6366f1", text:"#ffffff", deco:["✨","💎","🌑","⚡"] },
  { id:"emerald",  bg:"#064e3b", bg2:"#065f46", spine:"#10b981", text:"#ffffff", deco:["🌿","🍀","🌱","🍃"] },
  { id:"indigo",   bg:"#312e81", bg2:"#3730a3", spine:"#818cf8", text:"#ffffff", deco:["🌙","⭐","🔭","🌌"] },
  { id:"rose",     bg:"#881337", bg2:"#9f1239", spine:"#fb7185", text:"#ffffff", deco:["🌹","🎀","💖","✨"] },
  { id:"amber",    bg:"#78350f", bg2:"#92400e", spine:"#fbbf24", text:"#ffffff", deco:["🔥","☀️","🦁","⚡"] },
  { id:"violet",   bg:"#4c1d95", bg2:"#5b21b6", spine:"#a78bfa", text:"#ffffff", deco:["🔮","👾","🌌","✨"] },
];

const NOTE_STICKERS = ["🔥","⭐","✨","💡","✅","❌","📍","❤️","🚀","🎉","💎","🌈","🍀","🌸","🎨","🍕","🍟","🍦","🍔","🍩"];

/* ─── Simplified Note Card ─── */
function NoteCard({ note, idx, onClick, onDelete }) {
  const cv = COVERS[note.coverIdx % COVERS.length] || COVERS[0];
  return (
    <div 
      onClick={onClick}
      className="group relative h-64 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 bg-slate-900 border border-slate-800"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-50 from-transparent to-black/60 pointer-events-none" />
      <div 
        className="h-32 w-full flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cv.bg}, ${cv.bg2})` }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
        {note.drawing || note.coverImg ? (
          <img src={note.drawing || note.coverImg} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="text-5xl drop-shadow-lg">{cv.deco[idx % cv.deco.length]}</span>
        )}
      </div>
      <div className="p-4 flex flex-col h-32 justify-between">
        <div>
          <h3 className="text-stone-900 dark:text-white font-bold text-sm leading-tight line-clamp-2 mb-1">
            {note.title || "Untitled Note"}
          </h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            {note.subjectId ? `@${note.subjectId}` : "General"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-slate-600 text-[10px] font-medium">
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Note Editor ─── */
function NoteEditor({ note, subjects, onSave, onClose }) {
  const [title, setTitle] = useState(note.title || "");
  const [coverIdx, setCoverIdx] = useState(note.coverIdx || 0);
  const [items, setItems] = useState(note.floatItems || []);
  const [selected, setSelected] = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const editorRef = useRef(null);
  const boardRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = note.html || "";
  }, []);

  const handleSave = () => {
    onSave({
      ...note,
      title,
      html: editorRef.current?.innerHTML || "",
      plainText: editorRef.current?.innerText || "",
      coverIdx,
      floatItems: items,
      createdAt: note.createdAt || new Date().toISOString(),
    });
  };

  const upd = (itemId, patch) => setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...patch } : i));
  const del = (itemId) => { setItems(items.filter(i => i.id !== itemId)); if (selected === itemId) setSelected(null); };

  const addSticker = (emoji) => {
    const newId = Date.now();
    setItems([...items, { id: newId, type: "sticker", x: 150, y: 150, emoji, size: 80, rot: 0 }]);
    setSelected(newId); setShowStickerPicker(false);
  };

  const addImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const newId = Date.now();
      setItems([...items, { id: newId, type: "image", x: 150, y: 150, w: 240, h: 180, src: ev.target.result, rot: 0 }]);
      setSelected(newId);
    };
    reader.readAsDataURL(file);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    if (dragRef.current.mode === "resize") {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      upd(dragRef.current.id, { w: Math.max(50, dragRef.current.startW + dx), h: Math.max(50, dragRef.current.startH + dy) });
    } else if (dragRef.current.mode === "rotate") {
      const mouseAngle = Math.atan2(e.clientY - rect.top - dragRef.current.centerY, e.clientX - rect.left - dragRef.current.centerX);
      const angleDiff = (mouseAngle - dragRef.current.startMouseAngle) * (180 / Math.PI);
      upd(dragRef.current.id, { rot: dragRef.current.startAngle + angleDiff });
    } else {
      upd(dragRef.current.id, { x: e.clientX - rect.left - dragRef.current.ox, y: e.clientY - rect.top - dragRef.current.oy });
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl" onPointerMove={onPointerMove} onPointerUp={() => dragRef.current = null} onPointerCancel={() => dragRef.current = null} onClick={() => { setShowStickerPicker(false); setSelected(null); }}>
      <style>{`
        .action-btn { opacity: 0; transition: all 0.2s; pointer-events: none; }
        .vb-item-container:hover .action-btn { opacity: 1; pointer-events: auto; }
        .rot-handle { 
          position: absolute; top: -35px; left: 50%; transform: translateX(-50%);
          width: 24px; height: 24px; border-radius: 50%; background: #6366f1;
          color: white; display: flex; align-items: center; justify-content: center;
          cursor: grab; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .rot-line { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 2px; height: 15px; background: #6366f1; }
        
        .paper-background {
          background-color: #fefcf0;
          background-image: 
            linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
            linear-gradient(#eee .1em, transparent .1em);
          background-size: 100% 1.4em;
          position: relative;
        }
        .paper-background::before {
          content: ''; position: absolute; top: 0; bottom: 0; left: 40px; width: 1px; background: rgba(255, 0, 0, 0.2); z-index: 1;
        }
      `}</style>
      
      <div className="bg-slate-900 w-full max-w-6xl h-[92vh] rounded-[40px] shadow-2xl border border-black/10 dark:border-white/10 relative flex flex-col overflow-visible" onClick={e => e.stopPropagation()}>
        {/* Editor Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md z-[110] rounded-t-[40px]">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Journal Title..." className="bg-transparent border-none text-2xl font-black text-stone-900 dark:text-white outline-none w-2/3 placeholder:text-stone-900 dark:text-white/20" />
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl text-stone-900 dark:text-white/50 hover:text-stone-900 dark:text-white transition-all"><MdClose size={24}/></button>
            <button onClick={handleSave} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-stone-900 dark:text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
              <MdSave size={20}/> Save Entry
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-4 bg-slate-900/50 z-[100] relative overflow-visible">
          <div className="flex items-center bg-black/20 rounded-xl p-1">
            <button onClick={() => document.execCommand('bold')} className="p-2.5 text-stone-900 dark:text-white/60 hover:text-stone-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-lg transition-all"><MdFormatBold size={20}/></button>
            <button onClick={() => document.execCommand('italic')} className="p-2.5 text-stone-900 dark:text-white/60 hover:text-stone-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-lg transition-all"><MdFormatItalic size={20}/></button>
            <button onClick={() => document.execCommand('underline')} className="p-2.5 text-stone-900 dark:text-white/60 hover:text-stone-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-lg transition-all"><MdFormatUnderlined size={20}/></button>
          </div>
          
          <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
          
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowStickerPicker(!showStickerPicker); }} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold text-sm ${showStickerPicker ? 'bg-indigo-600 text-stone-900 dark:text-white' : 'bg-black/5 dark:bg-white/5 text-stone-900 dark:text-white/70 hover:text-stone-900 dark:text-white'}`}>
              <MdEmojiEmotions size={20}/> Stickers
            </button>
            {showStickerPicker && (
              <div className="absolute top-full left-0 mt-3 p-4 bg-slate-800 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl z-[200] grid grid-cols-5 gap-3 w-64" onClick={e => e.stopPropagation()}>
                {NOTE_STICKERS.map(s => (
                  <button key={s} onClick={() => addSticker(s)} className="text-3xl hover:scale-125 transition-transform active:scale-95">{s}</button>
                ))}
              </div>
            )}
          </div>

          <label className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-xl text-stone-900 dark:text-white/70 hover:text-stone-900 dark:text-white transition-all cursor-pointer flex items-center gap-2 font-bold text-sm">
            <MdImage size={20}/> Add Photo
            <input type="file" hidden accept="image/*" onChange={addImage} />
          </label>
        </div>

        {/* Notebook Body */}
        <div className="flex-1 relative bg-slate-950 flex overflow-hidden rounded-b-[40px]">
          {/* Side binding effect */}
          <div className="w-16 h-full bg-slate-900 border-r border-black/10 dark:border-white/10 flex flex-col items-center gap-12 pt-12 shadow-2xl z-10">
            {Array.from({length: 15}).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-black/40 shadow-inner" />
            ))}
          </div>

          {/* Paper Area */}
          <div className="flex-1 relative paper-background overflow-hidden" ref={boardRef}>
            <div 
              ref={editorRef}
              contentEditable
              className="absolute inset-0 pl-24 pr-12 py-12 outline-none text-slate-800 text-xl leading-[1.4em] overflow-y-auto z-0 selection:bg-indigo-500/20"
              style={{ fontFamily: '"Inter", sans-serif' }}
              data-placeholder="Once upon a time..."
            />

            {/* Floating Items */}
            {items.map(item => {
              const isSel = selected === item.id;
              const rotate = `rotate(${item.rot || 0}deg)`;
              return (
                <div 
                  key={item.id} 
                  className="vb-item-container"
                  onPointerDown={(e) => {
                    if (e.target.closest('button') || e.target.closest('.handle')) return;
                    e.stopPropagation(); setSelected(item.id);
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const rect = boardRef.current.getBoundingClientRect();
                    dragRef.current = { mode: "drag", id: item.id, ox: e.clientX - rect.left - item.x, oy: e.clientY - rect.top - item.y };
                  }}
                  style={{ position: "absolute", left: item.x, top: item.y, width: item.w || 'auto', height: item.h || 'auto', transform: rotate, zIndex: isSel ? 20 : 10, touchAction: "none" }}
                >
                  <button onClick={() => del(item.id)} className="action-btn absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-stone-900 dark:text-white rounded-full flex items-center justify-center z-30 shadow-xl border-2 border-white transition-all"><MdClose size={16}/></button>
                  <div className="action-btn">
                     <div className="rot-line" />
                     <div className="rot-handle handle" onPointerDown={(e) => {
                       e.stopPropagation(); e.preventDefault(); setSelected(item.id);
                       e.currentTarget.setPointerCapture(e.pointerId);
                       const rect = boardRef.current.getBoundingClientRect();
                       const cx = item.x + (item.w || 80) / 2; const cy = item.y + (item.h || 80) / 2;
                       dragRef.current = { mode: "rotate", id: item.id, centerX: cx, centerY: cy, startAngle: item.rot || 0, startMouseAngle: Math.atan2(e.clientY - rect.top - cy, e.clientX - rect.left - cx) };
                     }}><MdRefresh size={14}/></div>
                  </div>
                  {item.type === 'image' && (
                    <div className="action-btn absolute -right-2 -bottom-2 w-7 h-7 bg-indigo-600 border-2 border-white rounded-full cursor-nwse-resize z-30 handle shadow-xl" onPointerDown={(e) => {
                      e.stopPropagation(); e.preventDefault(); setSelected(item.id);
                      e.currentTarget.setPointerCapture(e.pointerId);
                      dragRef.current = { mode: "resize", id: item.id, startX: e.clientX, startY: e.clientY, startW: item.w, startH: item.h };
                    }} />
                  )}

                  {item.type === 'sticker' ? (
                    <div className="text-7xl drop-shadow-2xl select-none hover:scale-110 transition-transform active:scale-95">{item.emoji}</div>
                  ) : (
                    <div className={`rounded-2xl overflow-hidden shadow-2xl border-4 ${isSel ? 'border-indigo-500' : 'border-white'} transition-all`}>
                      <img src={item.src} className="w-full h-full object-cover select-none pointer-events-none" alt="" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const { lang } = useSettings();
  const [notes, setNotes] = useState(getNotes);
  const [subjects, setSubjects] = useState(getSubjects);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [activeSubj, setActiveSubj] = useState("all");

  useEffect(() => saveNotes(notes), [notes]);
  useEffect(() => saveSubjects(subjects), [subjects]);

  const handleDelete = (id) => {
    setNotes(p => p.filter(n => n.id !== id));
    toast.success("Entry Deleted");
  };

  const handleSave = (updated) => {
    if (updated.id) setNotes(p => p.map(n => n.id === updated.id ? updated : n));
    else setNotes(p => [{ ...updated, id: Date.now() }, ...p]);
    setEditing(null);
  };

  const filtered = notes.filter(n => {
    const matchSearch = (n.title + n.plainText).toLowerCase().includes(search.toLowerCase());
    const matchSubj = activeSubj === "all" ? true : n.subjectId === activeSubj;
    return matchSearch && matchSubj;
  });

  return (
    <div className="h-full flex bg-slate-950 text-stone-900 dark:text-white overflow-hidden">
      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; cursor: text; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="w-80 border-r border-black/5 dark:border-white/5 flex flex-col bg-slate-900/30 backdrop-blur-3xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {lang === "mn" ? "Тэмдэглэл" : "Journals"}
            </h1>
            <button 
              onClick={() => setEditing({ id: null, title: "", html: "", coverIdx: 0, subjectId: null, floatItems: [] })}
              className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              <MdAdd size={28} />
            </button>
          </div>

          <div className="relative mb-8 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your thoughts..."
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-indigo-500/50 focus:bg-black/10 dark:bg-white/10 transition-all"
            />
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveSubj("all")}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeSubj === "all" ? 'bg-indigo-600 text-stone-900 dark:text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-black/5 dark:bg-white/5 text-slate-400'}`}
            >
              <div className="flex items-center gap-4">
                <MdBook size={22} />
                <span className="font-black text-sm">All Entries</span>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${activeSubj === "all" ? 'bg-black/20 dark:bg-white/20' : 'bg-black/5 dark:bg-white/5'}`}>{notes.length}</span>
            </button>
            
            <div className="pt-6 pb-3 px-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Collections</div>
            {subjects.map(s => (
              <button 
                key={s.id}
                onClick={() => setActiveSubj(s.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeSubj === s.id ? 'bg-slate-800 text-stone-900 dark:text-white border border-black/10 dark:border-white/10' : 'hover:bg-black/5 dark:bg-white/5 text-slate-500'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{s.emoji}</span>
                  <span className="font-black text-sm">{s.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="h-24 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-3">
              {activeSubj === "all" ? "Master Library" : subjects.find(s => s.id === activeSubj)?.name || "Collection"}
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <span className="text-indigo-400 text-sm">{filtered.length} entries</span>
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-1">Manage and organize your personal thoughts</p>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-400 hover:text-stone-900 dark:text-white transition-all">
              <MdGridOn size={22} />
            </button>
            <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
            <button onClick={() => setEditing({ id: null, title: "", html: "", coverIdx: 0, subjectId: activeSubj !== "all" ? activeSubj : null, floatItems: [] })} className="bg-indigo-600 hover:bg-indigo-500 text-stone-900 dark:text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
              New Entry
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filtered.map((note, i) => (
              <NoteCard key={note.id} note={note} idx={i} onClick={() => setEditing(note)} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <NoteEditor note={editing} subjects={subjects} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
