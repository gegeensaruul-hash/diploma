import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  MdDashboard, MdOutlineChecklist, MdNote, MdCalendarMonth,
  MdPeople, MdLogout, MdSettings, MdClose, MdExpandMore, MdExpandLess, MdMenu,
  MdDashboardCustomize, MdAdd, MdMailOutline, MdAccountBalanceWallet,
} from "react-icons/md";
import { clearCredentials } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/slices/api/authApiSlice";

import { useSettings } from "../context/SettingsContext";
import { WidgetPanel, AddWidgetModal } from "./Widgets";
import { getUserStore, setUserStore } from "../utils/userStorage";

// App.jsx-ийн session cache-г reset хийх helper
function resetSessionCache() {
  // Module-level хувьсагчид шууд хандах боломжгүй тул custom event ашиглана
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
      background:"#2a2a3a", borderRadius:16, padding:16, width:260,
      boxShadow:"0 20px 60px rgba(0,0,0,0.55)",
    }}>
      <button onClick={()=>setShowVBPopup(false)}
        style={{
          position:"absolute", top:-10, left:-10,
          width:26, height:26, borderRadius:"50%",
          background:"#6b2e74", border:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", color:"white",
        }}>
        <MdClose size={14}/>
      </button>

      <p style={{fontSize:10,color:"#aaa",letterSpacing:"0.08em",marginBottom:10,paddingLeft:2}}>
        ШИНЭ ҮҮСГЭХ
      </p>

      <div
        onClick={()=>{
          // Нуугдсан board байвал дахин харуулах, үгүй бол шинэ нэмэх
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
          display:"flex", alignItems:"center", gap:12,
          padding:"10px 12px", background:"#1e1e2e",
          borderRadius:10, cursor:"pointer", transition:"background .15s",
        }}
        onMouseEnter={e=>e.currentTarget.style.background="#2e2e44"}
        onMouseLeave={e=>e.currentTarget.style.background="#1e1e2e"}>
        <div style={{
          width:38, height:38, borderRadius:10, background:"#3a2a5a",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <MdDashboardCustomize size={22} color="#c4a8ff"/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>Vision Board</div>
          <div style={{fontSize:12,color:"#aaa"}}>Нэрт тохирсон загвар</div>
        </div>
      </div>

      {/* Future Capsule карт */}
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
          display:"flex", alignItems:"center", gap:12,
          padding:"10px 12px", background:"#1e1e2e",
          borderRadius:10, cursor:"pointer", transition:"background .15s",
          marginTop:8,
        }}
        onMouseEnter={e=>e.currentTarget.style.background="#2e2e44"}
        onMouseLeave={e=>e.currentTarget.style.background="#1e1e2e"}>
        <div style={{
          width:38, height:38, borderRadius:10, background:"#2a1a3a",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <MdMailOutline size={22} color="#f0a8ff"/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>Future Capsule</div>
          <div style={{fontSize:12,color:"#aaa"}}>Ирээдүйдөө захидал бич</div>
        </div>
      </div>

      {/* Finance карт */}
      <div
        onClick={()=>{ setShowFinance&&setShowFinance(true); setShowVBPopup(false); navigate("/finance"); }}
        style={{
          display:"flex", alignItems:"center", gap:12,
          padding:"10px 12px", background:"#1e1e2e",
          borderRadius:10, cursor:"pointer", transition:"background .15s",
          marginTop:8,
        }}
        onMouseEnter={e=>e.currentTarget.style.background="#2e2e44"}
        onMouseLeave={e=>e.currentTarget.style.background="#1e1e2e"}>
        <div style={{
          width:38, height:38, borderRadius:10, background:"#1a2a3a",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <MdAccountBalanceWallet size={22} color="#a8d8a8"/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>Finance</div>
          <div style={{fontSize:12,color:"#aaa"}}>Зарлага орлогоо хянах</div>
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

  const { t, theme } = useSettings();
  const [showVBPopup, setShowVBPopup] = useState(false);
  const plusBtnRef = useRef(null);
  const [vbBoards, setVbBoards] = useState(() => {
    return getUserStore("sidebar_vb_boards", []);
  });
  const [fcBoards, setFcBoards] = useState(() => {
    return getUserStore("sidebar_fc_boards", []);
  });
  const [showFinance, setShowFinance] = useState(() => {
    return getUserStore("sidebar_show_finance", false);
  });

  // Accordion: open if currently on a todos sub-route
  const isTodosActive = location.pathname.startsWith("/todos");
  const [todosOpen, setTodosOpen] = useState(isTodosActive);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const topLinks = [
    { to: "/dashboard", label: t.dashboard, icon: <MdDashboard size={19} /> },
  ];
  const todosSubLinks = [
    { to: "/todos/todo",        label: t.todo,       dot: "bg-white/30" },
    { to: "/todos/in_progress", label: t.inProgress, dot: "bg-blue-300" },
    { to: "/todos/completed",   label: t.completed,  dot: "bg-green-300" },
  ];
  const bottomLinks = [
    { to: "/notes",    label: t.notes,    icon: <MdNote size={19} /> },
    { to: "/calendar", label: t.calendar, icon: <MdCalendarMonth size={19} /> },
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
  const bg = theme.sidebar;

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
    }`;

  return (
    <aside className="w-52 flex flex-col h-full overflow-hidden" style={{ background: bg }}>
      <style>{`.group:hover .vb-del { display:flex!important; }`}</style>

      {/* Cover */}
      <div className="relative flex-shrink-0">
        <div className="w-full overflow-hidden" style={{ height: 96 }}>
          {user?.coverImage ? (
            <img src={user.coverImage} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{
              background: `radial-gradient(ellipse at 25% 60%, ${c1}77 0%, transparent 60%),
                           radial-gradient(ellipse at 75% 30%, ${c2}66 0%, transparent 55%),
                           linear-gradient(160deg, ${bg}, ${bg}88)`
            }} />
          )}
        </div>



        {/* Avatar */}
        <div className="absolute left-4 z-10" style={{ bottom: -28 }}>
          <NavLink to="/profile">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-xl font-black text-white"
              style={{
                background: user?.avatarImage ? "transparent" : `linear-gradient(135deg, ${c1}, ${c2})`,
                border: `3px solid ${bg}`,
                boxShadow: "0 3px 14px rgba(0,0,0,0.45)",
              }}>
              {user?.avatarImage
                ? <img src={user.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
          </NavLink>
        </div>
      </div>

      {/* Name */}
      <div className="flex-shrink-0 pt-9 pb-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-bold text-white truncate leading-tight">{user?.name}</p>
          <div style={{ display:"flex", alignItems:"center", gap:6, position:"relative" }}>
            <button
              ref={plusBtnRef}
              onClick={() => setShowVBPopup(v => !v)}
              title="Vision Board нэмэх"
              style={{
                width:22, height:22, borderRadius:6,
                background:"rgba(255,255,255,0.15)",
                border:"1px solid rgba(255,255,255,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", color:"white", flexShrink:0,
                transition:"background .15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.28)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
              <MdAdd size={15} />
            </button>
            <NavLink to="/profile" className="text-white/40 hover:text-white transition-colors flex-shrink-0">
              <MdSettings size={15} />
            </NavLink>

            {/* Vision Board Popup — portal ашиглан body-д render */}
            {showVBPopup && createPortal(
              <>
                <div style={{ position:"fixed", inset:0, zIndex:199 }} onClick={()=>setShowVBPopup(false)}/>
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
          </div>
        </div>
      </div>

      <div className="mx-3 flex-shrink-0" style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">

        {/* Dashboard */}
        {topLinks.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
            {icon}{label}
          </NavLink>
        ))}

        {/* All Todos — accordion */}
        <div>
          {/* Header row — clickable toggle */}
          <button
            onClick={() => setTodosOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isTodosActive ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            <MdOutlineChecklist size={19} />
            <span className="flex-1 text-left">{t.allTodos}</span>
            {todosOpen
              ? <MdExpandLess size={16} className="opacity-60" />
              : <MdExpandMore size={16} className="opacity-60" />}
          </button>

          {/* Sub-links */}
          <div style={{
            maxHeight: todosOpen ? 200 : 0,
            overflow: "hidden",
            transition: "max-height 0.25s ease",
          }}>
            <div className="pl-3 pt-0.5 space-y-0.5">
              {todosSubLinks.map(({ to, label, dot }) => (
                <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ml-0.5 ${dot}`} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Notes, Calendar */}
        {bottomLinks.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
            {icon}{label}
          </NavLink>
        ))}
        {/* Future Capsules — popup-аар нэмэгдсэн */}
        {fcBoards.filter(b => !b.hidden).map((board) => (
          <div key={board.id} className="group flex items-center rounded-lg"
            style={{ position:"relative" }}>
            <NavLink to="/futurecapsule" className={({ isActive }) => linkClass(isActive)}
              style={{ flex:1 }}>
              <MdMailOutline size={19}/>{board.label}
            </NavLink>
            <button
              onClick={() => {
                const updated = fcBoards.map(b => b.id === board.id ? {...b, hidden: true} : b);
                setFcBoards(updated);
                setUserStore("sidebar_fc_boards", updated);
                navigate("/dashboard");
              }}
              style={{
                position:"absolute", right:6,
                width:18, height:18, borderRadius:5,
                background:"rgba(220,38,38,0.15)", border:"none",
                color:"rgba(255,100,100,0.6)", cursor:"pointer",
                display:"none", alignItems:"center", justifyContent:"center",
                fontSize:14, fontWeight:700, lineHeight:1,
              }}
              className="vb-del"
            >×</button>
          </div>
        ))}
        {/* Vision Boards — popup-аар нэмэгдсэн */}
        {vbBoards.filter(b => !b.hidden).map((board) => (
          <div key={board.id} className="group flex items-center rounded-lg"
            style={{ position:"relative" }}>
            <NavLink to={`/visionboard/${board.id}`} className={({ isActive }) => linkClass(isActive)}
              style={{ flex:1 }}>
              <MdDashboardCustomize size={19} />{board.label}
            </NavLink>
            <button
              onClick={() => {
                // Data-г устгахгүй, зөвхөн sidebar-аас нуух
                const updated = vbBoards.map(b => b.id === board.id ? {...b, hidden: true} : b);
                setVbBoards(updated);
                setUserStore("sidebar_vb_boards", updated);
                navigate("/dashboard");
              }}
              style={{
                position:"absolute", right:6,
                width:18, height:18, borderRadius:5,
                background:"rgba(220,38,38,0.15)", border:"none",
                color:"rgba(255,100,100,0.6)", cursor:"pointer",
                display:"none", alignItems:"center", justifyContent:"center",
                fontSize:14, fontWeight:700, lineHeight:1,
              }}
              className="vb-del"
            >×</button>
          </div>
        ))}
        {/* Finance */}
        {showFinance && (
          <div style={{ position:"relative" }} className="group flex items-center rounded-lg">
            <NavLink to="/finance" className={({ isActive }) => linkClass(isActive)} style={{ flex:1 }}>
              <MdAccountBalanceWallet size={19}/>Finance
            </NavLink>
            <button
              onClick={()=>{ setShowFinance(false); setUserStore("sidebar_show_finance", false); navigate("/dashboard"); }}
              style={{
                position:"absolute", right:6,
                width:18, height:18, borderRadius:5,
                background:"rgba(220,38,38,0.15)", border:"none",
                color:"rgba(255,100,100,0.6)", cursor:"pointer",
                display:"none", alignItems:"center", justifyContent:"center",
                fontSize:14, fontWeight:700, lineHeight:1,
              }}
              className="vb-del"
            >×</button>
          </div>
        )}
        {/* Admin */}
        {user?.role === "admin" && (
          <NavLink to="/users" className={({ isActive }) => linkClass(isActive)}>
            <MdPeople size={19} />{t.users}
          </NavLink>
        )}
      </nav>

      {/* Widgets */}
      <div style={{ overflowY:"auto", flexShrink:0, maxHeight:320 }}>
        <WidgetPanel />
      </div>

      <div className="mx-3 flex-shrink-0" style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

      {/* Logout */}
      <div className="flex-shrink-0 p-3">
        <button type="button" onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
          <MdLogout size={18} />{t.logout}
        </button>
      </div>
      {showAddWidget && <AddWidgetModal
        onAdd={(w)=>{
          try {
            const existing = getUserStore("app_widgets_v1", []);
            setUserStore("app_widgets_v1", [...existing, w]);
            window.dispatchEvent(new CustomEvent("widget-added", { detail: w }));
          } catch(e) {}
          setShowAddWidget(false);
          toast.success(w.name + " нэмэгдлээ ✓");
        }}
        onClose={()=>setShowAddWidget(false)}/>}
    </aside>
  );
}
function widget_added_msg(w){ return w.name + " нэмэгдлээ ✓"; }
