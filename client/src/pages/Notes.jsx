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

const NOTE_STICKERS = ["🔥","⭐","✨","💡","✅","❌","📍","❤️","🚀","🎉","💎","🌈","🍀","🌸"];

const PAGE_COLORS = ["#ffffff", "#f8fafc", "#fef2f2", "#f0fdf4", "#eff6ff", "#fff7ed"];
const FONTS = [
  { id:"sans",    label:"Sans",  style:'"Inter", sans-serif' },
  { id:"serif",   label:"Serif", style:'"Georgia", serif' },
  { id:"mono",    label:"Mono",  style:'"Fira Code", monospace' },
];

const SUBJECT_THEMES = [
  { id:"red",    bg:"#ef4444", text:"#ffffff" },
  { id:"blue",   bg:"#3b82f6", text:"#ffffff" },
  { id:"green",  bg:"#10b981", text:"#ffffff" },
  { id:"purple", bg:"#8b5cf6", text:"#ffffff" },
  { id:"pink",   bg:"#ec4899", text:"#ffffff" },
  { id:"orange", bg:"#f97316", text:"#ffffff" },
];

const SUBJECT_EMOJIS = ["📚","📝","🎨","🎵","💡","🌟","🔬","🏃","🎯","🎭","💻","📷","🍕","✈️"];

/* ─── Simplified Note Card ─── */
function NoteCard({ note, idx, onClick, onDelete }) {
  const cv = COVERS[note.coverIdx % COVERS.length] || COVERS[0];
  return (
    <div 
      onClick={onClick}
      className="group relative h-64 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 bg-slate-900 border border-slate-800"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-50 from-transparent to-black/60 pointer-events-none" />
      
      {/* Cover Area */}
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

      {/* Info Area */}
      <div className="p-4 flex flex-col h-32 justify-between">
        <div>
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">
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
    setItems([...items, { id: newId, type: "sticker", x: 100, y: 100, emoji, size: 64, rot: 0 }]);
    setSelected(newId); setShowStickerPicker(false);
  };

  const addImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const newId = Date.now();
      setItems([...items, { id: newId, type: "image", x: 100, y: 100, w: 200, h: 150, src: ev.target.result, rot: 0 }]);
      setSelected(newId);
    };
    reader.readAsDataURL(file);
  };

  const onMouseMove = (e) => {
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onMouseMove={onMouseMove} onMouseUp={() => dragRef.current = null}>
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
      `}</style>
      
      <div className="bg-slate-950 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note Title..." className="bg-transparent border-none text-xl font-bold text-white outline-none w-2/3" />
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors"><MdClose size={24}/></button>
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              <MdSave size={18}/> Save
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900/30 overflow-x-auto">
          <button onClick={() => document.execCommand('bold')} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg"><MdFormatBold/></button>
          <button onClick={() => document.execCommand('italic')} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg"><MdFormatItalic/></button>
          <div className="w-px h-6 bg-slate-800 mx-1" />
          <div className="relative">
            <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg flex items-center gap-1">
              <MdEmojiEmotions/> Stickers
            </button>
            {showStickerPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 grid grid-cols-5 gap-2 w-48">
                {NOTE_STICKERS.map(s => (
                  <button key={s} onClick={() => addSticker(s)} className="text-2xl hover:scale-125 transition-transform">{s}</button>
                ))}
              </div>
            )}
          </div>
          <label className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-1">
            <MdImage/> Image
            <input type="file" hidden accept="image/*" onChange={addImage} />
          </label>
        </div>

        <div className="flex-1 relative overflow-hidden bg-slate-950" ref={boardRef}>
          {/* Main Text Editor Layer */}
          <div 
            ref={editorRef}
            contentEditable
            className="absolute inset-0 p-12 outline-none text-slate-200 text-xl leading-relaxed overflow-y-auto scrollbar-hide z-0"
            style={{ fontFamily: 'Inter, sans-serif' }}
            data-placeholder="Start your masterpiece..."
          />

          {/* Floating Items Layer */}
          {items.map(item => {
            const isSel = selected === item.id;
            const rotate = `rotate(${item.rot || 0}deg)`;
            return (
              <div 
                key={item.id} 
                className="vb-item-container"
                onMouseDown={(e) => {
                  if (e.target.closest('button') || e.target.closest('.handle')) return;
                  e.stopPropagation(); setSelected(item.id);
                  const rect = boardRef.current.getBoundingClientRect();
                  dragRef.current = { mode: "drag", id: item.id, ox: e.clientX - rect.left - item.x, oy: e.clientY - rect.top - item.y };
                }}
                style={{ position: "absolute", left: item.x, top: item.y, width: item.w || 'auto', height: item.h || 'auto', transform: rotate, zIndex: isSel ? 20 : 10 }}
              >
                {/* Controls */}
                <button onClick={() => del(item.id)} className="action-btn absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center z-30 shadow-lg"><MdClose size={14}/></button>
                <div className="action-btn">
                   <div className="rot-line" />
                   <div className="rot-handle handle" onMouseDown={(e) => {
                     e.stopPropagation(); e.preventDefault(); setSelected(item.id);
                     const rect = boardRef.current.getBoundingClientRect();
                     const cx = item.x + (item.w || 64) / 2; const cy = item.y + (item.h || 64) / 2;
                     dragRef.current = { mode: "rotate", id: item.id, centerX: cx, centerY: cy, startAngle: item.rot || 0, startMouseAngle: Math.atan2(e.clientY - rect.top - cy, e.clientX - rect.left - cx) };
                   }}><MdRefresh size={14}/></div>
                </div>
                {item.type === 'image' && (
                  <div className="action-btn absolute -right-2 -bottom-2 w-6 h-6 bg-indigo-500 border-2 border-white rounded-full cursor-nwse-resize z-30 handle" onMouseDown={(e) => {
                    e.stopPropagation(); e.preventDefault(); setSelected(item.id);
                    dragRef.current = { mode: "resize", id: item.id, startX: e.clientX, startY: e.clientY, startW: item.w, startH: item.h };
                  }} />
                )}

                {/* Content */}
                {item.type === 'sticker' ? (
                  <div className="text-6xl drop-shadow-2xl select-none">{item.emoji}</div>
                ) : (
                  <div className={`rounded-xl overflow-hidden shadow-2xl border-2 ${isSel ? 'border-indigo-500' : 'border-white/10'}`}>
                    <img src={item.src} className="w-full h-full object-cover select-none pointer-events-none" alt="" />
                  </div>
                )}
              </div>
            );
          })}
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
    toast.success("Deleted");
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
    <div className="h-full flex bg-slate-950 text-white overflow-hidden">
      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #64748b; cursor: text; }
      `}</style>

      <div className="w-72 border-r border-slate-900 flex flex-col bg-slate-900/20 backdrop-blur-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{lang === "mn" ? "Тэмдэглэл" : "Notes"}</h1>
            <button onClick={() => setEditing({ id: null, title: "", html: "", coverIdx: 0, subjectId: null, floatItems: [] })} className="p-2 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"><MdAdd size={24} /></button>
          </div>
          <div className="relative mb-6">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveSubj("all")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSubj === "all" ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
              <div className="flex items-center gap-3"><MdBook size={20} /><span className="font-bold text-sm">All Notes</span></div>
              <span className="text-[10px] font-black opacity-50">{notes.length}</span>
            </button>
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Subjects</div>
            {subjects.map(s => (
              <button key={s.id} onClick={() => setActiveSubj(s.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSubj === s.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/30 text-slate-500'}`}>
                <div className="flex items-center gap-3"><span className="text-lg">{s.emoji}</span><span className="font-bold text-sm">{s.name}</span></div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="h-20 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            {activeSubj === "all" ? "All Collections" : subjects.find(s => s.id === activeSubj)?.name || "Collection"}
            <span className="text-slate-700 mx-2">/</span>
            <span className="text-indigo-400">{filtered.length} items</span>
          </h2>
          <button onClick={() => setEditing({ id: null, title: "", html: "", coverIdx: 0, subjectId: activeSubj !== "all" ? activeSubj : null, floatItems: [] })} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">New Note</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
