import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  MdDashboard, MdOutlineChecklist, MdNote, MdCalendarMonth,
  MdPeople, MdLogout, MdSettings, MdClose, MdExpandMore, MdExpandLess,
  MdDashboardCustomize, MdAdd, MdMailOutline, MdAccountBalanceWallet,
} from "react-icons/md";
import { clearCredentials } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/slices/api/authApiSlice";

import { useSettings } from "../context/SettingsContext";
import { WidgetPanel, AddWidgetModal } from "./Widgets";
import { getUserStore, setUserStore } from "../utils/userStorage";

function resetSessionCache() {
  window.dispatchEvent(new CustomEvent("session-invalidate"));
}

const AVATAR_COLORS = [
  ["#6366f1","#4f46e5"],["#ec4899","#db2777"],["#f59e0b","#d97706"],
  ["#10b981","#059669"],["#3b82f6","#2563eb"],["#8b5cf6","#7c3aed"],
];

function VBPopup({ anchorRef, vbBoards, setVbBoards, fcBoards, setFcBoards, setShowVBPopup, setShowFinance, navigate }) {
  const [pos, setPos] = useState({ top:0, left:0 });

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left });
    }
  }, []);

  return (
    <div style={{
      position:"fixed", top: pos.top, left: pos.left, zIndex:200,
      background:"rgba(15, 23, 42, 0.98)", borderRadius:20, padding:20, width:280,
      boxShadow:"0 32px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(20px)"
    }}>
      <p style={{fontSize:11, color:"#94a3b8", fontWeight: 700, letterSpacing:"0.08em", marginBottom:16, textTransform: "uppercase"}}>
        CREATE NEW
      </p>

      <div
        onClick={()=>{
          const hiddenBoard = vbBoards.find(b => b.hidden);
          let updated, targetId;
          if (hiddenBoard) {
            updated = vbBoards.map(b => b.id === hiddenBoard.id ? {...b, hidden: false} : b);
            targetId = hiddenBoard.id;
          } else {
            const newBoard = { id: Date.now(), label: "Vision Board" + (vbBoards.filter(b=>!b.hidden).length > 0 ? " " + (vbBoards.filter(b=>!b.hidden).length + 1) : "") };
            updated = [...vbBoards, newBoard];
            targetId = newBoard.id;
          }
          setVbBoards(updated);
          setUserStore("sidebar_vb_boards", updated);
          setShowVBPopup(false);
          navigate(`/visionboard/${targetId}`);
        }}
        style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"12px", background:"rgba(255,255,255,0.03)",
          borderRadius:14, cursor:"pointer", transition:"all .2s",
          border: "1px solid rgba(255,255,255,0.05)"
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}}>
        <div style={{
          width:40, height:40, borderRadius:12, background:"rgba(129, 140, 248, 0.15)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color: "#818cf8"
        }}>
          <MdDashboardCustomize size={22} />
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Vision Board</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>Visual your dreams</div>
        </div>
      </div>

      <div
        onClick={()=>{
          const hiddenFc = fcBoards.find(b => b.hidden);
          let updated;
          if (hiddenFc) {
            updated = fcBoards.map(b => b.id === hiddenFc.id ? {...b, hidden: false} : b);
          } else {
            const newFc = { id: Date.now(), label: "Future Capsule" + (fcBoards.filter(b=>!b.hidden).length > 0 ? " " + (fcBoards.filter(b=>!b.hidden).length + 1) : "") };
            updated = [...fcBoards, newFc];
          }
          setFcBoards(updated);
          setUserStore("sidebar_fc_boards", updated);
          setShowVBPopup(false);
          navigate("/futurecapsule");
        }}
        style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"12px", background:"rgba(255,255,255,0.03)",
          borderRadius:14, cursor:"pointer", transition:"all .2s",
          marginTop:10, border: "1px solid rgba(255,255,255,0.05)"
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}}>
        <div style={{
          width:40, height:40, borderRadius:12, background:"rgba(192, 132, 252, 0.15)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color: "#c084fc"
        }}>
          <MdMailOutline size={22} />
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Future Capsule</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>Write to future you</div>
        </div>
      </div>

      <div
        onClick={()=>{ setShowFinance&&setShowFinance(true); setShowVBPopup(false); navigate("/finance"); }}
        style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"12px", background:"rgba(255,255,255,0.03)",
          borderRadius:14, cursor:"pointer", transition:"all .2s",
          marginTop:10, border: "1px solid rgba(255,255,255,0.05)"
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}}>
        <div style={{
          width:40, height:40, borderRadius:12, background:"rgba(74, 222, 128, 0.15)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color: "#4ade80"
        }}>
          <MdAccountBalanceWallet size={22} />
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Finance</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>Track your wealth</div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ onClose, onMenuToggle }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logout] = useLogoutMutation();

  const { t } = useSettings();
  const [showVBPopup, setShowVBPopup] = useState(false);
  const plusBtnRef = useRef(null);
  const [vbBoards, setVbBoards] = useState(() => getUserStore("sidebar_vb_boards", []));
  const [fcBoards, setFcBoards] = useState(() => getUserStore("sidebar_fc_boards", []));
  const [showFinance, setShowFinance] = useState(() => getUserStore("sidebar_show_finance", false));

  const isTodosActive = location.pathname.startsWith("/todos");
  const [todosOpen, setTodosOpen] = useState(isTodosActive);

  const topLinks = [
    { to: "/dashboard", label: t.dashboard, icon: <MdDashboard size={20} /> },
  ];
  const todosSubLinks = [
    { to: "/todos/todo",        label: t.todo,       color: "#94a3b8" },
    { to: "/todos/in_progress", label: t.inProgress, color: "#6366f1" },
    { to: "/todos/completed",   label: t.completed,  color: "#10b981" },
  ];
  const bottomLinks = [
    { to: "/notes",    label: t.notes,    icon: <MdNote size={20} /> },
    { to: "/calendar", label: t.calendar, icon: <MdCalendarMonth size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      resetSessionCache();
      dispatch(clearCredentials());
      navigate("/login");
    } catch { toast.error("Гарахад алдаа гарлаа"); }
  };

  const colorIdx = (user?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const [c1, c2] = AVATAR_COLORS[colorIdx];

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive 
        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" 
        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
    }`;

  return (
    <aside className="w-[220px] flex flex-col h-full overflow-hidden bg-[#020617]">
      <style>{`.group:hover .vb-del { display:flex!important; }`}</style>

      {/* Profile Section */}
      <div className="flex-shrink-0 pt-8 px-4 pb-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white"
                style={{
                  background: user?.avatarImage ? "transparent" : `linear-gradient(135deg, ${c1}, ${c2})`,
                  border: `2px solid rgba(255,255,255,0.08)`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>
                {user?.avatarImage
                  ? <img src={user.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#020617] rounded-full"></div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base font-bold text-white truncate max-w-[120px]">{user?.name}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-widest bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">PRO</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Active User</p>
          </div>
        </div>
      </div>

      <div className="mx-6 h-px bg-white/5 my-4"></div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {topLinks.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
            {icon}{label}
          </NavLink>
        ))}

        <div className="py-1">
          <button
            onClick={() => setTodosOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isTodosActive ? "text-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <MdOutlineChecklist size={20} />
            <span className="flex-1 text-left">{t.allTodos}</span>
            {todosOpen ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </button>

          <div style={{
            maxHeight: todosOpen ? 160 : 0,
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <div className="pl-6 pt-1 space-y-1 border-l border-white/5 ml-6">
              {todosSubLinks.map(({ to, label, color }) => (
                <NavLink key={to} to={to} className={({ isActive }) => 
                  `flex items-center gap-3 py-2 px-2 text-[13px] font-medium transition-all ${
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`
                }>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {bottomLinks.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
            {icon}{label}
          </NavLink>
        ))}

        {/* Dynamic Items */}
        <div className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">Modules</span>
            <button
              ref={plusBtnRef}
              onClick={() => setShowVBPopup(v => !v)}
              className="p-1 rounded-md bg-white/5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 transition-all border border-white/5"
            >
              <MdAdd size={14} />
            </button>
          </div>
          
          <div className="space-y-1">
            {fcBoards.filter(b => !b.hidden).map((board) => (
              <div key={board.id} className="group relative">
                <NavLink to="/futurecapsule" className={({ isActive }) => linkClass(isActive)}>
                  <MdMailOutline size={20}/>{board.label}
                </NavLink>
              </div>
            ))}
            {vbBoards.filter(b => !b.hidden).map((board) => (
              <div key={board.id} className="group relative">
                <NavLink to={`/visionboard/${board.id}`} className={({ isActive }) => linkClass(isActive)}>
                  <MdDashboardCustomize size={20} />{board.label}
                </NavLink>
              </div>
            ))}
            {showFinance && (
              <div className="group relative">
                <NavLink to="/finance" className={({ isActive }) => linkClass(isActive)}>
                  <MdAccountBalanceWallet size={20}/>Finance
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Widget Panel */}
      <div className="flex-shrink-0 px-2 py-4">
         <WidgetPanel />
      </div>

      <div className="mx-6 h-px bg-white/5"></div>

      <div className="flex-shrink-0 p-4">
        <button type="button" onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <MdLogout size={20} />{t.logout}
        </button>
      </div>

      {showVBPopup && createPortal(
        <>
          <div className="fixed inset-0 z-[199]" onClick={()=>setShowVBPopup(false)}/>
          <VBPopup
            anchorRef={plusBtnRef}
            vbBoards={vbBoards}
            setVbBoards={setVbBoards}
            fcBoards={fcBoards}
            setFcBoards={setFcBoards}
            setShowVBPopup={setShowVBPopup}
            setShowFinance={(v)=>{ setShowFinance(v); setUserStore("sidebar_show_finance", v); }}
            navigate={navigate}
          />
        </>,
        document.body
      )}
    </aside>
  );
}
