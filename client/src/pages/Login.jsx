import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation, useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials, clearCredentials } from "../redux/slices/authSlice";
import { useSettings } from "../context/SettingsContext";
import { MdOutlineTaskAlt, MdArrowBack } from "react-icons/md";

function markSessionValid() {
  window.dispatchEvent(new CustomEvent("session-validated"));
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function IllustrationPanel({ mn }) {
  return (
    <div style={{
      background: "#1c1917",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 48px", position: "relative", overflow: "hidden",
      width: "100%", height: "100%",
    }}>
      {/* Decorative orbs */}
      <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:"rgba(132, 204, 22, 0.08)",filter:"blur(80px)"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:300,height:300,borderRadius:"50%",background:"rgba(250, 204, 21, 0.05)",filter:"blur(60px)"}}/>

      {/* Grid pattern overlay */}
      <div style={{
        position:"absolute",inset:0,
        backgroundImage:"radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize:"32px 32px",
      }}/>

      {/* App mockup */}
      <div style={{
        position:"relative",zIndex:1,width:"100%",maxWidth:360,
        background:"rgba(15, 23, 42, 0.6)",borderRadius:32,
        border:"1px solid rgba(255, 255, 255, 0.08)",
        padding:24,backdropFilter:"blur(20px)",
        boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
        marginBottom:48,
      }}>
        {/* Window chrome */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
          <div style={{width:12,height:12,borderRadius:"50%",background:"#ef4444",opacity:0.8}}/>
          <div style={{width:12,height:12,borderRadius:"50%",background:"#f59e0b",opacity:0.8}}/>
          <div style={{width:12,height:12,borderRadius:"50%",background:"#22c55e",opacity:0.8}}/>
        </div>

        {/* Mini dashboard */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {label: mn?"Нийт":"Total", val:"24", color:"#818cf8"},
            {label: mn?"Дууссан":"Done", val:"18", color:"#34d399"},
          ].map((item,i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.03)",borderRadius:16,padding:16,
              border:"1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{fontSize:12,color:"#94a3b8",fontFamily:"'Inter',sans-serif",marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:24,fontWeight:800,color:item.color,fontFamily:"'Outfit',sans-serif"}}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:16,padding:16,border:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:"#94a3b8",fontFamily:"'Inter',sans-serif"}}>{mn?"Ажлын явц":"Workflow"}</span>
            <span style={{fontSize:12,color:"#818cf8",fontWeight:700}}>75%</span>
          </div>
          <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)"}}>
            <div style={{width:"75%",height:"100%",borderRadius:3,background:"var(--brand)",boxShadow:"0 0 12px var(--brand)"}}/>
          </div>
        </div>
      </div>

      {/* Text */}
      <div style={{textAlign:"center",position:"relative",zIndex:1, padding: "0 20px"}}>
        <h2 style={{
          fontSize:32, color:"white", fontFamily:"'Outfit',sans-serif",
          fontWeight:800, lineHeight:1.1, margin:0, marginBottom:16,
          letterSpacing: "-1px"
        }}>
          {mn ? "Илүү төвлөрч," : "Master your focus,"}
          <br/>
          <span style={{color: "#818cf8"}}>{mn ? "илүүг амжуул." : "achieve more."}</span>
        </h2>
        <p style={{
          fontSize:15, color:"#94a3b8",
          fontFamily:"'Inter',sans-serif", lineHeight:1.6,
          maxWidth: 320, margin: "0 auto"
        }}>
          {mn ? "Бүтээмжийн хамгийн сүүлийн үеийн системд тавтай морил." : "Welcome to the next generation of productivity systems."}
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const { t } = useSettings();
  const [tab, setTab] = useState("login");
  const [checking, setChecking] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "mn");
  const mn = lang === "mn";
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  useEffect(() => {
    const verifySession = async () => {
      if (!user) { setChecking(false); return; }
      try {
        const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) { navigate("/dashboard"); }
        else { dispatch(clearCredentials()); setChecking(false); }
      } catch { dispatch(clearCredentials()); setChecking(false); }
    };
    verifySession();
  }, []);

  const handleLogin = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res.user));
      markSessionValid();
      navigate("/dashboard");
    } catch (err) { toast.error(err?.data?.message || t.loginError); }
  };

  const handleRegister = async (data) => {
    if (data.password !== data.confirmPassword) { toast.error(t.pwMismatch); return; }
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password }).unwrap();
      toast.success(t.registerSuccess);
      reset(); setTab("login");
    } catch (err) { toast.error(err?.data?.message || t.registerError); }
  };

  const isLoading = isLoggingIn || isRegistering;

  const inp = {
    width: "100%",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: "14px 20px",
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
    background: "rgba(255, 255, 255, 0.03)",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  if (checking) return (
    <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#1c1917"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{
          width:40,height:40,borderRadius:"50%",
          border:"3px solid rgba(254,252,232,0.05)",borderTopColor:"#84cc16",
          animation:"spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        :root { --brand: #84cc16; }
        
        html, body, #root { margin:0; padding:0; width:100%; height:100%; background: #1c1917; }
        
        .li-inp:focus {
          border-color: var(--brand) !important;
          background: rgba(254, 252, 232, 0.04) !important;
          box-shadow: 0 0 0 4px rgba(132, 204, 22, 0.12) !important;
        }
        
        .li-btn {
          background: var(--brand); color: #1c1917; border: none; border-radius: 14px;
          padding: 16px 0; font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(132, 204, 22, 0.25);
        }
        .li-btn:hover:not(:disabled) {
          background: #a3e635; transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(132, 204, 22, 0.35);
        }
        
        .tab-btn {
          flex: 1; padding: 14px 0; font-size: 14px; font-weight: 600;
          font-family: 'Inter', sans-serif; color: #a8a29e; background: none; border: none;
          border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s;
        }
        .tab-btn.active { color: #fefce8; border-bottom-color: var(--brand); }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        .top-btn {
          background: rgba(254, 252, 232, 0.03); border: 1px solid rgba(254, 252, 232, 0.08);
          border-radius: 12px; padding: 8px 16px; font-size: 13px; font-family: 'Inter', sans-serif;
          color: #a8a29e; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
        }
        .top-btn:hover { background: rgba(254, 252, 232, 0.08); color: #fefce8; border-color: rgba(254, 252, 232, 0.2); }
      `}</style>

      <div className="w-screen h-screen grid grid-cols-1 md:grid-cols-[1fr_1.1fr] bg-[#1c1917] overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col justify-center px-8 md:px-[8%] h-screen overflow-y-auto relative border-r border-white/5">
          {/* TOP BAR */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6vh"}}>
            <button className="top-btn" onClick={() => navigate("/")}>
              <MdArrowBack />
              {mn ? "Буцах" : "Back"}
            </button>
            <button className="top-btn" onClick={() => {
              const nl = mn ? "en" : "mn";
              setLang(nl);
              localStorage.setItem("app_lang", nl);
            }}>
              {mn ? "English" : "Монгол"}
            </button>
          </div>

          {/* Logo */}
          <div style={{marginBottom:"4vh",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:8,background:"var(--brand)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <MdOutlineTaskAlt color="#fff" size={18}/>
            </div>
            <span style={{fontFamily:"'Outfit',serif",fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>TodoApp</span>
          </div>

          {/* Header */}
          <div style={{marginBottom:"4vh"}}>
            <h1 style={{
              fontSize:"clamp(32px, 4vw, 44px)", fontWeight:800, color:"#fff",
              margin:0, lineHeight:1.1, fontFamily:"'Outfit',sans-serif", letterSpacing:"-1px",
            }}>
              {tab==="login"
                ? (mn ? "Тавтай морил" : "Welcome Back")
                : (mn ? "Бүртгүүлэх" : "Join the System")}
            </h1>
            <p style={{color:"#94a3b8",fontSize:15,marginTop:12,lineHeight:1.6}}>
              {tab==="login"
                ? (mn ? "Ажлын урсгалаа дахин нэг шат ахиул." : "Take your workflow to the next level.")
                : (mn ? "Цоо шинэ бүтээмжийн ертөнцөд нэгд." : "Join the next gen of productivity.")}
            </p>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"1px solid rgba(255, 255, 255, 0.05)",marginBottom:"4vh"}}>
            <button className={`tab-btn ${tab==="login"?"active":""}`} onClick={() => { setTab("login"); reset(); }}>
              {mn ? "Нэвтрэх" : "Sign In"}
            </button>
            <button className={`tab-btn ${tab==="register"?"active":""}`} onClick={() => { setTab("register"); reset(); }}>
              {mn ? "Бүртгүүлэх" : "Sign Up"}
            </button>
          </div>

          {/* FORMS */}
          <form onSubmit={handleSubmit(tab==="login"?handleLogin:handleRegister)} className="slide-up"
            style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            
            {tab==="register" && (
              <div>
                <input type="text" className="li-inp" style={inp} placeholder={mn?"Таны нэр":"Full Name"}
                  {...register("name",{required:true})}/>
              </div>
            )}

            <div>
              <input type="email" className="li-inp" style={inp} placeholder="Email Address"
                {...register("email", {required:true})}/>
            </div>

            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} className="li-inp" style={inp} placeholder="Password"
                {...register("password",{required:true, minLength:6})}/>
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#64748b"}}>
                <EyeIcon open={showPw}/>
              </button>
            </div>

            {tab==="register" && (
              <div>
                <input type="password" className="li-inp" style={inp} placeholder={mn?"Нууц үг давтах":"Confirm Password"}
                  {...register("confirmPassword",{required:true})}/>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="li-btn">
              {isLoading ? "..." : (tab==="login" ? (mn?"Нэвтрэх":"Sign In") : (mn?"Бүртгүүлэх":"Create Account"))}
            </button>
          </form>

          <p style={{textAlign:"center",fontSize:14,color:"#64748b",marginTop:"4vh"}}>
            {tab==="login" ? (mn?"Бүртгэл байхгүй юу? ":"No account? ") : (mn?"Бүртгэлтэй юу? ":"Already joined? ")}
            <span style={{color: "var(--brand)", fontWeight: 700, cursor: "pointer"}} onClick={() => setTab(tab==="login"?"register":"login")}>
              {tab==="login" ? (mn?"Бүртгүүлэх":"Sign Up") : (mn?"Нэвтрэх":"Sign In")}
            </span>
          </p>
        </div>

        {/* ── RIGHT PANEL ── - Hidden on mobile */}
        <div className="hidden md:block">
          <IllustrationPanel mn={mn}/>
        </div>
      </div>
    </>
  );
}
