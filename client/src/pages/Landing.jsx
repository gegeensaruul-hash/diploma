import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const FEATURES = [
  { icon: "✓", title: "Ухаалаг Todo", en: "Smart Todos", desc: "Ангилал, тэргүүлэх дарааллаар зохион байгуулж дэвшлээ хянаарай.", enDesc: "Organize by category and priority. Track your progress effortlessly.", color: "#f5c842" },
  { icon: "◈", title: "Хуанли", en: "Calendar", desc: "Бүх ажлаа хуанли дээр харж цаг хугацааг зөв хуваарилаарай.", enDesc: "Visualize all tasks on a calendar and plan your time with precision.", color: "#f5c842" },
  { icon: "🎯", title: "Vision Board", en: "Vision Board", desc: "Зорилго мөрөөдлөө зурган хавтан дээр цуглуулж өдөр бүр сэдэлжүүл.", enDesc: "Pin your goals on a visual board. Stay inspired every single day.", color: "#f5c842" },
  { icon: "✍", title: "Тэмдэглэл", en: "Notes", desc: "Санаа төлөвлөгөөгөө хурдан бичиж хадгалаарай.", enDesc: "Capture ideas and plans instantly. Rich note-taking built right in.", color: "#f5c842" },
  { icon: "⬡", title: "AI Туслах", en: "AI Assistant", desc: "Claude AI-аар асуулт асуу зөвлөгөө ав — апп доторхоос.", enDesc: "Ask Claude AI anything right inside the app. Built-in intelligence.", color: "#f5c842" },
  { icon: "◎", title: "Групп Чат", en: "Group Chat", desc: "Багийнхантайгаа шууд харилцаж хамтран ажиллаарай.", enDesc: "Collaborate with your team in real-time. Built-in group chat.", color: "#f5c842" },
  { icon: "💰", title: "Санхүү", en: "Finance", desc: "Орлого зарлагаа хянаж төсвөө зөв удирдаарай.", enDesc: "Track income and expenses. Manage your budget with ease.", color: "#f5c842" },
  { icon: "⏳", title: "Ирээдүйн хайрцаг", en: "Future Capsule", desc: "Өөртөө захиа бичиж ирээдүйд нээх хайрцагт хийгээрэй.", enDesc: "Write letters to your future self. Open them when the time is right.", color: "#f5c842" },
];

const STATS = [
  { n: "250+", label: "Хэрэглэгч", en: "Active Users" },
  { n: "8+", label: "Функц", en: "Features" },
  { n: "AI", label: "Туслах", en: "Assistant" },
  { n: "24/7", label: "Ажиллана", en: "Available" },
];

const WORKS = [
  { title: "Todo Удирдлага", en: "Task Management", tag: "Productivity", tagEn: "Productivity", bg: "#f0f7ff", accent: "#3b82f6" },
  { title: "Санхүүгийн хяналт", en: "Finance Tracker", tag: "Finance", tagEn: "Finance", bg: "#fff7ed", accent: "#f59e0b" },
  { title: "Vision Board", en: "Vision Board", tag: "Motivation", tagEn: "Motivation", bg: "#fdf4ff", accent: "#a855f7" },
  { title: "AI Чат туслах", en: "AI Chat Assistant", tag: "Intelligence", tagEn: "Intelligence", bg: "#f0fdf4", accent: "#10b981" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "mn");
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
    setTimeout(() => setVis(true), 60);
  }, [user]);

  const mn = lang === "mn";
  const toggleLang = () => {
    const nl = mn ? "en" : "mn";
    setLang(nl);
    localStorage.setItem("app_lang", nl);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf7", color: "#111", fontFamily: "'Playfair Display', Georgia, serif", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* NAV */
        .ln-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 56px;
          background: rgba(250,250,247,0.88);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .ln-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px; font-weight: 700; color: #111; letter-spacing: -0.3px;
          display: flex; align-items: center; gap: 8px;
        }
        .ln-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #f5c842; display: inline-block; }
        .ln-nav-links { display: flex; align-items: center; gap: 32px; }
        .ln-nav-link {
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #555;
          text-decoration: none; cursor: pointer; transition: color 0.18s;
          background: none; border: none; font-weight: 500;
        }
        .ln-nav-link:hover { color: #111; }
        .ln-nav-right { display: flex; align-items: center; gap: 10px; }
        .ln-btn-ghost {
          font-family: 'DM Sans', sans-serif;
          background: none; border: 1.5px solid #ddd; color: #555;
          padding: 8px 18px; border-radius: 100px; cursor: pointer; font-size: 13px;
          transition: all 0.18s; font-weight: 500;
        }
        .ln-btn-ghost:hover { border-color: #111; color: #111; }
        .ln-btn-cta {
          font-family: 'DM Sans', sans-serif;
          background: #111; color: #fff; border: none;
          padding: 9px 22px; border-radius: 100px; cursor: pointer; font-size: 13px;
          font-weight: 600; transition: all 0.2s;
        }
        .ln-btn-cta:hover { background: #333; transform: translateY(-1px); }

        /* HERO */
        .ln-hero {
          min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; gap: 0;
          padding: 100px 56px 60px;
          position: relative; overflow: hidden;
        }
        .ln-hero-left { display: flex; flex-direction: column; justify-content: center; }
        .ln-hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          color: #888; letter-spacing: 1.5px; text-transform: uppercase;
          margin-bottom: 20px;
        }
        .ln-hero-tag-line { width: 28px; height: 1.5px; background: #111; }
        .ln-hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(44px, 5.5vw, 76px);
          line-height: 1.05; letter-spacing: -1.5px;
          color: #111; margin-bottom: 22px;
        }
        .ln-hero-title em { font-style: italic; color: #333; }
        .ln-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; color: #666; line-height: 1.7;
          max-width: 420px; margin-bottom: 36px; font-weight: 400;
        }
        .ln-hero-cta { display: flex; gap: 12px; align-items: center; margin-bottom: 48px; }
        .ln-btn-big {
          font-family: 'DM Sans', sans-serif;
          background: #111; color: #fff; border: none;
          padding: 14px 32px; border-radius: 100px; cursor: pointer;
          font-size: 15px; font-weight: 600; transition: all 0.22s;
        }
        .ln-btn-big:hover { background: #333; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
        .ln-btn-outline {
          font-family: 'DM Sans', sans-serif;
          background: none; border: 1.5px solid #ccc; color: #444;
          padding: 13px 28px; border-radius: 100px; cursor: pointer;
          font-size: 15px; font-weight: 500; transition: all 0.18s;
        }
        .ln-btn-outline:hover { border-color: #111; color: #111; }
        .ln-email-hint {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #aaa; display: flex; align-items: center; gap: 6px;
        }
        .ln-email-badge {
          background: #f0f0ea; border-radius: 100px; padding: 5px 12px;
          font-size: 12px; color: #555; font-family: 'DM Sans', sans-serif;
        }

        /* HERO RIGHT */
        .ln-hero-right { position: relative; display: flex; align-items: center; justify-content: center; }
        .ln-hero-circle {
          width: clamp(320px, 38vw, 520px);
          height: clamp(320px, 38vw, 520px);
          border-radius: 50%;
          background: linear-gradient(135deg, #f5e6b8 0%, #f5c842 60%, #e8b400 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: flex-end; justify-content: center;
        }
        .ln-badge-float {
          position: absolute; background: white;
          border-radius: 14px; padding: 10px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #111;
          animation: floatBadge 3s ease-in-out infinite;
        }
        .ln-badge-float.b1 { top: 18%; left: -8%; animation-delay: 0s; }
        .ln-badge-float.b2 { top: 30%; right: -10%; animation-delay: -1.5s; }
        .ln-badge-icon { font-size: 18px; }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* STATS BAR */
        .ln-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid #e8e8e2; border-bottom: 1px solid #e8e8e2;
          margin: 0; background: #fff;
        }
        .ln-stat {
          padding: 32px 40px; border-right: 1px solid #e8e8e2;
          font-family: 'DM Sans', sans-serif;
        }
        .ln-stat:last-child { border-right: none; }
        .ln-stat-n {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px; font-weight: 900; color: #111; letter-spacing: -1px;
          line-height: 1;
        }
        .ln-stat-l { font-size: 13px; color: #888; margin-top: 4px; font-weight: 500; }

        /* SECTION SHARED */
        .ln-section { padding: 100px 56px; max-width: 1200px; margin: 0 auto; }
        .ln-section-tag {
          display: flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
          color: #888; margin-bottom: 18px;
        }
        .ln-section-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #f5c842; }
        .ln-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 3.8vw, 52px); line-height: 1.1;
          letter-spacing: -1.2px; color: #111; margin-bottom: 56px;
        }
        .ln-section-title em { font-style: italic; color: #888; }

        /* WORKS GRID */
        .ln-works-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .ln-works-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
        }
        .ln-work-card {
          border-radius: 20px; overflow: hidden;
          border: 1px solid #e8e8e2; cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s;
          position: relative;
        }
        .ln-work-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.1); }
        .ln-work-card-top {
          height: 180px; display: flex; align-items: center; justify-content: center;
          font-size: 52px; position: relative;
        }
        .ln-work-card-tag {
          position: absolute; top: 16px; right: 16px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; color: white;
          padding: 4px 10px; border-radius: 100px;
        }
        .ln-work-card-body { padding: 20px 24px; background: #fff; }
        .ln-work-card-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px; font-weight: 700; color: #111; margin-bottom: 6px;
        }
        .ln-work-card-sub {
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #888;
        }
        .ln-work-card-arrow {
          position: absolute; bottom: 20px; right: 20px;
          width: 32px; height: 32px; border-radius: 50%; background: #111;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 14px;
        }

        /* FEATURES */
        .ln-features-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
          background: #e8e8e2; border-radius: 20px; overflow: hidden;
          border: 1px solid #e8e8e2;
        }
        .ln-feat {
          background: #fff; padding: 32px 28px;
          transition: background 0.18s;
          cursor: default;
        }
        .ln-feat:hover { background: #fafaf7; }
        .ln-feat-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 11px; color: #bbb; margin-bottom: 20px;
          font-weight: 700; letter-spacing: 1px;
        }
        .ln-feat-icon { font-size: 24px; margin-bottom: 14px; display: block; }
        .ln-feat-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 16px; font-weight: 700; color: #111;
          margin-bottom: 8px; letter-spacing: -0.3px;
        }
        .ln-feat-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; color: #888; line-height: 1.65;
        }

        /* TESTIMONIAL / HIGHLIGHT */
        .ln-highlight {
          margin: 0 56px; border-radius: 28px;
          background: #111; color: white;
          padding: 80px 72px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
          align-items: center; position: relative; overflow: hidden;
        }
        .ln-highlight::before {
          content: ''; position: absolute;
          top: -120px; right: -120px; width: 360px; height: 360px;
          background: #f5c842; border-radius: 50%; opacity: 0.08;
        }
        .ln-highlight-quote {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px, 3vw, 40px); line-height: 1.2;
          letter-spacing: -1px; color: white;
        }
        .ln-highlight-quote em { font-style: italic; color: #f5c842; }
        .ln-highlight-right { font-family: 'DM Sans', sans-serif; }
        .ln-highlight-sub { font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 32px; }
        .ln-btn-yellow {
          background: #f5c842; color: #111; border: none;
          padding: 14px 32px; border-radius: 100px; cursor: pointer;
          font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .ln-btn-yellow:hover { background: #e8b400; transform: translateY(-2px); }

        /* FOOTER */
        .ln-footer {
          padding: 36px 56px; border-top: 1px solid #e8e8e2;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #aaa;
          margin-top: 80px;
        }
        .ln-footer-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px; font-weight: 700; color: #111;
        }

        /* ANIMATIONS */
        .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade-in.v { opacity: 1; transform: translateY(0); }

        /* DECORATIVE STARS */
        .star { position: absolute; font-size: 18px; color: #111; opacity: 0.15; pointer-events: none; }

        @media (max-width: 900px) {
          .ln-nav { padding: 14px 20px; }
          .ln-hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .ln-hero-right { display: none; }
          .ln-stats { grid-template-columns: repeat(2,1fr); }
          .ln-section { padding: 60px 24px; }
          .ln-features-grid { grid-template-columns: repeat(2,1fr); }
          .ln-works-grid { grid-template-columns: 1fr; }
          .ln-highlight { margin: 0 24px; padding: 48px 32px; grid-template-columns: 1fr; gap: 24px; }
          .ln-footer { padding: 24px; flex-direction: column; gap: 8px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="ln-nav">
        <div className="ln-logo">
          <span className="ln-logo-dot" />
          TodoApp
        </div>
        <div className="ln-nav-links">
          <button className="ln-nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>
            {mn ? "Функцууд" : "Features"}
          </button>
          <button className="ln-nav-link" onClick={() => document.getElementById('works')?.scrollIntoView({behavior:'smooth'})}>
            {mn ? "Модулиуд" : "Modules"}
          </button>
          <button className="ln-nav-link" onClick={() => navigate("/login")}>
            {mn ? "Нэвтрэх" : "Sign In"}
          </button>
        </div>
        <div className="ln-nav-right">
          <button className="ln-btn-ghost" onClick={toggleLang}>
            {mn ? "EN" : "МН"}
          </button>
          <button className="ln-btn-cta" onClick={() => navigate("/login")}>
            {mn ? "Эхлэх →" : "Get Started →"}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ln-hero">
        {/* Decorative stars */}
        <span className="star" style={{top:120,left:"52%",fontSize:22}}>✦</span>
        <span className="star" style={{top:200,right:"8%",fontSize:14}}>✦</span>
        <span className="star" style={{bottom:180,left:"48%",fontSize:16}}>✦</span>

        <div className={`ln-hero-left fade-in ${vis?"v":""}`}>
          <div className="ln-hero-tag">
            <span className="ln-hero-tag-line" />
            {mn ? "Ажлын хэрэгсэл" : "Productivity App"}
          </div>
          <h1 className="ln-hero-title">
            {mn ? (
              <><em>Бүтээмжтэй</em><br />ажиллах таны<br />орон зай</>
            ) : (
              <>Your <em>productive</em><br />inner<br />workspace</>
            )}
          </h1>
          <p className="ln-hero-sub">
            {mn
              ? "Todo, Хуанли, Тэмдэглэл, AI туслах, Санхүү — бүгдийг нэг дор. Ажлаа зохион байгуулж зорилгоо биелүүлээрэй."
              : "Todo, Calendar, Notes, AI Assistant, Finance — all in one place. Organize your work and achieve your goals."}
          </p>
          <div className="ln-hero-cta">
            <button className="ln-btn-big" onClick={() => navigate("/login")}>
              {mn ? "Үнэгүй эхлэх" : "Start for free"}
            </button>
            <button className="ln-btn-outline" onClick={() => navigate("/login")}>
              {mn ? "Нэвтрэх" : "Sign In"}
            </button>
          </div>
          <div className="ln-email-hint">
            <span className="ln-email-badge">✓ {mn ? "Бүртгэл үнэгүй" : "Free to sign up"}</span>
            <span className="ln-email-badge">✓ {mn ? "Кредит карт шаардахгүй" : "No credit card"}</span>
          </div>
        </div>

        <div className={`ln-hero-right fade-in ${vis?"v":""}`} style={{transitionDelay:"120ms"}}>
          {/* Floating badges */}
          <div className="ln-badge-float b1">
            <span className="ln-badge-icon">📅</span>
            <div>
              <div style={{fontSize:11,color:"#888",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{mn?"Өнөөдрийн ажил":"Today's Tasks"}</div>
              <div style={{fontSize:14,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>8 {mn?"ажил":"tasks"}</div>
            </div>
          </div>
          <div className="ln-badge-float b2">
            <span className="ln-badge-icon">✅</span>
            <div>
              <div style={{fontSize:11,color:"#888",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{mn?"Дууссан":"Completed"}</div>
              <div style={{fontSize:14,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:"#10b981"}}>68%</div>
            </div>
          </div>

          {/* Circle illustration */}
          <div className="ln-hero-circle">
            <svg width="100%" height="100%" viewBox="0 0 500 500" fill="none" style={{position:"absolute",inset:0}}>
              {/* Decorative rings */}
              <circle cx="250" cy="250" r="200" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="8 8"/>
              <circle cx="250" cy="250" r="150" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            </svg>
            {/* Sitting person SVG */}
            <svg width="75%" viewBox="0 0 280 340" fill="none" style={{position:"relative",zIndex:1}}>
              {/* Shadow */}
              <ellipse cx="140" cy="320" rx="70" ry="12" fill="rgba(0,0,0,0.12)"/>
              {/* Body */}
              <ellipse cx="140" cy="230" rx="48" ry="58" fill="#111"/>
              {/* Collar */}
              <path d="M118 190 Q140 198 162 190" stroke="#f5c842" strokeWidth="3" fill="none" strokeLinecap="round"/>
              {/* Head */}
              <ellipse cx="140" cy="148" rx="36" ry="38" fill="#fde68a"/>
              {/* Hair */}
              <ellipse cx="140" cy="124" rx="36" ry="22" fill="#1a1a1a"/>
              <path d="M106 142 Q98 170 104 190" stroke="#1a1a1a" strokeWidth="14" strokeLinecap="round"/>
              <path d="M174 142 Q182 165 178 188" stroke="#1a1a1a" strokeWidth="10" strokeLinecap="round"/>
              {/* Earrings */}
              <circle cx="104" cy="160" r="5" fill="#f5c842"/>
              <circle cx="176" cy="160" r="5" fill="#f5c842"/>
              {/* Eyes */}
              <ellipse cx="128" cy="152" rx="5" ry="6" fill="#1a1a1a"/>
              <ellipse cx="152" cy="152" rx="5" ry="6" fill="#1a1a1a"/>
              <circle cx="130" cy="150" r="2" fill="white"/>
              <circle cx="154" cy="150" r="2" fill="white"/>
              {/* Smile */}
              <path d="M128 168 Q140 176 152 168" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
              {/* Left arm */}
              <path d="M94 228 Q68 210 56 188" stroke="#111" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="52" cy="182" r="14" fill="#fde68a"/>
              {/* Right arm */}
              <path d="M186 228 Q212 210 224 188" stroke="#111" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="228" cy="182" r="14" fill="#fde68a"/>
              {/* Legs crossed */}
              <path d="M110 278 Q88 295 70 290" stroke="#111" strokeWidth="18" strokeLinecap="round"/>
              <path d="M170 278 Q192 295 210 290" stroke="#111" strokeWidth="18" strokeLinecap="round"/>
              <ellipse cx="66" cy="292" rx="18" ry="9" fill="#111"/>
              <ellipse cx="214" cy="292" rx="18" ry="9" fill="#111"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="ln-stats">
        {STATS.map((s,i) => (
          <div className="ln-stat" key={i}>
            <div className="ln-stat-n">{s.n}</div>
            <div className="ln-stat-l">{mn ? s.label : s.en}</div>
          </div>
        ))}
      </div>

      {/* ── WORKS / MODULES ── */}
      <div id="works" className="ln-section" style={{paddingBottom:60}}>
        <div className="ln-works-header">
          <div>
            <div className="ln-section-tag">
              <span className="ln-section-tag-dot"/>
              {mn ? "Модулиуд" : "App Modules"}
            </div>
            <div className="ln-section-title">
              {mn ? <>{`Ажлын`} <em>{`туршлага`}</em></> : <>My Work <em>Experience</em></>}
            </div>
          </div>
          <button className="ln-btn-ghost" onClick={() => navigate("/login")}
            style={{fontFamily:"'DM Sans',sans-serif",marginBottom:60}}>
            {mn ? "Бүгдийг харах →" : "View all →"}
          </button>
        </div>
        <div className="ln-works-grid">
          {WORKS.map((w, i) => (
            <div className="ln-work-card" key={i} onClick={() => navigate("/login")}>
              <div className="ln-work-card-top" style={{background: w.bg}}>
                <span style={{fontSize:56}}>{["📋","💰","🎯","🤖"][i]}</span>
                <span className="ln-work-card-tag" style={{background: w.accent}}>
                  {mn ? w.tag : w.tagEn}
                </span>
              </div>
              <div className="ln-work-card-body">
                <div className="ln-work-card-title">{mn ? w.title : w.en}</div>
                <div className="ln-work-card-sub" style={{fontFamily:"'DM Sans',sans-serif"}}>
                  {mn ? "Апп доторх модуль" : "Built-in module"}
                </div>
              </div>
              <div className="ln-work-card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HIGHLIGHT BANNER ── */}
      <div className="ln-highlight">
        <div className="ln-highlight-quote">
          {mn ? (
            <><em>Бүх ажлаа</em> нэг газраас удирдах цаг болсон.</>
          ) : (
            <>Time to manage <em>everything</em> from one place.</>
          )}
        </div>
        <div className="ln-highlight-right">
          <p className="ln-highlight-sub">
            {mn
              ? "TodoApp нь таны өдөр тутмын ажлыг зохион байгуулж, зорилгодоо хүрэхэд туслах бүрэн иж бүрдсэн хэрэгсэл юм. AI туслахтай хослуулснаар хэзээ ч гэрэлтэй байна."
              : "TodoApp is a complete toolkit to organize your daily life and achieve your goals. Combined with an AI assistant, you're always one step ahead."}
          </p>
          <button className="ln-btn-yellow" onClick={() => navigate("/login")}>
            {mn ? "Одоо эхлэх →" : "Get started now →"}
          </button>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" className="ln-section">
        <div className="ln-section-tag">
          <span className="ln-section-tag-dot"/>
          {mn ? "Бүх функцууд" : "All Features"}
        </div>
        <div className="ln-section-title">
          {mn ? <>Хэрэгтэй бүх зүйл <em>нэг дор</em></> : <>Everything you need <em>in one place</em></>}
        </div>
        <div className="ln-features-grid">
          {FEATURES.map((f, i) => (
            <div className="ln-feat" key={i}>
              <div className="ln-feat-num">0{i+1}</div>
              <span className="ln-feat-icon">{f.icon}</span>
              <div className="ln-feat-title">{mn ? f.title : f.en}</div>
              <div className="ln-feat-desc">{mn ? f.desc : f.enDesc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        <span className="ln-footer-logo">TodoApp</span>
        <span>{mn ? "© 2026 бүх эрх хуулиар хамгаалагдсан" : "© 2026 All rights reserved"}</span>
        <button className="ln-btn-ghost" onClick={() => navigate("/login")}>
          {mn ? "Нэвтрэх →" : "Sign In →"}
        </button>
      </footer>
    </div>
  );
}
