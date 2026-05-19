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
      background:"linear-gradient(145deg,#e8f5f0 0%,#d1ede2 55%,#c4e8d6 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"0 40px",position:"relative",overflow:"hidden",width:"100%",height:"100%",
    }}>
      <div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"rgba(16,185,129,0.13)"}}/>
      <div style={{position:"absolute",bottom:-60,left:-60,width:200,height:200,borderRadius:"50%",background:"rgba(16,185,129,0.10)"}}/>
      <div style={{position:"absolute",top:"30%",left:-40,width:120,height:120,borderRadius:"50%",background:"rgba(16,185,129,0.07)"}}/>

      <svg width="320" height="300" viewBox="0 0 290 270" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:"relative",zIndex:1,marginBottom:32}}>
        <ellipse cx="145" cy="218" rx="62" ry="13" fill="rgba(16,185,129,0.16)"/>
        <ellipse cx="145" cy="162" rx="35" ry="43" fill="#10b981" opacity="0.92"/>
        <path d="M138 157 C138 154 141 152 145 155 C149 152 152 154 152 157 C152 161 145 165 145 165 C145 165 138 161 138 157Z" fill="white" opacity="0.65"/>
        <ellipse cx="145" cy="112" rx="23" ry="25" fill="#fde68a"/>
        <ellipse cx="145" cy="95" rx="23" ry="15" fill="#374151"/>
        <ellipse cx="123" cy="114" rx="8" ry="15" fill="#374151"/>
        <ellipse cx="167" cy="114" rx="8" ry="15" fill="#374151"/>
        <ellipse cx="137" cy="114" rx="3" ry="3.5" fill="#1f2937"/>
        <ellipse cx="153" cy="114" rx="3" ry="3.5" fill="#1f2937"/>
        <path d="M137 122 Q145 128 153 122" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M110 160 Q90 138 82 116" stroke="#10b981" strokeWidth="13" strokeLinecap="round" opacity="0.88"/>
        <path d="M180 160 Q200 138 208 116" stroke="#10b981" strokeWidth="13" strokeLinecap="round" opacity="0.88"/>
        <circle cx="80" cy="112" r="10" fill="#fde68a"/>
        <circle cx="210" cy="112" r="10" fill="#fde68a"/>
        <path d="M118 202 Q107 218 91 216" stroke="#10b981" strokeWidth="12" strokeLinecap="round" opacity="0.88"/>
        <path d="M172 202 Q183 218 199 216" stroke="#10b981" strokeWidth="12" strokeLinecap="round" opacity="0.88"/>
        <ellipse cx="89" cy="218" rx="13" ry="6" fill="#10b981" opacity="0.75"/>
        <ellipse cx="201" cy="218" rx="13" ry="6" fill="#10b981" opacity="0.75"/>
        <circle cx="62" cy="76" r="22" fill="white" opacity="0.95"/>
        <circle cx="62" cy="72" r="9" fill="#6ee7b7"/>
        <ellipse cx="62" cy="87" rx="13" ry="8" fill="#6ee7b7"/>
        <circle cx="228" cy="92" r="22" fill="white" opacity="0.95"/>
        <circle cx="228" cy="88" r="9" fill="#fbbf24"/>
        <ellipse cx="228" cy="103" rx="13" ry="8" fill="#fbbf24"/>
        <rect x="68" y="164" width="112" height="54" rx="11" fill="white" style={{filter:"drop-shadow(0 4px 14px rgba(0,0,0,0.11))"}}/>
        <text x="82" y="185" fontFamily="Georgia,serif" fontSize="11" fill="#1f2937" fontWeight="bold">Task Board</text>
        <text x="82" y="200" fontFamily="Georgia,serif" fontSize="9" fill="#6b7280">8 tasks this week</text>
        <rect x="82" y="207" width="78" height="5" rx="2.5" fill="#e5e7eb"/>
        <rect x="82" y="207" width="53" height="5" rx="2.5" fill="#10b981"/>
        <circle cx="163" cy="192" r="12" fill="#d1fae5"/>
        <text x="163" y="196" textAnchor="middle" fontFamily="Georgia,serif" fontSize="8" fill="#059669" fontWeight="bold">68%</text>
      </svg>

      <div style={{textAlign:"center",position:"relative",zIndex:1}}>
        <p style={{fontSize:20,color:"#064e3b",fontFamily:"Georgia,'Times New Roman',serif",fontWeight:700,lineHeight:1.4,margin:0}}>
          {mn?"Ажлаа хялбархан зохион байгуул":"Make your work easier and organized"}
        </p>
        <p style={{fontSize:14.5,color:"#065f46",marginTop:8,fontFamily:"Georgia,serif",opacity:0.8}}>
          <strong>TodoApp</strong>{mn?"-тай хамт":" with TodoApp"}
        </p>
        <div style={{display:"flex",gap:7,justifyContent:"center",marginTop:20}}>
          <div style={{width:9,height:9,borderRadius:5,background:"#6b7280",opacity:0.35}}/>
          <div style={{width:24,height:9,borderRadius:5,background:"#10b981"}}/>
        </div>
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
    width:"100%",border:"1.5px solid #e5e7eb",borderRadius:999,
    padding:"13px 22px",fontSize:14.5,fontFamily:"Georgia,'Times New Roman',serif",
    color:"#1f2937",background:"#fff",outline:"none",boxSizing:"border-box",
    transition:"border-color 0.2s, box-shadow 0.2s",
  };

  if (checking) return (
    <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f3f4f6",margin:0,padding:0}}>
      <span style={{color:"#9ca3af",fontFamily:"Georgia,serif",fontSize:14}}>{t.checking}</span>
    </div>
  );

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;}
        html,body,#root{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
        .li:focus{border-color:#10b981!important;box-shadow:0 0 0 3px rgba(16,185,129,0.13)!important;}
        .lb{transition:background 0.2s,transform 0.1s;}
        .lb:hover{background:#059669!important;}
        .lb:active{transform:scale(0.98);}
        .tb{transition:color 0.15s;}
        .tb:hover{color:#10b981!important;}
        @keyframes fu{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .fa{animation:fu 0.3s ease both;}
        .sv:hover{opacity:0.85;}
        ::-webkit-scrollbar{width:0;}
        .top-bar-btn{background:none;border:1.5px solid #e5e7eb;borderRadius:8px;padding:6px 14px;fontSize:12px;fontFamily:inherit;color:#6b7280;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:6px;}
        .top-bar-btn:hover{background:#f3f4f6;color:#111827;border-color:#d1d5db;}
      `}</style>

      <div style={{
        width:"100vw",height:"100vh",
        display:"grid",gridTemplateColumns:"1fr 1fr",
        margin:0,padding:0,overflow:"hidden",
        fontFamily:"Georgia,'Times New Roman',serif",
        background:"white",
      }}>
        {/* ── LEFT PANEL ── */}
        <div style={{
          display:"flex",flexDirection:"column",justifyContent:"center",
          padding:"0 7vw",height:"100vh",overflowY:"auto",background:"#fff",
        }}>
        {/* TOP BAR */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4vh"}}>
            <button className="top-bar-btn" onClick={()=>navigate("/")}
              style={{background:"none",border:"1.5px solid #e5e7eb",borderRadius:8,padding:"6px 14px",fontSize:12.5,fontFamily:"Georgia,serif",color:"#6b7280",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {mn ? "Буцах" : "Back"}
            </button>
            <button className="top-bar-btn" onClick={()=>{const nl=mn?"en":"mn";setLang(nl);localStorage.setItem("app_lang",nl);}}
              style={{background:"none",border:"1.5px solid #e5e7eb",borderRadius:8,padding:"6px 14px",fontSize:12.5,fontFamily:"Georgia,serif",color:"#6b7280",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {mn ? "EN" : "МН"}
            </button>
          </div>

          {/* Header */}
          <div style={{marginBottom:"4vh"}}>
            <h1 style={{fontSize:"clamp(24px,2.8vw,36px)",fontWeight:700,color:"#111827",margin:0,lineHeight:1.2}}>
              {tab==="login"?(mn?"Тавтай морил!":"Welcome back!"):(mn?"Бүртгүүлэх":"Create account")}
            </h1>
            <p style={{color:"#6b7280",fontSize:"clamp(12px,1.1vw,14px)",marginTop:10,lineHeight:1.6}}>
              {tab==="login"
                ?(mn?"Ажлын урсгалаа хялбарчилж, бүтээмжээ нэмэгдүүл.":"Simplify your workflow and boost your productivity.")
                :(mn?"Шинэ бүртгэл үүсгэж эхэлнэ үү.":"Get started with a new account.")}
            </p>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"2px solid #f3f4f6",marginBottom:"3vh"}}>
            {["login","register"].map((tb)=>(
              <button key={tb} className="tb"
                onClick={()=>{setTab(tb);reset();setShowPw(false);}}
                style={{
                  flex:1,padding:"11px 0",
                  fontSize:"clamp(12px,1vw,14px)",
                  fontWeight:tab===tb?700:500,fontFamily:"Georgia,serif",
                  color:tab===tb?"#10b981":"#9ca3af",
                  background:"none",border:"none",
                  borderBottom:tab===tb?"2.5px solid #10b981":"2.5px solid transparent",
                  cursor:"pointer",marginBottom:-2,letterSpacing:0.3,
                }}>
                {tb==="login"?(mn?t.loginTab:"Sign In"):(mn?t.registerTab:"Register")}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab==="login"?(
            <form onSubmit={handleSubmit(handleLogin)} className="fa" style={{display:"flex",flexDirection:"column",gap:"clamp(10px,1.5vh,18px)"}}>
              <div>
                <input type="email" placeholder={mn?"И-мэйл хаяг":"Email address"} className="li" style={inp}
                  {...register("email",{required:t.emailRequired})}/>
                {errors.email&&<p style={{color:"#ef4444",fontSize:11.5,marginTop:4,paddingLeft:8}}>{errors.email.message}</p>}
              </div>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} placeholder={mn?"Нууц үг":"Password"} className="li"
                  style={{...inp,paddingRight:52}}
                  {...register("password",{required:t.pwRequired})}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{position:"absolute",right:18,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",padding:0,display:"flex"}}>
                  <EyeIcon open={showPw}/>
                </button>
                {errors.password&&<p style={{color:"#ef4444",fontSize:11.5,marginTop:4,paddingLeft:8}}>{errors.password.message}</p>}
              </div>
              <div style={{textAlign:"right",marginTop:-4}}>
                <span style={{fontSize:12.5,color:"#6b7280",cursor:"pointer"}}>{mn?"Нууц үгээ мартсан уу?":"Forgot password?"}</span>
              </div>
              <button type="submit" disabled={isLoading} className="lb"
                style={{background:"#111827",color:"white",border:"none",borderRadius:999,
                  padding:"14px 0",fontSize:"clamp(13px,1.1vw,15px)",fontWeight:700,fontFamily:"Georgia,serif",
                  cursor:isLoading?"not-allowed":"pointer",opacity:isLoading?0.65:1,letterSpacing:0.5}}>
                {isLoading?(mn?t.loadingBtn:"Please wait..."):(mn?"Нэвтрэх":"Sign In")}
              </button>

              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
                <span style={{fontSize:12,color:"#9ca3af"}}>{mn?"эсвэл":"or"}</span>
                <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
              </div>

              <div style={{display:"flex",gap:14,justifyContent:"center"}}>
                {[{l:"G",bg:"#ea4335"},{l:"🍎",bg:"#111827"},{l:"f",bg:"#1877f2"}].map(s=>(
                  <button key={s.l} type="button" className="sv"
                    style={{width:46,height:46,borderRadius:"50%",background:s.bg,color:"white",
                      border:"none",cursor:"pointer",fontSize:s.l==="🍎"?19:15,fontWeight:700,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:s.l==="G"?"Arial,sans-serif":"Georgia,serif",transition:"opacity 0.15s"}}>
                    {s.l}
                  </button>
                ))}
              </div>
            </form>
          ):(
            <form onSubmit={handleSubmit(handleRegister)} className="fa" style={{display:"flex",flexDirection:"column",gap:"clamp(10px,1.4vh,16px)"}}>
              <div>
                <input type="text" placeholder={mn?t.namePlaceholder:"Full name"} className="li" style={inp}
                  {...register("name",{required:t.nameRequired2})}/>
                {errors.name&&<p style={{color:"#ef4444",fontSize:11.5,marginTop:4,paddingLeft:8}}>{errors.name.message}</p>}
              </div>
              <div>
                <input type="email" placeholder={mn?"И-мэйл хаяг":"Email address"} className="li" style={inp}
                  {...register("email",{required:t.emailRequired})}/>
                {errors.email&&<p style={{color:"#ef4444",fontSize:11.5,marginTop:4,paddingLeft:8}}>{errors.email.message}</p>}
              </div>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} placeholder={mn?"Нууц үг":"Password"} className="li"
                  style={{...inp,paddingRight:52}}
                  {...register("password",{required:t.pwRequired,minLength:{value:6,message:t.minLength}})}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{position:"absolute",right:18,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",padding:0,display:"flex"}}>
                  <EyeIcon open={showPw}/>
                </button>
                {errors.password&&<p style={{color:"#ef4444",fontSize:11.5,marginTop:4,paddingLeft:8}}>{errors.password.message}</p>}
              </div>
              <div>
                <input type="password" placeholder={mn?"Нууц үг давтах":"Confirm password"} className="li" style={inp}
                  {...register("confirmPassword",{required:t.confirmPwRequired})}/>
                {errors.confirmPassword&&<p style={{color:"#ef4444",fontSize:11.5,marginTop:4,paddingLeft:8}}>{errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="lb"
                style={{background:"#111827",color:"white",border:"none",borderRadius:999,
                  padding:"14px 0",fontSize:"clamp(13px,1.1vw,15px)",fontWeight:700,fontFamily:"Georgia,serif",
                  cursor:isLoading?"not-allowed":"pointer",opacity:isLoading?0.65:1,letterSpacing:0.5,marginTop:4}}>
                {isLoading?(mn?t.loadingBtn:"Please wait..."):(mn?t.registerBtn:"Register")}
              </button>
            </form>
          )}

          <p style={{textAlign:"center",fontSize:13,color:"#6b7280",marginTop:"2.5vh"}}>
            {tab==="login"?(
              <>{mn?"Хэрэглэгч биш үү?":"Don't have an account?"}{" "}
                <span style={{color:"#10b981",fontWeight:700,cursor:"pointer"}} onClick={()=>{setTab("register");reset();}}>{mn?"Бүртгүүлэх":"Register"}</span>
              </>
            ):(
              <>{mn?"Бүртгэлтэй юу?":"Already have an account?"}{" "}
                <span style={{color:"#10b981",fontWeight:700,cursor:"pointer"}} onClick={()=>{setTab("login");reset();}}>{mn?"Нэвтрэх":"Sign In"}</span>
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
