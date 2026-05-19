import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  MdDashboard, MdOutlineChecklist, MdNote, MdCalendarMonth,
  MdLogout, MdDashboardCustomize, MdAdd, MdMailOutline, MdAccountBalanceWallet,
} from "react-icons/md";
import { clearCredentials } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/slices/api/authApiSlice";
import { useSettings } from "../context/SettingsContext";
import { getUserStore, setUserStore } from "../utils/userStorage";

function resetSessionCache() {
  window.dispatchEvent(new CustomEvent("session-invalidate"));
}

const AVATAR_COLORS = [
  ["#6366f1","#4f46e5"],["#ec4899","#db2777"],["#f59e0b","#d97706"],
  ["#10b981","#059669"],["#3b82f6","#2563eb"],["#8b5cf6","#7c3aed"],
];

function Tooltip({ children, text }) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="absolute left-[calc(100%+16px)] px-3 py-1.5 bg-slate-800 text-stone-900 dark:text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-black/10 dark:border-white/10 z-50">
        {text}
        {/* Triangle arrow */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-black/10 dark:border-white/10" />
      </div>
    </div>
  );
}

function VBPopup({ anchorRef, vbBoards, setVbBoards, fcBoards, setFcBoards, setShowVBPopup, setShowFinance, navigate }) {
  const [pos, setPos] = useState({ top:0, left:0 });

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.top, left: r.right + 16 });
    }
  }, []);

  return (
    <div style={{
      position:"fixed", top: pos.top, left: pos.left, zIndex:200,
      background:"rgba(15, 23, 42, 0.98)", borderRadius:24, padding:20, width:280,
      boxShadow:"0 32px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(20px)"
    }}>
      <p style={{fontSize:11, color:"#94a3b8", fontWeight: 700, letterSpacing:"0.08em", marginBottom:16, textTransform: "uppercase"}}>
        CREATE NEW MODULE
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
        className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-black/10 dark:border-white/10"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
          <MdDashboardCustomize size={22} />
        </div>
        <div>
          <div className="text-sm font-bold text-stone-900 dark:text-white">Vision Board</div>
          <div className="text-xs text-slate-400">Visual your dreams</div>
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
        className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-black/10 dark:border-white/10 mt-2"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
          <MdMailOutline size={22} />
        </div>
        <div>
          <div className="text-sm font-bold text-stone-900 dark:text-white">Future Capsule</div>
          <div className="text-xs text-slate-400">Write to future you</div>
        </div>
      </div>

      <div
        onClick={()=>{ setShowFinance&&setShowFinance(true); setShowVBPopup(false); navigate("/finance"); }}
        className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-black/10 dark:border-white/10 mt-2"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
          <MdAccountBalanceWallet size={22} />
        </div>
        <div>
          <div className="text-sm font-bold text-stone-900 dark:text-white">Finance</div>
          <div className="text-xs text-slate-400">Track your wealth</div>
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

  const topLinks = [
    { to: "/dashboard", label: t.dashboard, icon: <MdDashboard size={24} /> },
    { to: "/todos/todo", label: t.allTodos, icon: <MdOutlineChecklist size={24} /> },
    { to: "/notes", label: t.notes, icon: <MdNote size={24} /> },
    { to: "/calendar", label: t.calendar, icon: <MdCalendarMonth size={24} /> },
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
    `w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
      isActive 
        ? "bg-indigo-500 text-stone-900 dark:text-white shadow-lg shadow-indigo-500/30 scale-110" 
        : "text-slate-400 hover:text-stone-900 dark:text-white hover:bg-black/10 dark:bg-white/10 hover:scale-105"
    }`;

  return (
    <aside className="w-20 h-full flex flex-col items-center py-6 bg-slate-900/60 backdrop-blur-2xl rounded-[40px] border border-black/5 dark:border-white/5 shadow-2xl relative">
      
      {/* Profile Avatar */}
      <Tooltip text={user?.name || "Profile"}>
        <div onClick={() => navigate('/profile')} className="relative mb-8 cursor-pointer hover:scale-105 transition-transform">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black text-stone-900 dark:text-white"
            style={{
              background: user?.avatarImage ? "transparent" : `linear-gradient(135deg, ${c1}, ${c2})`,
              border: `2px solid rgba(255,255,255,0.08)`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
            {user?.avatarImage
              ? <img src={user.avatarImage} alt="avatar" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-[#0f172a] rounded-full"></div>
        </div>
      </Tooltip>

      <div className="w-8 h-px bg-black/10 dark:bg-white/10 mb-6"></div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-4 flex-1">
        {topLinks.map(({ to, label, icon }) => (
          <Tooltip key={to} text={label}>
            <NavLink to={to} className={({ isActive }) => linkClass(isActive)}>
              {icon}
            </NavLink>
          </Tooltip>
        ))}

        <div className="w-8 h-px bg-black/10 dark:bg-white/10 mx-auto my-2"></div>

        {/* Dynamic Modules */}
        {fcBoards.filter(b => !b.hidden).map((board) => (
          <Tooltip key={board.id} text={board.label}>
            <NavLink to="/futurecapsule" className={({ isActive }) => linkClass(isActive)}>
              <MdMailOutline size={24}/>
            </NavLink>
          </Tooltip>
        ))}
        {vbBoards.filter(b => !b.hidden).map((board) => (
          <Tooltip key={board.id} text={board.label}>
            <NavLink to={`/visionboard/${board.id}`} className={({ isActive }) => linkClass(isActive)}>
              <MdDashboardCustomize size={24} />
            </NavLink>
          </Tooltip>
        ))}
        {showFinance && (
          <Tooltip text="Finance">
            <NavLink to="/finance" className={({ isActive }) => linkClass(isActive)}>
              <MdAccountBalanceWallet size={24}/>
            </NavLink>
          </Tooltip>
        )}

        {/* Add Module Button */}
        <Tooltip text="Add Module">
          <button
            ref={plusBtnRef}
            onClick={() => setShowVBPopup(v => !v)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-stone-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all hover:scale-105 border border-dashed border-black/20 dark:border-white/20 mt-2"
          >
            <MdAdd size={24} />
          </button>
        </Tooltip>
      </nav>

      <div className="w-8 h-px bg-black/10 dark:bg-white/10 mt-6 mb-6"></div>

      {/* Logout */}
      <Tooltip text={t.logout}>
        <button type="button" onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all hover:scale-105">
          <MdLogout size={24} />
        </button>
      </Tooltip>

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
