import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation, useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials, clearCredentials } from "../redux/slices/authSlice";
import { useSettings } from "../context/SettingsContext";

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
      background: "linear-gradient(145deg, #0d3b2e 0%, #0a4f3a 45%, #0d5c44 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 48px", position: "relative", overflow: "hidden",
      width: "100%", height: "100%",
    }}>
      {/* Decorative orbs */}
      <div style={{position:"absolute",top:-100,right:-100,width:320,height:320,borderRadius:"50%",background:"rgba(16,185,129,0.15)",filter:"blur(60px)"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:240,height:240,borderRadius:"50%",background:"rgba(16,185,129,0.10)",filter:"blur(40px)"}}/>
      <div style={{position:"absolute",top:"35%",right:-60,width:180,height:180,borderRadius:"50%",background:"rgba(245,200,66,0.06)",filter:"blur(30px)"}}/>

      {/* Grid pattern overlay */}
      <div style={{
        position:"absolute",inset:0,
        backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize:"28px 28px",
      }}/>

      {/* App mockup */}
      <div style={{
        position:"relative",zIndex:1,width:"100%",maxWidth:340,
        background:"rgba(255,255,255,0.06)",borderRadius:24,
        border:"1px solid rgba(255,255,255,0.12)",
        padding:20,backdropFilter:"blur(10px)",
        boxShadow:"0 32px 80px rgba(0,0,0,0.4)",
        marginBottom:36,
      }}>
        {/* Window chrome */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444",opacity:0.8}}/>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b",opacity:0.8}}/>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#22c55e",opacity:0.8}}/>
          <div style={{flex:1,height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",marginLeft:8}}/>
        </div>

        {/* Mini dashboard */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label: mn?"Нийт":"Total", val:"24", color:"#10b981"},
            {label: mn?"Дууссан":"Done", val:"18", color:"#3b82f6"},
            {label: mn?"Хийж байна":"In Progress", val:"4", color:"#f59e0b"},
            {label: mn?"Хийх":"To Do", val:"2", color:"#8b5cf6"},
          ].map((item,i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"10px 12px",
              border:"1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:22,fontWeight:800,color:item.color,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"'DM Sans',sans-serif"}}>{mn?"Дэвшил":"Progress"}</span>
            <span style={{fontSize:11,color:"#10b981",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>75%</span>
          </div>
          <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.1)"}}>
            <div style={{width:"75%",height:"100%",borderRadius:3,background:"linear-gradient(90deg,#10b981,#34d399)"}}/>
          </div>
        </div>

        {/* Todo items */}
        {[
          {text: mn?"Тайлан бичих":"Write report", done:true},
          {text: mn?"Уулзалт":"Meeting", done:true},
          {text: mn?"Код шалгах":"Review code", done:false},
        ].map((item,i) => (
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"7px 0",
            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{
              width:14,height:14,borderRadius:"50%",flexShrink:0,
              background: item.done ? "#10b981" : "transparent",
              border: item.done ? "none" : "1.5px solid rgba(255,255,255,0.3)",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              {item.done && <span style={{color:"white",fontSize:8,lineHeight:1}}>✓</span>}
            </div>
            <span style={{
              fontSize:12,color: item.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)",
              fontFamily:"'DM Sans',sans-serif",
              textDecoration: item.done ? "line-through" : "none",
            }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Text */}
      <div style={{textAlign:"center",position:"relative",zIndex:1, padding: "0 20px"}}>
        <p style={{
          fontSize:26, color:"white", fontFamily:"'Playfair Display',serif",
          fontWeight:900, lineHeight:1.2, margin:0, marginBottom:12,
          letterSpacing: "-0.5px"
        }}>
          {mn ? "Бүтээмжтэй ажиллах" : "Work Productively"}
          <br/>
          <span style={{color: "#f5c842", fontStyle: "italic"}}>{mn ? "таны орон зай" : "your inner space"}</span>
        </p>
        <p style={{
          fontSize:14, color:"rgba(255,255,255,0.6)",
          fontFamily:"'DM Sans',sans-serif", lineHeight:1.6,
          maxWidth: 280, margin: "0 auto"
        }}>
          {mn ? "Бүх ажлаа нэг дороос удирдах ухаалаг туслах" : "The smart assistant to manage everything in one place"}
        </p>
        {/* Dots */}
        <div style={{display:"flex",gap:7,justifyContent:"center",marginTop:24}}>
          <div style={{width:8,height:8,borderRadius:4,background:"rgba(255,255,255,0.2)"}}/>
          <div style={{width:24,height:8,borderRadius:4,background:"#f5c842"}}/>
          <div style={{width:8,height:8,borderRadius:4,background:"rgba(255,255,255,0.2)"}}/>
        </div>
      </div>

      {/* Feature pills */}
      <div style={{
        position:"absolute",bottom:24,left:0,right:0,
        display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",padding:"0 24px",
      }}>
        {["📋 Todo","📅 Calendar","🤖 Groq AI","💰 Finance"].map(pill => (
          <span key={pill} style={{
            background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:100,padding:"4px 12px",
            fontSize:11,color:"rgba(255,255,255,0.6)",
            fontFamily:"'DM Sans',sans-serif",fontWeight:500,
          }}>{pill}</span>
        ))}
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
        const res = await fetch("/api/auth/me", { credentials: "include" });
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
    border: "1.5px solid #e5e7eb",
    borderRadius: 12,
    padding: "13px 20px",
    fontSize: 14.5,
    fontFamily: "'DM Sans', sans-serif",
    color: "#1f2937",
    background: "#f9fafb",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  };

  if (checking) return (
    <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f9fafb"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <div style={{
          width:36,height:36,borderRadius:"50%",
          border:"3px solid #e5e7eb",borderTopColor:"#10b981",
          animation:"spin 0.7s linear infinite",
        }}/>
        <span style={{color:"#9ca3af",fontFamily:"'DM Sans',sans-serif",fontSize:14}}>{t.checking}</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html,body,#root{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
        .li-inp:focus{
          border-color:#10b981 !important;
          box-shadow:0 0 0 3px rgba(16,185,129,0.12) !important;
          background:#fff !important;
        }
        .li-inp::placeholder{color:#9ca3af;}
        .li-btn{transition:background 0.2s,transform 0.15s,box-shadow 0.2s;}
        .li-btn:hover:not(:disabled){background:#059669 !important;transform:translateY(-1px);box-shadow:0 8px 24px rgba(16,185,129,0.35)!important;}
        .li-btn:active:not(:disabled){transform:scale(0.98);}
        .tab-btn{transition:color 0.15s,border-color 0.15s;}
        .tab-btn:hover{color:#10b981 !important;}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .slide-up{animation:slideUp 0.35s cubic-bezier(.16,1,.3,1) both;}
        ::-webkit-scrollbar{width:0;}
        .top-btn{
          background:none;border:1.5px solid #e5e7eb;border-radius:10px;
          padding:7px 16px;font-size:12.5px;font-family:'DM Sans',sans-serif;
          color:#6b7280;cursor:pointer;transition:all 0.18s;
          display:flex;align-items:center;gap:6px;
        }
        .top-btn:hover{background:#f3f4f6;color:#111827;border-color:#d1d5db;}
        .social-btn{
          flex:1;height:44px;border-radius:10px;border:1.5px solid #e5e7eb;
          background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;
          font-size:13px;font-weight:600;color:#374151;
          display:flex;align-items:center;justify-content:center;gap:7px;
          transition:all 0.18s;
        }
        .social-btn:hover{background:#f9fafb;border-color:#d1d5db;transform:translateY(-1px);}
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        margin: 0, padding: 0, overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        background: "white",
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 7vw", height: "100vh", overflowY: "auto", background: "#fff",
          position: "relative",
        }}>
          {/* TOP BAR */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4vh"}}>
            <button className="top-btn" onClick={() => navigate("/")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {mn ? "Буцах" : "Back"}
            </button>
            <button className="top-btn" onClick={() => {
              const nl = mn ? "en" : "mn";
              setLang(nl);
              localStorage.setItem("app_lang", nl);
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {mn ? "EN" : "МН"}
            </button>
          </div>

          {/* Logo / Brand */}
          <div style={{marginBottom:"3vh",display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#f5c842"}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#111"}}>TodoApp</span>
          </div>

          {/* Header */}
          <div style={{marginBottom:"3vh"}}>
            <h1 style={{
              fontSize:"clamp(26px,3vw,38px)", fontWeight:800, color:"#111827",
              margin:0, lineHeight:1.15, fontFamily:"'Playfair Display',serif",
              letterSpacing:"-0.5px",
            }}>
              {tab==="login"
                ? (mn ? "Тавтай морил! 👋" : "Welcome back! 👋")
                : (mn ? "Бүртгүүлэх" : "Create account")}
            </h1>
            <p style={{color:"#6b7280",fontSize:14,marginTop:10,lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {tab==="login"
                ? (mn ? "Ажлын урсгалаа хялбарчилж, бүтээмжээ нэмэгдүүл." : "Simplify your workflow and boost your productivity.")
                : (mn ? "Шинэ бүртгэл үүсгэж эхэлнэ үү." : "Get started with a new account.")}
            </p>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"2px solid #f3f4f6",marginBottom:"3vh"}}>
            {["login","register"].map((tb) => (
              <button key={tb} className="tab-btn"
                onClick={() => { setTab(tb); reset(); setShowPw(false); }}
                style={{
                  flex:1, padding:"11px 0",
                  fontSize:14, fontWeight:tab===tb?700:500,
                  fontFamily:"'DM Sans',sans-serif",
                  color:tab===tb?"#111827":"#9ca3af",
                  background:"none",border:"none",
                  borderBottom:tab===tb?"2.5px solid #111827":"2.5px solid transparent",
                  cursor:"pointer",marginBottom:-2,letterSpacing:0.2,
                }}>
                {tb==="login"?(mn?t.loginTab:"Sign In"):(mn?t.registerTab:"Register")}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {tab==="login" ? (
            <form onSubmit={handleSubmit(handleLogin)} className="slide-up"
              style={{display:"flex",flexDirection:"column",gap:"clamp(11px,1.6vh,18px)"}}>
              <div>
                <label style={{fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>
                  {mn ? "И-мэйл хаяг" : "Email address"}
                </label>
                <input type="email" className="li-inp" style={inp}
                  placeholder={mn ? "you@example.com" : "you@example.com"}
                  {...register("email", {required:t.emailRequired})}/>
                {errors.email && <p style={{color:"#ef4444",fontSize:11.5,marginTop:5,paddingLeft:4}}>{errors.email.message}</p>}
              </div>
              <div>
                <label style={{fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>
                  {mn ? "Нууц үг" : "Password"}
                </label>
                <div style={{position:"relative"}}>
                  <input type={showPw?"text":"password"} className="li-inp"
                    style={{...inp,paddingRight:52}}
                    placeholder="••••••••"
                    {...register("password",{required:t.pwRequired})}/>
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{
                      position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",
                      background:"none",border:"none",cursor:"pointer",color:"#9ca3af",
                      padding:4,display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                    <EyeIcon open={showPw}/>
                  </button>
                </div>
                {errors.password && <p style={{color:"#ef4444",fontSize:11.5,marginTop:5,paddingLeft:4}}>{errors.password.message}</p>}
              </div>

              <div style={{display:"flex",justifyContent:"flex-end",marginTop:-6}}>
                <span style={{fontSize:12.5,color:"#10b981",cursor:"pointer",fontWeight:600}}>
                  {mn ? "Нууц үгээ мартсан уу?" : "Forgot password?"}
                </span>
              </div>

              <button type="submit" disabled={isLoading} className="li-btn"
                style={{
                  background:"#f5c842",color:"#111",border:"none",borderRadius:12,
                  padding:"14px 0",fontSize:15,fontWeight:800,
                  fontFamily:"'DM Sans',sans-serif",
                  cursor:isLoading?"not-allowed":"pointer",
                  opacity:isLoading?0.65:1,letterSpacing:0.3,
                  marginTop:4,
                }}>
                {isLoading
                  ? (mn ? t.loadingBtn : "Please wait...")
                  : (mn ? "Нэвтрэх" : "Sign In")}
              </button>

              <div style={{display:"flex",alignItems:"center",gap:12,margin:"2px 0"}}>
                <div style={{flex:1,height:1,background:"#f3f4f6"}}/>
                <span style={{fontSize:12,color:"#d1d5db",fontWeight:500}}>{mn?"эсвэл":"or"}</span>
                <div style={{flex:1,height:1,background:"#f3f4f6"}}/>
              </div>

              <div style={{display:"flex",gap:10}}>
                <button type="button" className="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button type="button" className="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleSubmit(handleRegister)} className="slide-up"
              style={{display:"flex",flexDirection:"column",gap:"clamp(11px,1.5vh,16px)"}}>
              <div>
                <label style={{fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>
                  {mn ? "Бүтэн нэр" : "Full name"}
                </label>
                <input type="text" className="li-inp" style={inp}
                  placeholder={mn ? t.namePlaceholder : "John Doe"}
                  {...register("name",{required:t.nameRequired2})}/>
                {errors.name && <p style={{color:"#ef4444",fontSize:11.5,marginTop:5,paddingLeft:4}}>{errors.name.message}</p>}
              </div>
              <div>
                <label style={{fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>
                  {mn ? "И-мэйл хаяг" : "Email address"}
                </label>
                <input type="email" className="li-inp" style={inp}
                  placeholder="you@example.com"
                  {...register("email",{required:t.emailRequired})}/>
                {errors.email && <p style={{color:"#ef4444",fontSize:11.5,marginTop:5,paddingLeft:4}}>{errors.email.message}</p>}
              </div>
              <div>
                <label style={{fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>
                  {mn ? "Нууц үг" : "Password"}
                </label>
                <div style={{position:"relative"}}>
                  <input type={showPw?"text":"password"} className="li-inp"
                    style={{...inp,paddingRight:52}}
                    placeholder="••••••••"
                    {...register("password",{required:t.pwRequired,minLength:{value:6,message:t.minLength}})}/>
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{
                      position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",
                      background:"none",border:"none",cursor:"pointer",color:"#9ca3af",
                      padding:4,display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                    <EyeIcon open={showPw}/>
                  </button>
                </div>
                {errors.password && <p style={{color:"#ef4444",fontSize:11.5,marginTop:5,paddingLeft:4}}>{errors.password.message}</p>}
              </div>
              <div>
                <label style={{fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>
                  {mn ? "Нууц үг давтах" : "Confirm password"}
                </label>
                <input type="password" className="li-inp" style={inp}
                  placeholder="••••••••"
                  {...register("confirmPassword",{required:t.confirmPwRequired})}/>
                {errors.confirmPassword && <p style={{color:"#ef4444",fontSize:11.5,marginTop:5,paddingLeft:4}}>{errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="li-btn"
                style={{
                  background:"#f5c842",color:"#111",border:"none",borderRadius:12,
                  padding:"14px 0",fontSize:15,fontWeight:800,
                  fontFamily:"'DM Sans',sans-serif",
                  cursor:isLoading?"not-allowed":"pointer",
                  opacity:isLoading?0.65:1,letterSpacing:0.3,marginTop:4,
                }}>
                {isLoading
                  ? (mn ? t.loadingBtn : "Please wait...")
                  : (mn ? t.registerBtn : "Create Account")}
              </button>
            </form>
          )}

          <p style={{textAlign:"center",fontSize:13,color:"#9ca3af",marginTop:"2.5vh",fontFamily:"'DM Sans',sans-serif"}}>
            {tab==="login" ? (
              <>{mn?"Хэрэглэгч биш үү?":"Don't have an account?"}{" "}
                <span style={{color:"#111827",fontWeight:700,cursor:"pointer"}}
                  onClick={() => { setTab("register"); reset(); }}>
                  {mn?"Бүртгүүлэх":"Register"}
                </span>
              </>
            ) : (
              <>{mn?"Бүртгэлтэй юу?":"Already have an account?"}{" "}
                <span style={{color:"#111827",fontWeight:700,cursor:"pointer"}}
                  onClick={() => { setTab("login"); reset(); }}>
                  {mn?"Нэвтрэх":"Sign In"}
                </span>
              </>
            )}
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <IllustrationPanel mn={mn}/>
      </div>
    </>
  );
}
