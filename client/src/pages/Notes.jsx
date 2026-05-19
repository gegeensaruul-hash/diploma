import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import { getUserStore, setUserStore } from "../utils/userStorage";

/* ─── storage ─── */
function getNotes()    { return getUserStore("app_notes_v3", []); }
function getSubjects() { return getUserStore("app_subjects_v1", []); }
function saveNotes(n)    { setUserStore("app_notes_v3", n); }
function saveSubjects(s) { setUserStore("app_subjects_v1", s); }

/* ─── constants ─── */
const COVERS = [
  { id:"kraft",    bg:"#c8a86b", bg2:"#b8945a", spine:"#8b6520", text:"#3d2000", deco:["🌸","🍂","✂️","📎"] },
  { id:"lavender", bg:"#c8b8e8", bg2:"#b8a0d8", spine:"#7a5ca8", text:"#3a1a6a", deco:["⭐","🌙","💜","✨"] },
  { id:"ocean",    bg:"#7ab8d4", bg2:"#5aa0c0", spine:"#2a6080", text:"#0a3050", deco:["🐋","🌊","🐚","⭐"] },
  { id:"peach",    bg:"#e8a878", bg2:"#d89060", spine:"#a05820", text:"#4a1800", deco:["🌺","🍑","🦊","💛"] },
  { id:"mint",     bg:"#88c8a8", bg2:"#68b090", spine:"#307850", text:"#0a3820", deco:["🌿","🍀","🌱","💚"] },
  { id:"rose",     bg:"#e89898", bg2:"#d87878", spine:"#a03030", text:"#3a0010", deco:["🌹","💕","🎀","❤️"] },
];
const PAGE_COLORS = ["#fef9ef","#fce7f3","#dbeafe","#dcfce7","#ede9fe","#fff7ed","#f0fdf4","#fdf4ff"];
const FONTS = [
  { id:"caveat",       label:"Normal",  style:'"DM Sans"' },
  { id:"patrick",      label:"Light",   style:'"DM Sans"' },
  { id:"indie",        label:"Medium",  style:'"DM Sans"' },
  { id:"satisfy",      label:"Bold",    style:'"DM Sans"' },
  { id:"lato",         label:"Lato",    style:'"DM Sans"' },
  { id:"merriweather", label:"Serif",   style:'"DM Sans"' },
];
const HIGHLIGHTS  = ["#fde68a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa"];
const TEXT_COLORS = ["#1e293b","#dc2626","#2563eb","#16a34a","#7c3aed","#ea580c","#0891b2","#be185d"];
const DRAW_COLORS = ["#1e293b","#dc2626","#2563eb","#16a34a","#7c3aed","#f59e0b","#ec4899","#06b6d4","#ffffff"];
const FLOAT_MIN_SIZE = 42;
const FLOAT_MAX_SIZE = 520;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/* Subject загвар өнгөнүүд — зурагт байгаа шиг зөөлөн өнгөтэй */
const SUBJECT_THEMES = [
  { id:"red",    bg:"#fca5a5", text:"#7f1d1d", dot:"#ef4444" },
  { id:"orange", bg:"#fdba74", text:"#7c2d12", dot:"#f97316" },
  { id:"yellow", bg:"#fde68a", text:"#78350f", dot:"#f59e0b" },
  { id:"green",  bg:"#86efac", text:"#14532d", dot:"#22c55e" },
  { id:"teal",   bg:"#5eead4", text:"#134e4a", dot:"#14b8a6" },
  { id:"blue",   bg:"#93c5fd", text:"#1e3a8a", dot:"#3b82f6" },
  { id:"indigo", bg:"#a5b4fc", text:"#312e81", dot:"#6366f1" },
  { id:"purple", bg:"#d8b4fe", text:"#581c87", dot:"#a855f7" },
  { id:"pink",   bg:"#f9a8d4", text:"#831843", dot:"#ec4899" },
  { id:"slate",  bg:"#cbd5e1", text:"#1e293b", dot:"#64748b" },
];

const SUBJECT_EMOJIS = ["📚","📝","🎨","🎵","💡","🌟","🔬","🏃","🎯","🌺","🎭","✈️","🍕","💻","🧶","📷"];

/* ─── SVG Sticker sets ─── */
const mk = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">${body}</svg>`;
const SVG_STICKERS = [
  {
    label: "Хичээл", color: "#6366f1",
    items: [
      mk(`<rect x="8" y="6" width="36" height="48" rx="4" fill="#6366f1"/><rect x="8" y="6" width="6" height="48" rx="3" fill="#4338ca"/><line x1="19" y1="22" x2="38" y2="22" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="19" y1="31" x2="38" y2="31" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="19" y1="40" x2="30" y2="40" stroke="white" stroke-width="2.5" stroke-linecap="round"/><circle cx="26" cy="14" r="4" fill="white" opacity="0.35"/>`),
      mk(`<polygon points="30,5 36,22 55,22 41,34 46,51 30,39 14,51 19,34 5,22 24,22" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/><polygon points="30,12 35,22 46,22 38,29 41,40 30,33 19,40 22,29 14,22 25,22" fill="#fde68a" opacity="0.7"/>`),
      mk(`<circle cx="30" cy="26" r="14" fill="#fbbf24"/><path d="M24,40 h12" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/><path d="M25,46 h10" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/><line x1="30" y1="6" x2="30" y2="10" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/><line x1="8" y1="26" x2="4" y2="26" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/><line x1="52" y1="26" x2="56" y2="26" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/><line x1="14" y1="12" x2="11" y2="9" stroke="#fde68a" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="12" x2="49" y2="9" stroke="#fde68a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="24" cy="22" rx="5" ry="7" fill="white" opacity="0.25" transform="rotate(-20 24 22)"/>`),
      mk(`<circle cx="30" cy="30" r="22" fill="#22c55e"/><polyline points="16,30 26,40 44,20" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
      mk(`<path d="M20,10 h20 v14 a10,10 0 0 1-20,0z" fill="#fbbf24"/><path d="M12,12 h8 v10 a6,4 0 0 1-10-2 3,3 0 0 1 2-8z" fill="#fcd34d"/><path d="M48,12 h-8 v10 a6,4 0 0 0 10-2 3,3 0 0 0-2-8z" fill="#fcd34d"/><rect x="26" y="32" width="8" height="8" fill="#fbbf24"/><rect x="18" y="40" width="24" height="6" rx="2" fill="#f59e0b"/><text x="30" y="25" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">1</text>`),
      mk(`<rect x="10" y="12" width="40" height="30" rx="4" fill="#3b82f6"/><rect x="10" y="38" width="40" height="8" rx="2" fill="#2563eb"/><rect x="18" y="4" width="6" height="12" rx="3" fill="#93c5fd"/><rect x="36" y="4" width="6" height="12" rx="3" fill="#93c5fd"/><line x1="18" y1="24" x2="42" y2="24" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/><line x1="18" y1="30" x2="34" y2="30" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`),
    ],
  },
  {
    label: "Хөөрхөн", color: "#f43f5e",
    items: [
      mk(`<polygon points="12,22 19,34 8,34" fill="#fb923c"/><polygon points="48,22 52,34 41,34" fill="#fb923c"/><ellipse cx="30" cy="36" rx="20" ry="18" fill="#fb923c"/><circle cx="22" cy="34" r="4.5" fill="white"/><circle cx="38" cy="34" r="4.5" fill="white"/><circle cx="23" cy="35" r="3" fill="#1e293b"/><circle cx="39" cy="35" r="3" fill="#1e293b"/><circle cx="24.5" cy="33.5" r="1" fill="white"/><ellipse cx="30" cy="42" rx="5" ry="3" fill="#fda4af"/><line x1="27" y1="40" x2="33" y2="40" stroke="#1e293b" stroke-width="1.5"/><line x1="30" y1="38" x2="30" y2="43" stroke="#1e293b" stroke-width="1.5"/><line x1="18" y1="37" x2="10" y2="35" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/><line x1="18" y1="40" x2="10" y2="40" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/><line x1="42" y1="37" x2="50" y2="35" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/><line x1="42" y1="40" x2="50" y2="40" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>`),
      mk(`<circle cx="18" cy="22" r="10" fill="#334155"/><circle cx="42" cy="22" r="10" fill="#334155"/><circle cx="30" cy="32" r="20" fill="white"/><ellipse cx="22" cy="32" rx="7" ry="7" fill="#334155"/><ellipse cx="38" cy="32" rx="7" ry="7" fill="#334155"/><circle cx="22" cy="31" r="3.5" fill="white"/><circle cx="38" cy="31" r="3.5" fill="white"/><circle cx="23" cy="32" r="2.5" fill="#334155"/><circle cx="39" cy="32" r="2.5" fill="#334155"/><circle cx="24" cy="31" r="1" fill="white"/><ellipse cx="30" cy="42" rx="6" ry="4" fill="#fda4af"/><path d="M26,42 Q30,46 34,42" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>`),
      mk(`<path d="M30,50 C10,38 6,22 6,20 a12,12 0 0 1 24,-4 a12,12 0 0 1 24,4 C54,22 50,38 30,50z" fill="#f43f5e"/><path d="M20,18 a6,6 0 0 0-5,6" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.45"/><circle cx="38" cy="16" r="4" fill="#fda4af" opacity="0.5"/>`),
      mk(`<path d="M5,40 a25,25 0 0 1 50,0" fill="none" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/><path d="M9,40 a21,21 0 0 1 42,0" fill="none" stroke="#f97316" stroke-width="4" stroke-linecap="round"/><path d="M13,40 a17,17 0 0 1 34,0" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/><path d="M17,40 a13,13 0 0 1 26,0" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/><path d="M21,40 a9,9 0 0 1 18,0" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/><path d="M25,40 a5,5 0 0 1 10,0" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="46" r="7" fill="white"/><circle cx="50" cy="46" r="7" fill="white"/>`),
      mk(`<ellipse cx="30" cy="16" rx="7" ry="12" fill="#f9a8d4"/><ellipse cx="30" cy="44" rx="7" ry="12" fill="#f9a8d4"/><ellipse cx="16" cy="30" rx="12" ry="7" fill="#f9a8d4"/><ellipse cx="44" cy="30" rx="12" ry="7" fill="#f9a8d4"/><ellipse cx="17" cy="17" rx="8" ry="11" fill="#fda4af" transform="rotate(-45 17 17)"/><ellipse cx="43" cy="17" rx="8" ry="11" fill="#fda4af" transform="rotate(45 43 17)"/><ellipse cx="17" cy="43" rx="8" ry="11" fill="#fda4af" transform="rotate(45 17 43)"/><ellipse cx="43" cy="43" rx="8" ry="11" fill="#fda4af" transform="rotate(-45 43 43)"/><circle cx="30" cy="30" r="10" fill="#fbbf24"/><circle cx="27" cy="27" r="3" fill="white" opacity="0.4"/>`),
      mk(`<circle cx="30" cy="30" r="22" fill="#c4b5fd"/><circle cx="22" cy="26" r="5" fill="white"/><circle cx="38" cy="26" r="5" fill="white"/><circle cx="23" cy="27" r="3" fill="#4c1d95"/><circle cx="39" cy="27" r="3" fill="#4c1d95"/><circle cx="24.5" cy="26" r="1.2" fill="white"/><path d="M18,40 Q30,50 42,40" fill="none" stroke="#4c1d95" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="40" r="2.5" fill="#f43f5e"/><circle cx="42" cy="40" r="2.5" fill="#f43f5e"/><circle cx="30" cy="12" r="5" fill="white" opacity="0.35"/>`),
    ],
  },
  {
    label: "Мэдрэмж", color: "#f97316",
    items: [
      mk(`<path d="M30,54 C18,54 10,44 10,34 C10,22 18,16 22,12 C20,22 26,26 28,22 C26,30 30,34 30,28 C32,34 36,28 34,22 C40,28 50,32 50,40 C50,48 40,54 30,54z" fill="#f97316"/><path d="M30,50 C22,50 18,44 18,38 C18,32 22,28 24,26 C23,30 26,33 27,30 C28,34 31,32 31,30 C33,33 35,30 34,26 C38,32 42,36 42,40 C42,46 36,50 30,50z" fill="#fbbf24"/><ellipse cx="27" cy="44" rx="4" ry="6" fill="#fde68a" opacity="0.6"/>`),
      mk(`<polygon points="6,46 6,24 18,36 30,14 42,36 54,24 54,46" fill="#fbbf24"/><rect x="6" y="46" width="48" height="8" rx="2" fill="#f59e0b"/><circle cx="30" cy="20" r="5" fill="#f43f5e"/><circle cx="8" cy="26" r="4" fill="#3b82f6"/><circle cx="52" cy="26" r="4" fill="#22c55e"/>`),
      mk(`<path d="M26,14 C26,14 28,6 36,6 C38,6 40,9 38,16 L36,24 h10 a4,4 0 0 1 4,4 L46,50 a4,4 0 0 1-4,4 H24 V32 h-8 a4,4 0 0 1-4,-4 v-2 a4,4 0 0 1 4,-4 h10z" fill="#fbbf24"/>`),
      mk(`<path d="M30,4 L32.5,25 L54,22 L34,30 L44,50 L30,36 L16,50 L26,30 L6,22 L27.5,25z" fill="#a78bfa"/><circle cx="14" cy="10" r="5" fill="#fbbf24"/><circle cx="46" cy="10" r="5" fill="#fbbf24"/><circle cx="12" cy="48" r="4" fill="#f9a8d4"/><circle cx="48" cy="48" r="4" fill="#f9a8d4"/>`),
      mk(`<circle cx="30" cy="30" r="22" fill="#fbbf24"/><circle cx="22" cy="26" r="4" fill="white"/><circle cx="38" cy="26" r="4" fill="white"/><circle cx="23" cy="27" r="2.5" fill="#1e293b"/><circle cx="39" cy="27" r="2.5" fill="#1e293b"/><circle cx="24" cy="26" r="1" fill="white"/><path d="M18,38 Q30,48 42,38" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="38" r="2" fill="#f43f5e"/><circle cx="42" cy="38" r="2" fill="#f43f5e"/>`),
      mk(`<circle cx="30" cy="30" r="22" fill="#fbbf24"/><rect x="14" y="23" width="32" height="11" rx="5.5" fill="#1e293b"/><ellipse cx="22" cy="29" rx="7" ry="5.5" fill="#1e293b"/><ellipse cx="38" cy="29" rx="7" ry="5.5" fill="#1e293b"/><circle cx="24" cy="27" r="2" fill="white" opacity="0.4"/><circle cx="40" cy="27" r="2" fill="white" opacity="0.4"/><path d="M20,43 Q30,51 40,43" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>`),
    ],
  },
  {
    label: "Хоол", color: "#7c3aed",
    items: [
      mk(`<rect x="10" y="28" width="32" height="22" rx="4" fill="#7c3aed"/><path d="M42,34 C46,34 50,36 50,40 C50,44 46,46 42,46" fill="none" stroke="#7c3aed" stroke-width="5.5" stroke-linecap="round"/><path d="M42,34 C46,34 50,36 50,40 C50,44 46,46 42,46" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/><rect x="8" y="50" width="36" height="5" rx="2" fill="#6d28d9"/><path d="M20,27 C20,20 22,16 20,12" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M28,27 C28,18 30,14 28,10" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="14" y="32" width="24" height="14" rx="3" fill="#a78bfa" opacity="0.4"/>`),
      mk(`<rect x="6" y="36" width="48" height="16" rx="4" fill="#fda4af"/><rect x="12" y="26" width="36" height="14" rx="3" fill="#f9a8d4"/><path d="M12,36 Q22,30 30,36 Q38,30 48,36" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="26" x2="22" y2="10" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="26" x2="30" y2="8" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="26" x2="38" y2="10" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="22" cy="10" rx="3.5" ry="5" fill="#fbbf24"/><ellipse cx="30" cy="8" rx="3.5" ry="5" fill="#3b82f6"/><ellipse cx="38" cy="10" rx="3.5" ry="5" fill="#f43f5e"/>`),
      mk(`<path d="M16,20 h28 l-4,30 a4,4 0 0 1-4,4 h-12 a4,4 0 0 1-4,-4z" fill="#c4b5fd"/><rect x="16" y="14" width="28" height="9" rx="4" fill="#ede9fe"/><rect x="26" y="4" width="8" height="14" rx="4" fill="#a78bfa"/><circle cx="24" cy="38" r="4.5" fill="#4c1d95"/><circle cx="36" cy="38" r="4.5" fill="#4c1d95"/><circle cx="30" cy="46" r="4.5" fill="#4c1d95"/><circle cx="30" cy="30" r="4.5" fill="#4c1d95"/>`),
      mk(`<circle cx="30" cy="30" r="22" fill="#fda4af"/><circle cx="30" cy="30" r="10" fill="white"/><path d="M12,22 Q20,8 42,18" fill="none" stroke="#fecdd3" stroke-width="5" stroke-linecap="round" opacity="0.8"/><circle cx="20" cy="22" r="3.5" fill="#fbbf24"/><circle cx="38" cy="15" r="3.5" fill="#86efac"/><circle cx="12" cy="36" r="3" fill="#93c5fd"/><circle cx="46" cy="30" r="3.5" fill="#f43f5e"/><circle cx="38" cy="44" r="3" fill="#a78bfa"/>`),
      mk(`<path d="M30,6 C18,6 10,18 10,32 C10,46 18,56 30,56 C42,56 50,46 50,32 C50,18 42,6 30,6z" fill="#86efac"/><path d="M30,12 C22,12 16,22 16,32 C16,44 22,52 30,52 C38,52 44,44 44,32 C44,22 38,12 30,12z" fill="#4ade80"/><circle cx="30" cy="34" r="12" fill="#d97706"/><circle cx="27" cy="31" r="4" fill="#fbbf24" opacity="0.5"/>`),
      mk(`<polygon points="30,8 54,50 6,50" fill="#fbbf24"/><polygon points="30,16 48,48 12,48" fill="#ef4444" opacity="0.85"/><circle cx="30" cy="36" r="4" fill="#fde68a"/><circle cx="22" cy="44" r="3" fill="#fde68a"/><circle cx="38" cy="44" r="3" fill="#fde68a"/><circle cx="26" cy="28" r="2.5" fill="#fde68a"/><circle cx="34" cy="28" r="2.5" fill="#fde68a"/>`),
    ],
  },
];

/* ════════════ wrapSelection helper ════════════ */
function wrapSelection(styleKey, styleVal, editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  // ── CLEAR mode: editor дотрх бүх highlight span-г арилгана (сонголт шаардахгүй)
  if ((styleVal === "transparent" || styleVal === "") && editorEl) {
    editorEl.querySelectorAll("span").forEach(s => {
      if (s.style[styleKey]) {
        s.style[styleKey] = "";
        if (!s.getAttribute("style") || s.getAttribute("style").replace(/\s|;/g,"") === "") {
          const p = s.parentNode;
          while (s.firstChild) p.insertBefore(s.firstChild, s);
          p.removeChild(s);
        }
      }
    });
    return;
  }

  if (sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  try {
    const frag = range.extractContents();
    const span = document.createElement("span");
    span.style[styleKey] = styleVal;
    span.appendChild(frag);
    range.insertNode(span);
    // сонголтыг хадгална — дараагийн highlight ажиллана
    const r2 = document.createRange();
    r2.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(r2);
  } catch { /* cross-element range */ }
}

/* ════════════ DRAWING CANVAS ════════════ */
/* ── Pencil SVG icons ── */
const PencilIcon = ({color="#1e293b", tip="round", size=28, active=false, opacity=1}) => {
  const tipShapes = {
    round:   <ellipse cx="12" cy="34" rx="3" ry="5" fill={color}/>,
    flat:    <rect x="9" y="30" width="6" height="8" rx="1" fill={color}/>,
    chisel:  <polygon points="9,30 15,30 13,38 11,38" fill={color}/>,
    ink:     <polygon points="12,38 10,30 14,30" fill={color}/>,
    marker:  <rect x="8" y="28" width="8" height="10" rx="2" fill={color} opacity="0.9"/>,
    brush:   <ellipse cx="12" cy="35" rx="4" ry="6" fill={color} opacity="0.8"/>,
  };
  return (
    <svg width={size} height={size*1.6} viewBox="0 0 24 42" style={{filter:active?"drop-shadow(0 2px 6px rgba(0,0,0,0.28))":"none",opacity}}>
      <rect x="9" y="2" width="6" height="6" rx="1" fill="#e8e0d0"/>
      <rect x="9" y="8" width="6" height="20" rx="1" fill="white" stroke="#d1ccc0" strokeWidth="0.5"/>
      <rect x="10" y="9" width="1.5" height="18" rx="0.75" fill={color} opacity="0.18"/>
      <rect x="9" y="26" width="6" height="5" rx="0" fill="#c8b89a"/>
      {tipShapes[tip]}
      {active && <rect x="9" y="1" width="6" height="2" rx="1" fill="#7c3aed"/>}
    </svg>
  );
};
const HighlighterIcon = ({color="#fde047", active=false}) => (
  <svg width="28" height="44" viewBox="0 0 24 42" style={{filter:active?"drop-shadow(0 2px 6px rgba(0,0,0,0.28))":"none"}}>
    <rect x="7" y="2" width="10" height="22" rx="2" fill={color} opacity="0.85" stroke="#d1ccc0" strokeWidth="0.5"/>
    <rect x="8" y="3" width="3" height="20" rx="1" fill="white" opacity="0.35"/>
    <polygon points="7,24 17,24 15,36 9,36" fill={color} opacity="0.7"/>
    <rect x="9" y="34" width="6" height="4" rx="1" fill={color}/>
    {active && <rect x="7" y="1" width="10" height="2" rx="1" fill="#7c3aed"/>}
  </svg>
);
const EraserIcon = ({active=false}) => (
  <svg width="32" height="32" viewBox="0 0 32 32" style={{filter:active?"drop-shadow(0 2px 6px rgba(0,0,0,0.28))":"none"}}>
    <rect x="4" y="10" width="24" height="14" rx="3" fill="#f0ebe3" stroke="#d1ccc0" strokeWidth="1"/>
    <rect x="4" y="10" width="11" height="14" rx="3" fill="#fca5a5"/>
    <rect x="4" y="20" width="24" height="4" rx="1" fill="#e2ddd6"/>
    {active && <rect x="4" y="9" width="24" height="2" rx="1" fill="#7c3aed"/>}
  </svg>
);

function DrawCanvas({ initialData, onSave, onClose }) {
  const canvasRef  = useRef(null);  // draw layer
  const bgRef      = useRef(null);  // background layer (lines)
  const historyRef = useRef([]);
  const hIdxRef    = useRef(-1);

  const TOOLS = [
    { id:"pencil",    label:"Pencil",     tip:"round",  size:2,  opacity:1,    color:"#1e293b" },
    { id:"pen",       label:"Pen",        tip:"ink",    size:2.5,opacity:1,    color:"#1e293b" },
    { id:"marker",    label:"Marker",     tip:"chisel", size:5,  opacity:0.95, color:"#1e293b" },
    { id:"brush",     label:"Brush",      tip:"brush",  size:8,  opacity:0.7,  color:"#1e293b" },
    { id:"hl_yellow", label:"HL Yellow",  tip:"flat",   size:14, opacity:0.35, color:"#fde047", hl:true },
    { id:"hl_green",  label:"HL Green",   tip:"flat",   size:14, opacity:0.35, color:"#86efac", hl:true },
    { id:"hl_pink",   label:"HL Pink",    tip:"flat",   size:14, opacity:0.35, color:"#f9a8d4", hl:true },
    { id:"eraser",    label:"Eraser",     tip:"flat",   size:18, opacity:1,    color:"#fef9ef", eraser:true },
  ];

  const [activeTool, setActiveTool] = useState("pen");
  const [toolColor,  setToolColor]  = useState({});  // per-tool color overrides
  const [showPicker, setShowPicker] = useState(null); // tool id showing color picker
  const [penSize,    setPenSize]    = useState(null);
  const painting = useRef(false);
  const lastXY   = useRef({x:0,y:0});

  const getTool = (id) => TOOLS.find(t=>t.id===(id||activeTool));

  const drawBg = (ctx,w,h) => {
    ctx.fillStyle="#fef9ef"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#ddd6c0"; ctx.lineWidth=0.8;
    for(let y=32;y<h;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.strokeStyle="#f0a0a0"; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(48,0);ctx.lineTo(48,h);ctx.stroke();
  };

  const saveHistory = () => {
    const c=canvasRef.current;
    historyRef.current=historyRef.current.slice(0,hIdxRef.current+1);
    historyRef.current.push(c.toDataURL());
    hIdxRef.current=historyRef.current.length-1;
  };

  // Merge bg + draw for final save
  const getMergedDataURL = () => {
    const bg=bgRef.current, draw=canvasRef.current;
    const merged=document.createElement("canvas");
    merged.width=draw.width; merged.height=draw.height;
    const ctx=merged.getContext("2d");
    ctx.drawImage(bg,0,0);
    ctx.drawImage(draw,0,0);
    return merged.toDataURL();
  };

  const undo = () => {
    if(hIdxRef.current<=0) return;
    hIdxRef.current--;
    const c=canvasRef.current,ctx=c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    if(historyRef.current[hIdxRef.current]){
      const img=new Image(); img.onload=()=>ctx.drawImage(img,0,0);
      img.src=historyRef.current[hIdxRef.current];
    }
  };

  useEffect(()=>{
    // Draw background lines on bg canvas
    const bg=bgRef.current,bgCtx=bg.getContext("2d");
    drawBg(bgCtx,bg.width,bg.height);
    // Draw layer: transparent by default
    const c=canvasRef.current,ctx=c.getContext("2d");
    if(initialData){const img=new Image();img.onload=()=>{ctx.drawImage(img,0,0);saveHistory();};img.src=initialData;}
    else saveHistory();
  },[]);

  const getXY=(e)=>{
    const r=canvasRef.current.getBoundingClientRect();
    const sx=canvasRef.current.width/r.width,sy=canvasRef.current.height/r.height;
    const s=e.touches?e.touches[0]:e;
    return{x:(s.clientX-r.left)*sx,y:(s.clientY-r.top)*sy};
  };

  const onStart=(e)=>{e.preventDefault();painting.current=true;lastXY.current=getXY(e);};
  const onMove=(e)=>{
    e.preventDefault();if(!painting.current)return;
    const tool=getTool();
    const ctx=canvasRef.current.getContext("2d"),pos=getXY(e);
    const color=tool.eraser?"#fef9ef":(toolColor[activeTool]||tool.color);
    const size=penSize??tool.size;
    ctx.beginPath();ctx.moveTo(lastXY.current.x,lastXY.current.y);ctx.lineTo(pos.x,pos.y);
    if(tool.eraser){
      ctx.globalCompositeOperation="destination-out";
      ctx.globalAlpha=1;
      ctx.strokeStyle="rgba(0,0,0,1)";
      ctx.lineWidth=size*2;
    } else if(tool.hl){
      ctx.globalCompositeOperation="multiply";
      ctx.globalAlpha=0.38;
      ctx.strokeStyle=color;
      ctx.lineWidth=size;
    } else {
      ctx.globalCompositeOperation="source-over";
      ctx.globalAlpha=tool.opacity;
      ctx.strokeStyle=color;
      ctx.lineWidth=size;
    }
    ctx.lineCap=tool.id==="marker"?"square":"round";
    ctx.lineJoin="round";
    ctx.stroke();
    ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
    lastXY.current=pos;
  };
  const onEnd=()=>{if(painting.current){painting.current=false;saveHistory();}};
  const clearAll=()=>{
    const c=canvasRef.current,ctx=c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    saveHistory();
  };

  const COLORS=["#1e293b","#dc2626","#2563eb","#16a34a","#7c3aed","#ea580c","#0891b2","#be185d","#78716c","#ffffff"];

  const curTool=getTool();
  const curColor=toolColor[activeTool]||curTool.color;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"white"}} onClick={()=>showPicker&&setShowPicker(null)}>

      {/* ── Apple-style pencil toolbar ── */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:4,
        padding:"6px 12px 0",background:"#f8f7f5",borderBottom:"1px solid #e2e8f0",
        position:"relative",minHeight:72}}>

        {TOOLS.map(t=>{
          const active=activeTool===t.id;
          const col=toolColor[t.id]||t.color;
          return(
            <div key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",
              cursor:"pointer",transform:active?"translateY(-6px)":"translateY(0)",
              transition:"transform .18s ease",position:"relative"}}
              onClick={e=>{
                e.stopPropagation();
                if(activeTool===t.id && !t.eraser){setShowPicker(p=>p===t.id?null:t.id);}
                else{setActiveTool(t.id);setShowPicker(null);}
              }}>
              {t.eraser
                ? <EraserIcon active={active}/>
                : t.hl
                  ? <HighlighterIcon color={col} active={active}/>
                  : <PencilIcon color={col} tip={t.tip} active={active}/>}

              {/* color picker dropdown */}
              {showPicker===t.id&&(
                <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",
                  background:"white",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.18)",
                  padding:8,display:"flex",flexWrap:"wrap",gap:5,width:120,zIndex:99,marginTop:4}}
                  onClick={e=>e.stopPropagation()}>
                  {COLORS.map(c=>(
                    <div key={c} onClick={()=>{setToolColor(p=>({...p,[t.id]:c}));setShowPicker(null);}}
                      style={{width:20,height:20,borderRadius:"50%",background:c,cursor:"pointer",
                        border:col===c?"2.5px solid #7c3aed":"1.5px solid #e2e8f0",
                        boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* divider */}
        <div style={{width:1,height:40,background:"#e2e8f0",margin:"0 4px",alignSelf:"center"}}/>

        {/* Eraser size / pen size slider */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,paddingBottom:6}}>
          <input type="range" min={1} max={20} value={penSize??curTool.size}
            onChange={e=>setPenSize(+e.target.value)}
            style={{width:60,accentColor:"#7c3aed",writing:"horizontal-tb"}}/>
          <span style={{fontSize:9,color:"#94a3b8"}}>{penSize??curTool.size}px</span>
        </div>

        {/* undo */}
        <button onClick={undo} title="Undo"
          style={{padding:"5px 8px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",
            cursor:"pointer",fontSize:16,alignSelf:"center",marginBottom:6}}>↩</button>

        {/* clear */}
        <button onClick={clearAll}
          style={{padding:"5px 8px",borderRadius:8,border:"none",background:"#fef2f2",
            color:"#dc2626",cursor:"pointer",fontSize:12,fontWeight:700,alignSelf:"center",marginBottom:6}}>🗑</button>

        <div style={{flex:1}}/>

        {/* save / close */}
        <button onClick={()=>onSave(getMergedDataURL())}
          style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",
            cursor:"pointer",background:"#7c3aed",color:"white",alignSelf:"center",marginBottom:6}}>✓ Хадгалах</button>
        <button onClick={onClose}
          style={{padding:"6px 10px",borderRadius:8,fontSize:12,border:"1px solid #e2e8f0",
            background:"white",cursor:"pointer",color:"#64748b",alignSelf:"center",marginBottom:6}}>✕</button>
      </div>

      <div style={{flex:1,position:"relative"}}>
        <canvas ref={bgRef} width={900} height={520}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>
        <canvas ref={canvasRef} width={900} height={520}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",
            cursor:curTool.eraser?"cell":"crosshair",touchAction:"none"}}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}/>
      </div>
    </div>
  );
}

/* ════════════ NOTE EDITOR ════════════ */
function NoteEditor({ note, subjects, onSave, onClose, onDelete }) {
  const { theme, lang } = useSettings();
  const [title,     setTitle]     = useState(note.title || "");
  const [coverIdx,  setCoverIdx]  = useState(note.coverIdx ?? 0);
  const [pageColor, setPageColor] = useState(note.pageColor || PAGE_COLORS[0]);
  const [pagePattern, setPagePattern] = useState(note.pagePattern || 'lines');
  const [font,      setFont]      = useState(note.font || "caveat");
  const [subjectId, setSubjectId] = useState(note.subjectId || null);
  const [drawMode,  setDrawMode]  = useState(false);
  const [drawing,   setDrawing]   = useState(note.drawing || null);
  const [images,    setImages]    = useState(note.images || []);
  const [imgPos,    setImgPos]    = useState(note.imgPos || []);
  const [coverImg,  setCoverImg]  = useState(note.coverImg || null);
  const coverImgRef = useRef(null);
  const dragInfo = useRef(null);
  const [activeHL,  setActiveHL]  = useState(null);
  const [activeTc,  setActiveTc]  = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [stickerPickerPos, setStickerPickerPos] = useState({ top: 0, right: 0 });
  const [floatStickers, setFloatStickers] = useState(note.floatStickers || []);
  const [selectedFloatId, setSelectedFloatId] = useState(null);
  const draggingRef = useRef(null);
  const frameRef = useRef(null);
  const noteAreaRef = useRef(null);
  const stickerBtnRef = useRef(null);
  const editorRef = useRef(null);
  const imgRef    = useRef(null);
  const cv        = COVERS[coverIdx];
  const fontObj   = FONTS.find(f=>f.id===font) || FONTS[0];
  const selectedFloat = useMemo(
    () => floatStickers.find(item => item.id === selectedFloatId),
    [floatStickers, selectedFloatId]
  );
  const mediaCount = floatStickers.length + (drawing ? 1 : 0);

  useEffect(() => {
    if (editorRef.current && note.html) editorRef.current.innerHTML = note.html;
    setTimeout(() => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      const r=document.createRange(); r.selectNodeContents(editorRef.current); r.collapse(false);
      window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
    }, 80);
  }, []);

  useEffect(() => { if (editorRef.current) editorRef.current.style.fontFamily=fontObj.style; }, [fontObj.style]);

  const handleSave = () => {
    const html=editorRef.current?.innerHTML||"", plain=editorRef.current?.innerText||"";
    if (!title.trim()&&!plain.trim()) return toast.error("Гарчиг эсвэл агуулга оруулна уу");
    const hasFloatingImage = floatStickers.some(item => item.imgSrc);
    onSave({ ...note, title, html, plainText:plain.slice(0,120), coverIdx, pageColor, font,
      subjectId, drawing, images, imgPos, coverImg, pagePattern, floatStickers,
      hasDrawing:!!drawing, hasImage:images.length>0 || hasFloatingImage,
      createdAt:note.createdAt||new Date().toISOString() });
    toast.success("Хадгалагдлаа ✓");
  };

  const savedRange = useRef(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange.current);
  };

  const insertSvgSticker = (svgStr) => {
    setShowStickerPicker(false);
    // drop near center of note area with slight randomness
    const area = noteAreaRef.current;
    const aw = area ? area.offsetWidth  : 500;
    const ah = area ? area.offsetHeight : 400;
    const x = aw / 2 - 32 + (Math.random() - 0.5) * 120;
    const y = ah / 2 - 32 + (Math.random() - 0.5) * 80;
    const id = Date.now();
    setFloatStickers(prev => [...prev, { id, svg: svgStr, x, y, size: 72, rot: (Math.random()-0.5)*16 }]);
    setSelectedFloatId(id);
  };

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const patchFloatingSticker = (id, patch) => {
    setFloatStickers(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const constrainFloatPatch = (item, patch) => {
    const area = noteAreaRef.current;
    const size = clamp(patch.size ?? item.size ?? 72, FLOAT_MIN_SIZE, FLOAT_MAX_SIZE);
    const maxX = Math.max(0, (area?.scrollWidth || area?.offsetWidth || 900) - size);
    const maxY = Math.max(0, (area?.scrollHeight || area?.offsetHeight || 600) - size);
    return {
      ...patch,
      ...(patch.size != null ? { size } : null),
      ...(patch.x != null ? { x: clamp(patch.x, -size * 0.55, maxX + size * 0.35) } : null),
      ...(patch.y != null ? { y: clamp(patch.y, -size * 0.55, maxY + size * 0.35) } : null),
    };
  };

  const scheduleFloatingPatch = (id, patch) => {
    const item = floatStickers.find(s => s.id === id);
    const nextPatch = item ? constrainFloatPatch(item, patch) : patch;
    draggingRef.current = { ...(draggingRef.current || {}), nextPatch };
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const d = draggingRef.current;
      if (!d?.nextPatch) return;
      patchFloatingSticker(id, d.nextPatch);
    });
  };

  const startStickerDrag = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFloatId(id);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const sticker = floatStickers.find(s => s.id === id);
    if (!sticker) return;
    draggingRef.current = {
      mode: "drag",
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: sticker.x,
      origY: sticker.y,
    };
  };

  const startStickerResize = (e, s) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFloatId(s.id);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const host = e.currentTarget.closest(".float-sticker");
    const rect = host?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : e.clientX;
    const cy = rect ? rect.top + rect.height / 2 : e.clientY;
    const startDistance = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
    draggingRef.current = {
      mode: "resize",
      id: s.id,
      cx,
      cy,
      startDistance,
      startSize: s.size,
    };
  };

  const startStickerRotate = (e, s) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFloatId(s.id);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const el = e.currentTarget.closest(".float-sticker");
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    draggingRef.current = {
      mode: "rotate",
      id: s.id,
      cx,
      cy,
      startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI,
      startRot: s.rot || 0,
    };
  };

  const onStickerPointerMove = (e) => {
    const d = draggingRef.current;
    if (!d) return;
    e.preventDefault();
    if (d.mode === "drag") {
      scheduleFloatingPatch(d.id, {
        x: d.origX + e.clientX - d.startX,
        y: d.origY + e.clientY - d.startY,
      });
      return;
    }
    if (d.mode === "resize") {
      const distance = Math.hypot(e.clientX - d.cx, e.clientY - d.cy) || 1;
      scheduleFloatingPatch(d.id, { size: d.startSize * (distance / d.startDistance) });
      return;
    }
    if (d.mode === "rotate") {
      const angle = Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * 180 / Math.PI;
      scheduleFloatingPatch(d.id, { rot: d.startRot + (angle - d.startAngle) });
    }
  };

  const endStickerPointer = (e) => {
    if (!draggingRef.current) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    draggingRef.current = null;
  };

  const onStickerWheel = (e, id) => {
    if (!e.ctrlKey) return; // энгийн scroll дамжуулна
    e.preventDefault();
    const delta = e.deltaY > 0 ? -8 : 8;
    setFloatStickers(prev => prev.map(s =>
      s.id === id ? { ...s, size: clamp(s.size + delta, FLOAT_MIN_SIZE, FLOAT_MAX_SIZE) } : s
    ));
  };

  const nudgeSelectedFloat = (patch) => {
    if (!selectedFloatId) return;
    setFloatStickers(prev => prev.map(s => {
      if (s.id !== selectedFloatId) return s;
      const nextPatch = typeof patch === "function" ? patch(s) : patch;
      return { ...s, ...constrainFloatPatch(s, nextPatch) };
    }));
  };

  const deleteFloatSticker = (id) => {
    setFloatStickers(prev => prev.filter(s => s.id !== id));
    if (selectedFloatId === id) setSelectedFloatId(null);
  };

  const applyHL = (c) => {
    restoreSelection();
    setActiveHL(c);
    wrapSelection("backgroundColor", c, editorRef.current);
    editorRef.current?.focus();
  };
  const applyTC = (c) => { setActiveTc(c); wrapSelection("color",c); editorRef.current?.focus(); };
  const compressImage = (file, maxW=600, maxH=500, quality=0.72) => new Promise(res=>{
    const rd=new FileReader();
    rd.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        let {width:w,height:h}=img;
        const scale=Math.min(1,maxW/w,maxH/h);
        w=Math.round(w*scale); h=Math.round(h*scale);
        const cv=document.createElement("canvas");
        cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        res(cv.toDataURL("image/jpeg",quality));
      };
      img.src=ev.target.result;
    };
    rd.readAsDataURL(file);
  });

  const addImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("10MB-с бага зураг оруулна уу");
    e.target.value = "";
    const src = await compressImage(file);
    const area = noteAreaRef.current;
    const aw = area ? area.offsetWidth  : 500;
    const ah = area ? area.offsetHeight : 400;
    const w = 200;
    const x = aw / 2 - w / 2 + (Math.random() - 0.5) * 80;
    const y = ah / 2 - 80  + (Math.random() - 0.5) * 60;
    const id = Date.now();
    setFloatStickers(prev => [...prev, {
      id, imgSrc: src,
      x, y, size: w, rot: (Math.random() - 0.5) * 6,
    }]);
    setSelectedFloatId(id);
  };
  const [fmtState, setFmtState] = useState({ bold:false, italic:false, underline:false, strikeThrough:false });

  const updateFmtState = () => {
    setFmtState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
    });
  };

  const applyFmt = (e, cmd) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed;
    if (!hasSelection) {
      // сонголт байхгүй бол editor-г focus хийгээд бүх текстийг сонгоно
      editor.focus();
      const range = document.createRange();
      range.selectNodeContents(editor);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    document.execCommand(cmd, false, null);
    if (!hasSelection) {
      // сонголтыг буцааж арилгана, cursor-г төгсгөлд тавина
      sel.removeAllRanges();
      const r2 = document.createRange();
      r2.selectNodeContents(editor);
      r2.collapse(false);
      sel.addRange(r2);
    }
    editor.focus();
    updateFmtState();
  };

  const BtnFmt = ({ cmd, label, style={} }) => {
    const active = fmtState[cmd];
    return (
      <button className="ne-control" onMouseDown={e=>applyFmt(e, cmd)}
        style={{ width:26,height:26,borderRadius:5,fontSize:12,
          border: active ? "1.5px solid #7c3aed" : "1px solid #e2e8f0",
          background: active ? "#ede9fe" : "white",
          cursor:"pointer", color: active ? "#7c3aed" : "#475569",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:600, ...style }}>{label}</button>
    );
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",background:pageColor,position:"relative" }}
      onClick={() => showStickerPicker && setShowStickerPicker(false)}>
      <style>{`
        .ne-body{outline:none;min-height:100%;caret-color:#7c3aed;overflow:hidden;text-underline-offset:3px;text-decoration-thickness:1.5px}
        .ne-body:empty::before{content:attr(data-placeholder);color:#bbb;pointer-events:none;display:block}
        .ne-body ul{list-style:disc;padding-left:22px}
        .ne-body ol{list-style:decimal;padding-left:22px}
        .ne-body span[data-imgid]{transition:opacity .15s}
        .ne-body span[data-imgid]:hover img{box-shadow:0 0 0 2.5px #7c3aed,0 4px 16px rgba(0,0,0,0.18)!important}
        .ne-control{transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease,background .14s ease}
        .ne-control:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(15,23,42,0.1)}
        .ne-swatch:hover{transform:scale(1.14)}
        .float-sticker{will-change:transform}
        .float-sticker:hover{z-index:99!important}
        .float-sticker:hover .float-sticker-del{display:flex!important}
        .float-sticker.is-selected{z-index:100!important}
        .float-sticker.is-selected .float-sticker-del{display:flex!important}
        .float-sticker.is-selected img{box-shadow:0 10px 26px rgba(15,23,42,0.24),0 0 0 2px rgba(255,255,255,0.92)!important}
        .float-sticker:active{cursor:grabbing!important}
        .float-sticker-toolbar button:hover{background:#ede9fe!important;color:#6d28d9!important}
        .float-sticker-handle:hover{transform:scale(1.08)}
      `}</style>

      {/* cover bar */}
      <div style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 12px",
        background: coverImg ? `url(${coverImg}) center/cover` : `linear-gradient(to right,${cv.bg},${cv.bg2})`,
        flexWrap:"wrap", position:"relative" }}>
        {coverImg && <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.32)",borderRadius:0 }}/>}
        <div style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",width:"100%" }}>
        {COVERS.map((c,i)=>(
          <button key={c.id} className="ne-control" onClick={()=>setCoverIdx(i)}
            style={{ width:16,height:20,borderRadius:3,flexShrink:0,cursor:"pointer",
              background:`linear-gradient(135deg,${c.bg},${c.bg2})`,
              border:coverIdx===i?"2.5px solid white":"1.5px solid rgba(0,0,0,0.18)",
              transform:coverIdx===i?"scale(1.2)":"scale(1)",transition:"transform .1s" }}/>
        ))}
        <div style={{ width:1,height:16,background:"rgba(255,255,255,0.35)",margin:"0 3px" }}/>
        {PAGE_COLORS.map(c=>(
          <button key={c} className="ne-swatch" onClick={()=>setPageColor(c)}
            style={{ width:13,height:13,borderRadius:"50%",flexShrink:0,cursor:"pointer",background:c,
              border:pageColor===c?"2px solid #475569":"1px solid rgba(0,0,0,0.2)",transition:"transform .14s ease" }}/>
        ))}
        <div style={{ width:1,height:16,background:"rgba(255,255,255,0.35)",margin:"0 3px" }}/>
        {[
          { id:"lines",  label:"≡" },
          { id:"grid",   label:"⊞" },
          { id:"dots",   label:"⁘" },
          { id:"none",   label:"□" },
        ].map(p=>(
          <button key={p.id} className="ne-control" onClick={()=>setPagePattern(p.id)}
            title={p.id}
            style={{ width:20,height:20,borderRadius:4,flexShrink:0,cursor:"pointer",fontSize:12,
              fontWeight:700,border:pagePattern===p.id?"2px solid white":"1px solid rgba(255,255,255,0.4)",
              background:pagePattern===p.id?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.15)",
              color:"white",display:"flex",alignItems:"center",justifyContent:"center" }}>{p.label}</button>
        ))}
        <div style={{ flex:1 }}/>
        <button className="ne-control" onClick={()=>coverImgRef.current?.click()}
          style={{ background:"rgba(255,255,255,0.25)",border:"1px solid rgba(255,255,255,0.5)",borderRadius:6,
            padding:"3px 9px",color:"white",cursor:"pointer",fontSize:12,fontWeight:600 }}>
          🖼 Cover
        </button>
        {coverImg && (
          <button className="ne-control" onClick={()=>{
            setCoverImg(null);
            const html=editorRef.current?.innerHTML||"", plain=editorRef.current?.innerText||"";
            onSave({ ...note, title, html, plainText:plain.slice(0,120), coverIdx, pageColor, font,
              subjectId, drawing, images, imgPos, coverImg:null, pagePattern, hasDrawing:!!drawing, hasImage:images.length>0,
              createdAt:note.createdAt||new Date().toISOString() });
          }}
            style={{ background:"rgba(220,38,38,0.7)",border:"none",borderRadius:6,
              padding:"3px 8px",color:"white",cursor:"pointer",fontSize:11 }}>✕ Cover</button>
        )}
        <input ref={coverImgRef} type="file" accept="image/*" style={{ display:"none" }}
          onChange={async e=>{ const f=e.target.files?.[0]; if(!f) return;
            e.target.value="";
            const imgData=await compressImage(f,800,400,0.8);
            setCoverImg(imgData);
            const html=editorRef.current?.innerHTML||"", plain=editorRef.current?.innerText||"";
            onSave({ ...note, title, html, plainText:plain.slice(0,120), coverIdx, pageColor, font,
              subjectId, drawing, images, imgPos, coverImg:imgData, pagePattern, hasDrawing:!!drawing, hasImage:images.length>0,
              createdAt:note.createdAt||new Date().toISOString() });
          }}/>
        <button onClick={onClose} style={{ background:"rgba(0,0,0,0.18)",border:"none",borderRadius:6,padding:"3px 9px",color:"white",cursor:"pointer",fontSize:13 }}>✕</button>
        </div>
      </div>

      {/* toolbar */}
      <div style={{ display:"flex",alignItems:"center",gap:4,padding:"6px 10px",
        background:"rgba(255,255,255,0.85)",borderBottom:"1px solid rgba(0,0,0,0.07)",
        flexWrap:"wrap",backdropFilter:"blur(8px)",
        position:"relative", zIndex:20 }}>
        {/* subject picker */}
        <select className="ne-control" value={subjectId||""} onChange={e=>setSubjectId(e.target.value||null)}
          style={{ fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 6px",
            background:"white",cursor:"pointer",color:"#334155",maxWidth:110 }}>
          <option value="">📁 Subject</option>
          {subjects.map(s=>{ const th=SUBJECT_THEMES.find(t=>t.id===s.themeId)||SUBJECT_THEMES[0];
            return <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>; })}
        </select>
        <div style={{ width:1,height:22,background:"#e2e8f0" }}/>
        {/* font */}
        <select className="ne-control" value={font} onChange={e=>setFont(e.target.value)}
          style={{ fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 6px",
            background:"white",cursor:"pointer",color:"#334155",maxWidth:90,fontFamily:fontObj.style }}>
          {FONTS.map(f=><option key={f.id} value={f.id} style={{ fontFamily:f.style }}>{f.label}</option>)}
        </select>
        <div style={{ width:1,height:22,background:"#e2e8f0" }}/>
        <BtnFmt cmd="bold"          label="B" style={{ fontWeight:900 }}/>
        <BtnFmt cmd="italic"        label="I" style={{ fontStyle:"italic" }}/>
        <BtnFmt cmd="underline"     label="U" style={{ textDecoration:"underline" }}/>
        <BtnFmt cmd="strikeThrough" label="S" style={{ textDecoration:"line-through" }}/>
        <div style={{ width:1,height:22,background:"#e2e8f0" }}/>
        <button className="ne-control" onMouseDown={e=>{ e.preventDefault(); document.execCommand("insertUnorderedList",false,null); editorRef.current?.focus(); }}
          style={{ width:26,height:26,borderRadius:5,fontSize:14,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",color:"#475569",display:"flex",alignItems:"center",justifyContent:"center" }}>•≡</button>
        <button className="ne-control" onMouseDown={e=>{ e.preventDefault(); document.execCommand("insertOrderedList",false,null); editorRef.current?.focus(); }}
          style={{ width:26,height:26,borderRadius:5,fontSize:10,fontWeight:700,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",color:"#475569",display:"flex",alignItems:"center",justifyContent:"center" }}>1.</button>
        <div style={{ width:1,height:22,background:"#e2e8f0" }}/>
        <span style={{ fontSize:10,color:"#94a3b8",fontWeight:700 }}>HL</span>
        {HIGHLIGHTS.map(c=>(
          <button key={c} className="ne-swatch"
            onMouseDown={e=>{ saveSelection(); e.preventDefault(); }}
            onMouseUp={e=>{ e.preventDefault(); applyHL(c); }}
            style={{ width:18,height:18,borderRadius:3,flexShrink:0,cursor:"pointer",background:c,
              border:activeHL===c?"2.5px solid #475569":"1.5px solid rgba(0,0,0,0.15)" }}/>
        ))}
        <button className="ne-control"
          onMouseDown={e=>{ saveSelection(); e.preventDefault(); }}
          onMouseUp={e=>{ e.preventDefault(); restoreSelection(); wrapSelection("backgroundColor","transparent",editorRef.current); editorRef.current?.focus(); }}
          style={{ width:18,height:18,borderRadius:3,border:"1.5px solid #e2e8f0",background:"white",cursor:"pointer",
            fontSize:10,color:"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900 }}>✕</button>

        <div style={{ flex:1 }}/>
        <button className="ne-control" onClick={()=>setDrawMode(true)}
          style={{ padding:"4px 9px",borderRadius:6,fontSize:11,border:"1px solid #e2e8f0",
            background:drawing?"#7c3aed":"white",color:drawing?"white":"#64748b",cursor:"pointer",fontWeight:600 }}>
          ✏️ {lang==="mn"?"Зурах":"Draw"}
        </button>
        <button className="ne-control" onClick={()=>imgRef.current?.click()}
          style={{ padding:"4px 9px",borderRadius:6,fontSize:11,border:"1px solid #e2e8f0",
            background:"white",color:"#64748b",cursor:"pointer",fontWeight:600 }}>
          🖼 {lang==="mn"?"Зураг":"Image"}
        </button>
        <input ref={imgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={addImage}/>

        {/* Sticker button */}
        <div style={{ position:"relative" }}>
          <button ref={stickerBtnRef}
            className="ne-control"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              saveSelection();
              if (showStickerPicker) {
                setShowStickerPicker(false);
              } else {
                const rect = stickerBtnRef.current?.getBoundingClientRect();
                if (rect) setStickerPickerPos({
                  top: rect.bottom + 6,
                  left: Math.max(8, Math.min(rect.right - 300, window.innerWidth - 316)),
                });
                setShowStickerPicker(true);
              }
            }}
            style={{
              padding:"4px 9px", borderRadius:6, fontSize:11,
              border:"1px solid #e2e8f0",
              background: showStickerPicker ? "#fef3c7" : "white",
              color:"#64748b", cursor:"pointer", fontWeight:600,
            }}>
            ✨ {lang==="mn"?"Стикер":"Sticker"}
          </button>

          {showStickerPicker && createPortal(
            <div
              onMouseDown={e => e.stopPropagation()}
              style={{
                position:"fixed",
                top: stickerPickerPos.top,
                left: stickerPickerPos.left,
                background:"white", borderRadius:16,
                boxShadow:"0 16px 48px rgba(0,0,0,0.24)",
                border:"1px solid #e2e8f0", zIndex:999999,
                width:308, padding:14,
                maxHeight:400, overflowY:"auto",
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#64748b" }}>✨ СТИКЕР</span>
                <button onMouseDown={e => { e.preventDefault(); setShowStickerPicker(false); }}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:20, lineHeight:1, padding:"0 4px" }}>×</button>
              </div>
              {SVG_STICKERS.map(set => (
                <div key={set.label} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:set.color, flexShrink:0 }}/>
                    <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>{set.label}</span>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {set.items.map((svg, i) => (
                      <button key={i}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); insertSvgSticker(svg); }}
                        style={{
                          width:46, height:46, borderRadius:10, cursor:"pointer",
                          border:"2px solid transparent", background:"#f8fafc",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          padding:3, outline:"none", flexShrink:0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=set.color; e.currentTarget.style.background="#f0f9ff"; e.currentTarget.style.transform="scale(1.12)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.transform="scale(1)"; }}>
                        <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                          style={{ width:38, height:38, pointerEvents:"none", display:"block" }}
                          draggable={false} alt=""/>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>,
            document.body
          )}
        </div>
        {mediaCount > 0 && (
          <span style={{ display:"flex",alignItems:"center",gap:5,
            padding:"4px 8px",borderRadius:999,background:"rgba(124,58,237,0.09)",
            border:"1px solid rgba(124,58,237,0.18)",color:"#6d28d9",
            fontSize:11,fontWeight:800,whiteSpace:"nowrap" }}>
            {mediaCount} media
          </span>
        )}
      </div>

      {drawMode && (
        <div style={{ position:"absolute",inset:0,zIndex:100,display:"flex",flexDirection:"column",background:"white" }}>
          <DrawCanvas initialData={drawing} onSave={d=>{ setDrawing(d); setDrawMode(false); }} onClose={()=>setDrawMode(false)}/>
        </div>
      )}

      <div ref={noteAreaRef}
        onMouseDown={e => {
          if (!e.target.closest(".float-sticker") && !e.target.closest(".ne-body") && e.target.tagName !== "INPUT") {
            setSelectedFloatId(null);
          }
        }}
        style={{ flex:1,overflowY:"auto",position:"relative",
          backgroundImage:
            pagePattern==="lines" ? "repeating-linear-gradient(transparent,transparent 31px,#ddd6c0 31px,#ddd6c0 32px)" :
            pagePattern==="grid"  ? "repeating-linear-gradient(transparent,transparent 27px,#ddd6c0 27px,#ddd6c0 28px),repeating-linear-gradient(90deg,transparent,transparent 27px,#ddd6c0 27px,#ddd6c0 28px)" :
            pagePattern==="dots"  ? "radial-gradient(circle,#c8b89a 1px,transparent 1px)" :
            "none",
          backgroundSize:
            pagePattern==="lines" ? "100% 32px" :
            pagePattern==="grid"  ? "28px 28px" :
            pagePattern==="dots"  ? "28px 28px" :
            "auto" }}>
        <div style={{ position:"sticky",top:0,left:0,right:0,height:0,pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:0,bottom:-9999,left:52,width:1,
            background:pagePattern==="none"?"transparent":"rgba(240,100,100,0.4)" }}/>
        </div>
        <div style={{ padding:"14px 20px 80px 60px",position:"relative",minHeight:"100%" }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Гарчиг..."
            style={{ display:"block",width:"100%",background:"transparent",border:"none",outline:"none",
              fontFamily:fontObj.style,fontSize:22,fontWeight:700,color:"#2d2a26",marginBottom:10,
              borderBottom:"1.5px dashed #c8b89a",paddingBottom:6 }}/>
          {drawing && !drawMode && (
            <div style={{ marginBottom:10,position:"relative",display:"inline-block" }}>
              <img src={drawing} alt="drawing" style={{ maxWidth:"100%",borderRadius:8,boxShadow:"0 2px 12px rgba(0,0,0,0.1)",border:"1px solid #e2e8f0" }}/>
              <button onClick={()=>setDrawMode(true)} style={{ position:"absolute",top:6,right:56,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:5,color:"white",fontSize:11,padding:"3px 7px",cursor:"pointer" }}>✏️ Засах</button>
              <button onClick={()=>setDrawing(null)} style={{ position:"absolute",top:6,right:6,background:"rgba(220,38,38,0.7)",border:"none",borderRadius:5,color:"white",fontSize:11,padding:"3px 7px",cursor:"pointer" }}>✕ Устгах</button>
            </div>
          )}

          <div ref={editorRef} contentEditable suppressContentEditableWarning
            data-placeholder="Энд бичих..." className="ne-body"
            onKeyUp={updateFmtState} onMouseUp={updateFmtState}
            onClick={e=>{
              // Delete button inside floated image spans
              if(e.target.tagName==="BUTTON" && e.target.closest("span[data-imgid]")){
                e.preventDefault();
                e.stopPropagation();
                e.target.closest("span[data-imgid]").remove();
              }
            }}
            style={{ fontFamily:fontObj.style,fontSize:17,lineHeight:"32px",color:"#2d2a26",textDecorationThickness:"1.5px",textUnderlineOffset:"3px" }}/>
        </div>

        {/* ── Floating draggable stickers + images layer ── */}
        {floatStickers.map(s => (
          <div key={s.id}
            className={`float-sticker ${selectedFloatId === s.id ? "is-selected" : ""}`}
            style={{
              position:"absolute", left:s.x, top:s.y,
              width:s.size, height:s.imgSrc ? "auto" : s.size,
              cursor:"grab", userSelect:"none", touchAction:"none",
              transform:`translate3d(0,0,0) rotate(${s.rot||0}deg)`,
              transformOrigin:"center center",
              transition:"box-shadow 0.15s, filter 0.15s",
              zIndex:50,
              borderRadius: s.imgSrc ? 10 : 0,
              paddingTop:26, marginTop:-26, // hover area дээш өргөтгөх
              boxSizing:"content-box",
              outline: selectedFloatId === s.id ? "2px dashed rgba(124,58,237,0.65)" : "none",
              outlineOffset:3,
            }}
            onPointerDown={e => startStickerDrag(e, s.id)}
            onPointerMove={onStickerPointerMove}
            onPointerUp={endStickerPointer}
            onPointerCancel={endStickerPointer}
            onWheel={e => onStickerWheel(e, s.id)}>
            {s.imgSrc ? (
              <img
                src={s.imgSrc}
                style={{ width:"100%", height:"auto", display:"block", pointerEvents:"none",
                  borderRadius:10, boxShadow:"0 4px 18px rgba(0,0,0,0.22)",
                  border:"3px solid white" }}
                draggable={false} alt=""
              />
            ) : (
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(s.svg)}`}
                style={{ width:"100%", height:"100%", display:"block", pointerEvents:"none",
                  filter:"drop-shadow(0 3px 8px rgba(0,0,0,0.22))" }}
                draggable={false} alt=""
              />
            )}
            {selectedFloatId === s.id && (
              <div
                className="float-sticker-del float-sticker-toolbar"
                onPointerDown={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
                style={{ position:"absolute",top:-38,left:"50%",transform:"translateX(-50%)",
                  display:"flex",alignItems:"center",gap:5,padding:"4px 6px",borderRadius:10,
                  background:"rgba(15,23,42,0.94)",boxShadow:"0 8px 24px rgba(0,0,0,0.28)",
                  zIndex:12,backdropFilter:"blur(8px)" }}>
                <span style={{ color:"white",fontSize:10,fontWeight:800,padding:"0 4px",whiteSpace:"nowrap",
                  opacity:.9 }}>
                  {selectedFloat?.imgSrc ? "Image" : "Sticker"} {Math.round(s.size)}px
                </span>
                {[
                  { label:"-", title:"Smaller", action:()=>nudgeSelectedFloat(item=>({ size:item.size-12 })) },
                  { label:"+", title:"Bigger", action:()=>nudgeSelectedFloat(item=>({ size:item.size+12 })) },
                  { label:"↺", title:"Rotate left", action:()=>nudgeSelectedFloat(item=>({ rot:(item.rot||0)-10 })) },
                  { label:"↻", title:"Rotate right", action:()=>nudgeSelectedFloat(item=>({ rot:(item.rot||0)+10 })) },
                  { label:"0", title:"Reset rotation", action:()=>nudgeSelectedFloat({ rot:0 }) },
                ].map(btn => (
                  <button key={btn.title} title={btn.title}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); btn.action(); }}
                    style={{ width:24,height:24,borderRadius:7,border:"none",background:"white",
                      color:"#334155",fontSize:12,fontWeight:900,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
            {/* delete */}
            <button
              className="float-sticker-del"
              onPointerDown={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.preventDefault(); e.stopPropagation(); deleteFloatSticker(s.id); }}
              title="Delete"
              style={{ position:"absolute",top:-12,right:-12,width:26,height:26,borderRadius:"50%",
                background:"#ef4444",border:"2.5px solid white",color:"white",fontSize:15,
                cursor:"pointer",display:"none",alignItems:"center",justifyContent:"center",
                boxShadow:"0 6px 14px rgba(0,0,0,0.28)",fontWeight:900,lineHeight:1,zIndex:13 }}>
              ×
            </button>
            {/* resize handle — bottom-right */}
            <div
              className="float-sticker-del float-sticker-handle"
              title="Resize"
              style={{ position:"absolute",bottom:-8,right:-8,width:20,height:20,borderRadius:6,
                background:"linear-gradient(135deg,#ffffff 0%,#ffffff 52%,#c4b5fd 53%,#7c3aed 100%)",
                border:"2px solid white",cursor:"se-resize",
                display:"none",zIndex:12,touchAction:"none",boxShadow:"0 4px 12px rgba(0,0,0,0.24)",
                transition:"transform .14s ease" }}
              onPointerDown={e => startStickerResize(e, s)}
              onPointerMove={onStickerPointerMove}
              onPointerUp={endStickerPointer}
              onPointerCancel={endStickerPointer}
            />
            {/* rotate handle — top-center */}
            <div
              className="float-sticker-del float-sticker-handle"
              title="Эргүүлэх"
              style={{ position:"absolute",top:-2,left:"50%",transform:"translateX(-50%)",
                width:24,height:24,borderRadius:"50%",
                background:"white",border:"2px solid #7c3aed",cursor:"grab",
                display:"none",zIndex:12,boxShadow:"0 4px 12px rgba(0,0,0,0.22)",
                alignItems:"center",justifyContent:"center",fontSize:13,touchAction:"none",
                color:"#6d28d9",fontWeight:900 }}
              onPointerDown={e => startStickerRotate(e, s)}
              onPointerMove={onStickerPointerMove}
              onPointerUp={endStickerPointer}
              onPointerCancel={endStickerPointer}>
              ↻
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 14px",background:"rgba(255,255,255,0.9)",borderTop:"1px solid rgba(0,0,0,0.07)",
        backdropFilter:"blur(10px)",boxShadow:"0 -8px 24px rgba(15,23,42,0.05)" }}>
        {note.id ? (
          <button className="ne-control" onClick={()=>{ onDelete(note.id); onClose(); }}
            style={{ background:"#fff1f2",border:"1px solid #fecdd3",borderRadius:9,
              padding:"7px 12px",cursor:"pointer",color:"#e11d48",fontSize:12,fontWeight:800 }}>
            🗑 {lang==="mn"?"Устгах":"Delete"}
          </button>
        ) : <div/>}
        <button className="ne-control" onClick={handleSave}
          style={{ background:theme.accent,color:"white",border:"none",padding:"10px 28px",
            borderRadius:11,fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:`0 8px 20px ${theme.accent}42` }}>
          💾 {lang==="mn"?"Хадгалах":"Save"}
        </button>
      </div>
    </div>
  );
}

/* ════════════ NOTE CARD ════════════ */
function NoteCard({ note, idx, onClick }) {
  const cv = COVERS[note.coverIdx ?? (idx % COVERS.length)];
  const floatingPreview = note.floatStickers?.find(item => item.imgSrc)?.imgSrc;
  return (
    <div onClick={onClick}
      style={{
        cursor:"pointer", borderRadius:14, overflow:"hidden",
        background:"white", border:"1px solid #e8e3dc",
        boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
        transition:"transform .2s ease, box-shadow .2s ease",
        display:"flex", flexDirection:"column",
      }}
      onMouseEnter={e=>{
        e.currentTarget.style.transform="translateY(-4px)";
        e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.transform="translateY(0)";
        e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)";
      }}>

      {/* ── Thumbnail ── */}
      <div style={{
        height:110, background:`linear-gradient(135deg,${cv.bg},${cv.bg2})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden",
      }}>
        {note.coverImg ? (
          <img src={note.coverImg} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        ) : note.drawing ? (
          <img src={note.drawing} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        ) : floatingPreview ? (
          <img src={floatingPreview} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        ) : note.images && note.images[0] ? (
          <img src={note.images[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        ) : (
          <span style={{ fontSize:38, opacity:0.75 }}>{cv.deco[0]||"📝"}</span>
        )}
        <div style={{
          position:"absolute", top:7, left:7,
          background:"rgba(255,255,255,0.82)", borderRadius:20,
          padding:"2px 8px", fontSize:11, fontWeight:700,
          color:cv.spine,
        }}>
          {cv.deco[1]||"📌"}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding:"10px 12px 12px" }}>
        <p style={{
          fontSize:13, fontWeight:700, color:"#1e293b",
          lineHeight:1.4, margin:"0 0 5px",
          overflow:"hidden", display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical",
        }}>
          {note.title||"Гарчиггүй"}
        </p>
        <p style={{
          fontSize:11, color:"#e07b3a", fontWeight:600,
          margin:"0 0 4px", fontFamily:"'Courier New',monospace",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          {note.subjectId ? `@${note.subjectId}` : "@тэмдэглэл"}
        </p>
        <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>
          {note.createdAt
            ? new Date(note.createdAt).toLocaleDateString("mn-MN",{month:"short",day:"numeric",year:"numeric"})
            : "—"}
          {note.hasDrawing&&" ✏️"}{note.hasImage&&" 🖼"}
        </p>
      </div>
    </div>
  );
}

/* ════════════ SUBJECT MODAL ════════════ */
function SubjectModal({ subject, onSave, onDelete, onClose }) {
  const [name,    setName]    = useState(subject?.name    || "");
  const [emoji,   setEmoji]   = useState(subject?.emoji   || "📚");
  const [themeId, setThemeId] = useState(subject?.themeId || "blue");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return toast.error("Нэр оруулна уу");
    onSave({ ...subject, name:name.trim(), emoji, themeId, id:subject?.id||Date.now() });
    toast.success(subject?.id ? "Засагдлаа ✓" : "Subject нэмэгдлээ ✓");
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,0.45)",backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:"white",borderRadius:20,padding:28,width:340,
          boxShadow:"0 24px 80px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:18,fontWeight:700,color:"#1e293b",margin:"0 0 20px" }}>
          {subject?.id ? "Subject засах" : "Subject нэмэх"}
        </h3>

        {/* emoji + name row */}
        <div style={{ display:"flex",gap:10,marginBottom:16,position:"relative" }}>
          <button onClick={()=>setShowEmoji(v=>!v)}
            style={{ width:44,height:44,borderRadius:10,fontSize:22,border:"1.5px solid #e2e8f0",
              background:"#f8fafc",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {emoji}
          </button>
          <input value={name} onChange={e=>setName(e.target.value)}
            placeholder="Subject нэр..."
            style={{ flex:1,border:"1.5px solid #e2e8f0",borderRadius:10,padding:"10px 12px",
              fontSize:14,outline:"none",color:"#1e293b" }}
            onFocus={e=>e.target.style.borderColor="#7c3aed"}
            onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
          {showEmoji && (
            <div style={{ position:"absolute",top:52,left:0,background:"white",borderRadius:14,
              padding:12,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",border:"1px solid #e2e8f0",
              display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6,zIndex:10,width:260 }}>
              {SUBJECT_EMOJIS.map(em=>(
                <button key={em} onClick={()=>{ setEmoji(em); setShowEmoji(false); }}
                  style={{ width:28,height:28,borderRadius:6,fontSize:16,border:"none",
                    background:emoji===em?"#ede9fe":"transparent",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* theme colors */}
        <p style={{ fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:10,letterSpacing:1,textTransform:"uppercase" }}>Загвар өнгө</p>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:22 }}>
          {SUBJECT_THEMES.map(th=>(
            <button key={th.id} onClick={()=>setThemeId(th.id)}
              style={{ width:32,height:22,borderRadius:8,border:themeId===th.id?"2.5px solid #1e293b":"2px solid transparent",
                background:th.bg,cursor:"pointer",transition:"transform .1s",
                transform:themeId===th.id?"scale(1.15)":"scale(1)" }}/>
          ))}
        </div>

        {/* preview */}
        {(() => {
          const th = SUBJECT_THEMES.find(t=>t.id===themeId)||SUBJECT_THEMES[0];
          return (
            <div style={{ background:th.bg,borderRadius:12,padding:"10px 14px",
              display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
              <span style={{ fontSize:20 }}>{emoji}</span>
              <span style={{ fontWeight:700,color:th.text,fontSize:15 }}>{name||"Subject нэр"}</span>
            </div>
          );
        })()}

        <div style={{ display:"flex",gap:8 }}>
          {subject?.id && (
            <button onClick={()=>{ if(window.confirm("Subject устгах уу?")) onDelete(subject.id); }}
              style={{ padding:"10px 14px",borderRadius:10,border:"1.5px solid #fecaca",
                background:"#fef2f2",cursor:"pointer",fontSize:13,color:"#ef4444",fontWeight:600 }}>
              🗑
            </button>
          )}
          <button onClick={onClose}
            style={{ flex:1,padding:"10px",borderRadius:10,border:"1.5px solid #e2e8f0",
              background:"white",cursor:"pointer",fontSize:13,color:"#64748b",fontWeight:600 }}>
            Болих
          </button>
          <button onClick={handleSave}
            style={{ flex:1,padding:"10px",borderRadius:10,border:"none",
              background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"white",
              cursor:"pointer",fontSize:13,fontWeight:700 }}>
            {subject?.id?"Хадгалах":"Нэмэх"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════ MAIN NOTES PAGE ════════════ */

/* ════════════════════════════════════════════════════════
   FocusTimer — баруун талын цагийн panel
   ════════════════════════════════════════════════════════ */
function FocusTimer() {
  const MODES = [
    { id:"pomodoro", label:"🍅 Pomodoro", mins:25 },
    { id:"short",    label:"☕ Богино",   mins:5  },
    { id:"long",     label:"🌙 Урт",      mins:15 },
    { id:"custom",   label:"⚙️ Тохиргоо", mins:0  },
  ];
  const [mode,       setMode]       = useState("pomodoro");
  const [customMins, setCustomMins] = useState(25);
  const [running,    setRunning]    = useState(false);
  const [secondsLeft,setSecondsLeft]= useState(25*60);
  const [sessions,   setSessions]   = useState(0);
  const intervalRef  = useRef(null);
  const [swRunning,  setSwRunning]  = useState(false);
  const [swMs,       setSwMs]       = useState(0);
  const [swLaps,     setSwLaps]     = useState([]);
  const swRef        = useRef(null);
  const swStartRef   = useRef(0);
  const startSound   = useRef(null);

  const totalSecs = useMemo(()=>{
    if(mode==="custom") return customMins*60;
    return (MODES.find(m=>m.id===mode)?.mins||25)*60;
  },[mode,customMins]);

  useEffect(()=>{
    setRunning(false);
    setSecondsLeft(totalSecs);
    clearInterval(intervalRef.current);
  },[mode,customMins]);

  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setSecondsLeft(s=>{
          if(s<=1){
            clearInterval(intervalRef.current);
            setRunning(false);
            setSessions(n=>n+1);
            setSecondsLeft(totalSecs);
            // play beep
            try{
              const ctx=new AudioContext();
              const osc=ctx.createOscillator();
              const gain=ctx.createGain();
              osc.connect(gain); gain.connect(ctx.destination);
              osc.frequency.value=880; gain.gain.value=0.3;
              osc.start(); osc.stop(ctx.currentTime+0.6);
            }catch(e){}
            return totalSecs;
          }
          return s-1;
        });
      },1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return ()=>clearInterval(intervalRef.current);
  },[running,totalSecs]);

  const mins=String(Math.floor(secondsLeft/60)).padStart(2,"0");
  const secs=String(secondsLeft%60).padStart(2,"0");
  const progress=(totalSecs-secondsLeft)/totalSecs;

  const r=54, circ=2*Math.PI*r;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",padding:"18px 14px",gap:14,
      background:"linear-gradient(160deg,#1e1b2e,#2d1b4e)",color:"white",overflowY:"auto"}}>

      {/* Mode tabs */}
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{padding:"7px 10px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,
              fontWeight:mode===m.id?700:400,textAlign:"left",
              background:mode===m.id?"rgba(124,58,237,0.7)":"rgba(255,255,255,0.07)",
              color:"white",transition:"background .15s"}}>
            {m.label}{m.id!=="custom"&&<span style={{float:"right",opacity:.6}}>{m.mins}мин</span>}
          </button>
        ))}
        {mode==="custom"&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
            <span style={{fontSize:11,opacity:.7}}>Минут:</span>
            <input type="number" min={1} max={120} value={customMins}
              onChange={e=>setCustomMins(Math.max(1,+e.target.value))}
              style={{width:56,padding:"4px 8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.1)",color:"white",fontSize:13,outline:"none"}}/>
          </div>
        )}
      </div>

      <div style={{width:"100%",height:1,background:"rgba(255,255,255,0.1)"}}/>

      {/* Circle timer */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8}/>
          <circle cx={65} cy={65} r={r} fill="none"
            stroke={running?"#a78bfa":"#7c3aed"} strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ*(1-progress)}
            transform="rotate(-90 65 65)"
            style={{transition:"stroke-dashoffset .9s linear,stroke .3s"}}/>
          <text x={65} y={60} textAnchor="middle" fill="white" fontSize={26} fontWeight={700}
            fontFamily="monospace">{mins}:{secs}</text>
          <text x={65} y={80} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>
            {running?"Ажиллаж байна":"Зогссон"}
          </text>
        </svg>

        {/* Controls */}
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setRunning(r=>!r)}
            style={{padding:"9px 22px",borderRadius:12,border:"none",cursor:"pointer",
              background:running?"#ef4444":"#7c3aed",color:"white",fontSize:14,fontWeight:700,
              boxShadow:"0 4px 14px rgba(124,58,237,0.4)"}}>
            {running?"⏸ Зогсоох":"▶ Эхлэх"}
          </button>
          <button onClick={()=>{setRunning(false);setSecondsLeft(totalSecs);}}
            style={{padding:"9px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.2)",
              background:"transparent",color:"white",fontSize:14,cursor:"pointer"}}>↺</button>
        </div>
      </div>

      <div style={{width:"100%",height:1,background:"rgba(255,255,255,0.1)"}}/>

      <div style={{width:"100%",height:1,background:"rgba(255,255,255,0.1)"}}/>

      {/* ── Stopwatch ── */}
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:10,opacity:.5,marginBottom:6,letterSpacing:1}}>STOPWATCH</div>
        {/* Display */}
        <div style={{fontFamily:"monospace",fontSize:26,fontWeight:800,letterSpacing:2,marginBottom:8,
          color:swRunning?"#a78bfa":"white"}}>
          {String(Math.floor(swMs/3600000)).padStart(2,"0")}:{String(Math.floor(swMs/60000)%60).padStart(2,"0")}:{String(Math.floor(swMs/1000)%60).padStart(2,"0")}<span style={{fontSize:14,opacity:.6}}>.{String(Math.floor(swMs/10)%100).padStart(2,"0")}</span>
        </div>
        {/* Controls */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:8}}>
          <button onClick={()=>{
            if(swRunning){
              clearInterval(swRef.current);
              setSwMs(m=>m+(Date.now()-swStartRef.current));
            } else {
              swStartRef.current=Date.now()-swMs;
              swRef.current=setInterval(()=>setSwMs(Date.now()-swStartRef.current),50);
            }
            setSwRunning(r=>!r);
          }} style={{padding:"6px 14px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
            background:swRunning?"#ef4444":"#7c3aed",color:"white"}}>
            {swRunning?"⏸ Зогсоох":"▶ Эхлэх"}
          </button>
          <button onClick={()=>{
            if(swRunning){
              setSwLaps(l=>[...l,swMs+(Date.now()-swStartRef.current)]);
            } else {
              clearInterval(swRef.current); setSwMs(0); setSwLaps([]); setSwRunning(false);
            }
          }} style={{padding:"6px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",
            cursor:"pointer",fontSize:12,background:"transparent",color:"white"}}>
            {swRunning?"🚩 Lap":"↺ Reset"}
          </button>
        </div>
        {/* Laps */}
        {swLaps.length>0&&(
          <div style={{maxHeight:80,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {swLaps.map((lap,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",
                padding:"2px 8px",borderRadius:6,background:"rgba(255,255,255,0.07)",fontSize:10}}>
                <span style={{opacity:.5}}>Lap {i+1}</span>
                <span style={{fontFamily:"monospace",fontWeight:600}}>
                  {String(Math.floor(lap/60000)%60).padStart(2,"0")}:{String(Math.floor(lap/1000)%60).padStart(2,"0")}.{String(Math.floor(lap/10)%100).padStart(2,"0")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational quote */}
      <div style={{marginTop:"auto",padding:"10px 12px",borderRadius:12,
        background:"rgba(255,255,255,0.06)",fontSize:11,opacity:.65,lineHeight:1.5,textAlign:"center",
        fontStyle:"italic"}}>
        {["Алхам бүр зорилгодоо ойртуулна 🌟",
          "Анхаарлаа төвлөрүүл, амжилт ирнэ ✨",
          "Одоо эхэлбэл маргааш баяртай байна 💪",
          "Тэвчээр бол амжилтын эх 🔥"][sessions%4]}
      </div>
    </div>
  );
}

export default function Notes() {
  const { t, theme, lang } = useSettings();
  const [notes,       setNotes]       = useState(getNotes);
  const [subjects,    setSubjects]    = useState(getSubjects);
  const [editing,     setEditing]     = useState(null);
  const [activeSubj,  setActiveSubj]  = useState("all"); // "all" | "none" | subject.id
  const [search,      setSearch]      = useState("");
  const [subjModal,   setSubjModal]   = useState(null); // null | {} | subject
  const [collapsed,   setCollapsed]   = useState(false);
  const [timerOpen,   setTimerOpen]   = useState(false);

  useEffect(()=>saveNotes(notes),    [notes]);
  useEffect(()=>saveSubjects(subjects),[subjects]);

  const openNew = () => { setTimerOpen(true); setEditing({
    id:null, title:"", html:"", plainText:"",
    coverIdx:Math.floor(Math.random()*COVERS.length),
    pageColor:PAGE_COLORS[Math.floor(Math.random()*PAGE_COLORS.length)],
    font:"caveat", subjectId: activeSubj!=="all"&&activeSubj!=="none" ? activeSubj : null,
    drawing:null, images:[], hasDrawing:false, hasImage:false, createdAt:new Date().toISOString()
  }); }

  const handleSave = (updated) => {
    if (updated.id) setNotes(p=>p.map(n=>n.id===updated.id?updated:n));
    else setNotes(p=>[{...updated,id:Date.now()},...p]);
    setEditing(null);
  };
  const handleDelete = (id) => { setNotes(p=>p.filter(n=>n.id!==id)); toast.success("Устгагдлаа"); };

  const handleSubjSave = (s) => {
    if (subjects.find(x=>x.id===s.id)) setSubjects(p=>p.map(x=>x.id===s.id?s:x));
    else setSubjects(p=>[...p,s]);
    setSubjModal(null);
  };
  const handleSubjDelete = (id) => {
    setSubjects(p=>p.filter(s=>s.id!==id));
    setNotes(p=>p.map(n=>n.subjectId===id?{...n,subjectId:null}:n));
    if (activeSubj===id) setActiveSubj("all");
    setSubjModal(null);
    toast.success("Subject устгагдлаа");
  };

  const filtered = notes.filter(n=>{
    const matchSearch = n.title?.toLowerCase().includes(search.toLowerCase())||
                        n.plainText?.toLowerCase().includes(search.toLowerCase());
    const matchSubj   = activeSubj==="all" ? true
                      : activeSubj==="none" ? !n.subjectId
                      : n.subjectId===activeSubj;
    return matchSearch && matchSubj;
  });

  const countFor = (sid) => notes.filter(n=>
    sid==="all"  ? true :
    sid==="none" ? !n.subjectId :
    n.subjectId===sid
  ).length;

  const SideItem = ({ id, label, emoji, count, color, active, onClick, onEdit }) => (
    <div style={{ position:"relative" }} className="sj-row">
      <button onClick={onClick}
        style={{ width:"100%",display:"flex",alignItems:"center",gap:10,
          padding:"9px 12px",borderRadius:12,border:"none",cursor:"pointer",textAlign:"left",
          background: active ? (color||"#ede9fe") : "transparent",
          transition:"background .15s" }}>
        {emoji && <span style={{ fontSize:16,flexShrink:0 }}>{emoji}</span>}
        <span style={{ flex:1,fontSize:13,fontWeight:active?700:500,
          color: active?"#1e293b":"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
          {label}
        </span>
        <span style={{ fontSize:11,fontWeight:600,color: active?"#7c3aed":"#94a3b8",
          background: active?"rgba(124,58,237,0.1)":"rgba(0,0,0,0.05)",
          borderRadius:20,padding:"1px 7px",flexShrink:0 }}>
          {count}
        </span>
      </button>
      {onEdit && (
        <button className="sj-edit" onClick={e=>{ e.stopPropagation(); onEdit(); }}
          style={{ position:"absolute",right:42,top:"50%",transform:"translateY(-50%)",
            width:20,height:20,borderRadius:5,background:"rgba(100,116,139,0.1)",
            border:"none",cursor:"pointer",fontSize:11,color:"#94a3b8",
            display:"none",alignItems:"center",justifyContent:"center" }}>✎</button>
      )}
    </div>
  );

  return (
    <div style={{ display:"flex",height:"calc(100vh - 90px)",gap:0,background:"#f8f6f2",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 20px rgba(0,0,0,0.06)",position:"relative" }}>
      <style>{`
        @.nb-row:hover .nb-del { display:flex!important; }
        .sj-row:hover .sj-edit { display:flex!important; }
      `}</style>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width:220,flexShrink:0,borderRight:"1px solid #ede8e0",background:"#faf8f5",
        display:"flex",flexDirection:"column",overflowY:"auto" }}>
        {/* sidebar header */}
        <div style={{ padding:"16px 14px 10px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontFamily:"DM Sans",fontSize:22,fontWeight:700,color:"#3d2b10" }}>
            📔 {t.notes}
          </span>
          <span style={{ background:"rgba(124,58,237,0.1)",color:"#7c3aed",borderRadius:20,
            padding:"2px 8px",fontSize:11,fontWeight:700 }}>{notes.length}</span>
        </div>

        {/* search */}
        <div style={{ padding:"0 10px 10px",position:"relative" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Хайх..."
            style={{ width:"100%",border:"1px solid #e2e8f0",borderRadius:10,fontSize:12,
              padding:"7px 10px 7px 28px",background:"white",outline:"none",color:"#1e293b",
              boxSizing:"border-box" }}/>
          <span style={{ position:"absolute",left:18,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#aaa" }}>🔍</span>
        </div>

        {/* All notes */}
        <div style={{ padding:"0 8px" }}>
          <SideItem id="all" label="Бүх тэмдэглэл" emoji="📋"
            count={countFor("all")} active={activeSubj==="all"}
            onClick={()=>setActiveSubj("all")}/>

          {/* Subjects section */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"10px 4px 4px",marginTop:6 }}>
            <span style={{ fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:1,textTransform:"uppercase" }}>
              Subjects
            </span>
            <button onClick={()=>setSubjModal({})}
              style={{ width:20,height:20,borderRadius:6,background:"rgba(124,58,237,0.1)",
                border:"none",cursor:"pointer",color:"#7c3aed",fontSize:16,
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,lineHeight:1 }}>+</button>
          </div>

          {subjects.length===0 && (
            <div style={{ padding:"10px 8px" }}>
              <p style={{ fontSize:11,color:"#c4b5a8",lineHeight:1.5,textAlign:"center" }}>
                + дарж subject нэмнэ үү
              </p>
            </div>
          )}

          {subjects.map(s=>{
            const th=SUBJECT_THEMES.find(t=>t.id===s.themeId)||SUBJECT_THEMES[0];
            return (
              <SideItem key={s.id} id={s.id} label={s.name} emoji={s.emoji}
                count={countFor(s.id)} active={activeSubj===s.id}
                color={th.bg}
                onClick={()=>setActiveSubj(s.id)}
                onEdit={()=>setSubjModal(s)}/>
            );
          })}

          {/* No subject group */}
          <div style={{ marginTop:4 }}>
            <SideItem id="none" label="Subject-гүй" emoji="📁"
              count={countFor("none")} active={activeSubj==="none"}
              onClick={()=>setActiveSubj("none")}/>
          </div>
        </div>

        <div style={{ flex:1 }}/>
      </div>

      {/* ── RIGHT CONTENT ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* content header */}
        <div style={{ padding:"14px 20px",borderBottom:"1px solid #ede8e0",
          display:"flex",alignItems:"center",gap:12,background:"white" }}>
          {activeSubj==="all" ? (
            <span style={{ fontSize:15,fontWeight:700,color:"#1e293b" }}>📋 Бүх тэмдэглэл</span>
          ) : activeSubj==="none" ? (
            <span style={{ fontSize:15,fontWeight:700,color:"#1e293b" }}>📁 Subject-гүй</span>
          ) : (()=>{
            const s=subjects.find(x=>x.id===activeSubj);
            const th=SUBJECT_THEMES.find(t=>t.id===s?.themeId)||SUBJECT_THEMES[0];
            return s ? (
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:18 }}>{s.emoji}</span>
                <span style={{ fontSize:15,fontWeight:700,color:"#1e293b" }}>{s.name}</span>
                <span style={{ background:th.bg,color:th.text,borderRadius:20,
                  padding:"2px 9px",fontSize:11,fontWeight:600 }}>{filtered.length}</span>
              </div>
            ) : null;
          })()}
          <div style={{ flex:1 }}/>
          <button onClick={openNew}
            style={{ display:"flex",alignItems:"center",gap:6,
              padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",
              background:"#7c3aed",color:"white",fontSize:13,fontWeight:700,
              boxShadow:"0 2px 8px rgba(124,58,237,0.3)",transition:"background .15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#6d28d9"}
            onMouseLeave={e=>e.currentTarget.style.background="#7c3aed"}>
            <span style={{ fontSize:17,lineHeight:1 }}>+</span>
            Тэмдэглэл нэмэх
          </button>
        </div>

        {/* notes grid */}
        <div style={{ flex:1,overflowY:"auto",padding:"18px 20px" }}>
          {filtered.length===0 ? (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 0",gap:16 }}>
              <div style={{ fontSize:52 }}>📔</div>
              <p style={{ color:"#94a3b8",fontSize:14 }}>
                {lang==="mn"?"Тэмдэглэл байхгүй":"No notes yet"}
              </p>
              <button onClick={openNew}
                style={{ display:"flex",alignItems:"center",gap:6,
                  padding:"10px 22px",borderRadius:12,border:"none",cursor:"pointer",
                  background:"#7c3aed",color:"white",fontSize:14,fontWeight:700,
                  boxShadow:"0 2px 12px rgba(124,58,237,0.35)" }}
                onMouseEnter={e=>e.currentTarget.style.background="#6d28d9"}
                onMouseLeave={e=>e.currentTarget.style.background="#7c3aed"}>
                <span style={{ fontSize:18,lineHeight:1 }}>+</span>
                Тэмдэглэл нэмэх
              </button>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16 }}>
              {filtered.map((note,i)=>(
                <div key={note.id} className="nb-row" style={{ position:"relative" }}>
                  <NoteCard note={note} idx={i} onClick={()=>{ setTimerOpen(true); setEditing({...note}); }}/>
                  <button className="nb-del"
                    onClick={e=>{ e.stopPropagation(); handleDelete(note.id); }}
                    style={{ position:"absolute",top:-6,right:-6,zIndex:20,width:18,height:18,
                      borderRadius:"50%",background:"#e05252",border:"2px solid white",
                      color:"white",fontSize:11,cursor:"pointer",display:"none",
                      alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* editor modal */}
      {editing && (
        <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",padding:16 }}
          onClick={()=>{ setEditing(null); setTimerOpen(false); }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ display:"flex",gap:12,alignItems:"flex-start",
              width:"100%",maxWidth:timerOpen?1020:760,height:"90vh" }}>
            {/* Note editor */}
            <div style={{ flex:1,height:"100%",borderRadius:20,overflow:"hidden",
              boxShadow:"0 24px 80px rgba(0,0,0,0.35)",display:"flex",flexDirection:"column",position:"relative" }}>
              <NoteEditor note={editing} subjects={subjects}
                onSave={handleSave} onClose={()=>{ setEditing(null); setTimerOpen(false); }} onDelete={handleDelete}/>
            </div>

            {/* Timer panel alongside editor */}
            <div style={{ width:220,height:"100%",borderRadius:20,overflow:"hidden",
              boxShadow:"0 24px 80px rgba(0,0,0,0.35)",flexShrink:0,
              animation:"slideIn .25s ease" }}>
              <FocusTimer/>
            </div>
          </div>
        </div>
      )}

      {/* subject modal */}
      {subjModal && (
        <SubjectModal
          subject={subjModal.id ? subjModal : null}
          onSave={handleSubjSave}
          onDelete={handleSubjDelete}
          onClose={()=>setSubjModal(null)}/>
      )}
    </div>
  );
}
