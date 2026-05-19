import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const FEATURES = [
  { icon: "✓", title: "Ухаалаг Todo", en: "Smart Todos", desc: "Ангилал, тэргүүлэх дарааллаар зохион байгуулж дэвшлээ хянаарай.", enDesc: "Organize by category and priority. Track your progress effortlessly." },
  { icon: "◈", title: "Хуанли", en: "Calendar", desc: "Бүх ажлаа хуанли дээр харж цаг хугацааг зөв хуваарилаарай.", enDesc: "Visualize all tasks on a calendar and plan your time with precision." },
  { icon: "🎯", title: "Vision Board", en: "Vision Board", desc: "Зорилго мөрөөдлөө зурган хавтан дээр цуглуулж өдөр бүр сэдэлжүүл.", enDesc: "Pin your goals on a visual board. Stay inspired every single day." },
  { icon: "✍", title: "Тэмдэглэл", en: "Notes", desc: "Санаа төлөвлөгөөгөө хурдан бичиж хадгалаарай.", enDesc: "Capture ideas and plans instantly. Rich note-taking built right in." },
  { icon: "⬡", title: "AI Туслах", en: "AI Assistant", desc: "Groq AI-аар асуулт асуу зөвлөгөө ав — апп доторхоос.", enDesc: "Ask Groq AI anything right inside the app. Built-in intelligence." },
  { icon: "◎", title: "Групп Чат", en: "Group Chat", desc: "Багийнхантайгаа шууд харилцаж хамтран ажиллаарай.", enDesc: "Collaborate with your team in real-time. Built-in group chat." },
  { icon: "💰", title: "Санхүү", en: "Finance", desc: "Орлого зарлагаа хянаж төсвөө зөв удирдаарай.", enDesc: "Track income and expenses. Manage your budget with ease." },
  { icon: "⏳", title: "Ирээдүйн хайрцаг", en: "Future Capsule", desc: "Өөртөө захиа бичиж ирээдүйд нээх хайрцагт хийгээрэй.", enDesc: "Write letters to your future self. Open them when the time is right." },
];

const STATS = [
  { n: "250+", label: "Хэрэглэгч", en: "Active Users" },
  { n: "8+", label: "Функц", en: "Features" },
  { n: "AI", label: "Туслах", en: "Groq AI" },
  { n: "24/7", label: "Ажиллана", en: "Available" },
];

const MARQUEE_ITEMS = [
  "📋 Todo Management", "📅 Calendar", "🤖 Groq AI", "💰 Finance", "✍ Notes",
  "🎯 Vision Board", "💬 Group Chat", "⏳ Future Capsule", "🏆 Habits", "📊 Dashboard",
];

const WORKS = [
  { title: "Todo Удирдлага", en: "Task Management", tag: "Productivity", tagEn: "Productivity", bg: "linear-gradient(135deg,#e0e7ff,#c7d2fe)", accent: "#4f46e5", icon: "📋" },
  { title: "Санхүүгийн хяналт", en: "Finance Tracker", tag: "Finance", tagEn: "Finance", bg: "linear-gradient(135deg,#fef3c7,#fde68a)", accent: "#d97706", icon: "💰" },
  { title: "Vision Board", en: "Vision Board", tag: "Motivation", tagEn: "Motivation", bg: "linear-gradient(135deg,#fae8ff,#e9d5ff)", accent: "#9333ea", icon: "🎯" },
  { title: "AI Чат туслах", en: "AI Chat Assistant", tag: "Intelligence", tagEn: "Intelligence", bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", accent: "#059669", icon: "🤖" },
];

function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isNum = /^\d+/.test(String(target));
    if (!isNum) { setVal(target); return; }
    const num = parseInt(target);
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const prog = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.floor(eased * num) + (String(target).replace(/^\d+/, "") || ""));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target]);
  return val;
}

function StatCard({ stat, mn, animate }) {
  const display = useCountUp(stat.n, 1600, animate);
  return (
    <div className="ln-stat">
      <div className="ln-stat-n">{animate ? display || stat.n : stat.n}</div>
      <div className="ln-stat-l">{mn ? stat.label : stat.en}</div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "mn");
  const [vis, setVis] = useState(false);
  const [statsVis, setStatsVis] = useState(false);
  const statsRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (user) navigate("/dashboard");
    setTimeout(() => setVis(true), 60);

    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);

    return () => { window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, [user]);

  const mn = lang === "mn";
  const toggleLang = () => {
    const nl = mn ? "en" : "mn";
    setLang(nl);
    localStorage.setItem("app_lang", nl);
  };

  const parallaxY = scrollY * 0.3;

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf7", color: "#111", fontFamily: "'Playfair Display', Georgia, serif", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── ORB BACKGROUND ── */
        .ln-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }

        /* ── NAV ── */
        .ln-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 56px;
          background: rgba(250,250,247,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: padding 0.3s;
        }
        .ln-logo {
          font-family: 'Playfair Display', serif;
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
        .ln-btn-cta:hover { background: #333; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }

        /* ── HERO ── */
        .ln-hero {
          min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; gap: 0;
          padding: 100px 56px 60px;
          position: relative; overflow: hidden;
        }
        .ln-hero-left { display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 1; }
        .ln-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 700;
          color: #777; letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 22px;
        }
        .ln-hero-tag-pill {
          background: #f5c842; color: #111; font-size: 10.5px; font-weight: 700;
          padding: 3px 10px; border-radius: 100px; letter-spacing: 1.2px;
        }
        .ln-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 5.5vw, 80px);
          line-height: 1.03; letter-spacing: -2px;
          color: #111; margin-bottom: 24px;
        }
        .ln-hero-title em { font-style: italic; color: #888; }
        .ln-hero-title .accent-word {
          display: inline-block; position: relative;
        }
        .ln-hero-title .accent-word::after {
          content: ''; position: absolute; bottom: 4px; left: 0; right: 0;
          height: 3px; background: #f5c842; border-radius: 2px;
          animation: underlineGrow 0.8s ease 0.6s both;
        }
        @keyframes underlineGrow { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); } }
        .ln-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; color: #666; line-height: 1.75;
          max-width: 440px; margin-bottom: 36px; font-weight: 400;
        }
        .ln-hero-cta { display: flex; gap: 12px; align-items: center; margin-bottom: 44px; }
        .ln-btn-big {
          font-family: 'DM Sans', sans-serif;
          background: #111; color: #fff; border: none;
          padding: 15px 34px; border-radius: 100px; cursor: pointer;
          font-size: 15px; font-weight: 700; transition: all 0.22s;
          display: flex; align-items: center; gap: 8px;
        }
        .ln-btn-big:hover { background: #222; transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.22); }
        .ln-btn-outline {
          font-family: 'DM Sans', sans-serif;
          background: none; border: 1.5px solid #ccc; color: #444;
          padding: 14px 28px; border-radius: 100px; cursor: pointer;
          font-size: 15px; font-weight: 500; transition: all 0.18s;
        }
        .ln-btn-outline:hover { border-color: #111; color: #111; background: #f5f5f2; }
        .ln-trust-row {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .ln-trust-badge {
          background: #f0f0ea; border-radius: 100px; padding: 6px 14px;
          font-size: 12px; color: #555; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 5px; font-weight: 500;
        }

        /* ── HERO RIGHT ── */
        .ln-hero-right { position: relative; display: flex; align-items: center; justify-content: center; z-index: 1; }
        .ln-hero-circle {
          width: clamp(320px, 38vw, 540px);
          height: clamp(320px, 38vw, 540px);
          border-radius: 50%;
          background: linear-gradient(145deg, #f5e6b8 0%, #f5c842 55%, #e8b400 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: flex-end; justify-content: center;
          box-shadow: 0 40px 120px rgba(245,200,66,0.35);
        }
        .ln-badge-float {
          position: absolute; background: white;
          border-radius: 16px; padding: 11px 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.14);
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600; color: #111;
          animation: floatBadge 4s ease-in-out infinite;
          z-index: 2;
        }
        .ln-badge-float.b1 { top: 18%; left: -10%; animation-delay: 0s; }
        .ln-badge-float.b2 { top: 28%; right: -12%; animation-delay: -2s; }
        .ln-badge-float.b3 { bottom: 22%; left: -6%; animation-delay: -1s; }
        .ln-badge-icon { font-size: 20px; }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        /* ── MARQUEE ── */
        .ln-marquee-wrap {
          overflow: hidden; background: #111; color: #fff; padding: 14px 0;
          border-top: 1px solid #222; border-bottom: 1px solid #222;
        }
        .ln-marquee-track {
          display: flex; gap: 0;
          animation: marqueeScroll 28s linear infinite;
          white-space: nowrap;
        }
        .ln-marquee-track:hover { animation-play-state: paused; }
        .ln-marquee-item {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          padding: 0 32px; color: rgba(255,255,255,0.7);
          border-right: 1px solid rgba(255,255,255,0.12);
        }
        .ln-marquee-item:hover { color: #f5c842; }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── STATS BAR ── */
        .ln-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid #e8e8e2; border-bottom: 1px solid #e8e8e2;
          background: #fff;
        }
        .ln-stat {
          padding: 36px 48px; border-right: 1px solid #e8e8e2;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.18s;
        }
        .ln-stat:last-child { border-right: none; }
        .ln-stat:hover { background: #fafaf7; }
        .ln-stat-n {
          font-family: 'Playfair Display', serif;
          font-size: 40px; font-weight: 900; color: #111; letter-spacing: -1.5px;
          line-height: 1;
        }
        .ln-stat-l { font-size: 13px; color: #888; margin-top: 6px; font-weight: 500; }

        /* ── SECTION SHARED ── */
        .ln-section { padding: 110px 56px; max-width: 1220px; margin: 0 auto; }
        .ln-section-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 11.5px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #888; margin-bottom: 20px;
        }
        .ln-section-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #f5c842; }
        .ln-section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 3.8vw, 54px); line-height: 1.08;
          letter-spacing: -1.5px; color: #111; margin-bottom: 60px;
        }
        .ln-section-title em { font-style: italic; color: #999; }

        /* ── WORKS GRID ── */
        .ln-works-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .ln-works-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .ln-work-card {
          border-radius: 24px; overflow: hidden;
          border: 1px solid #e8e8e2; cursor: pointer;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
          position: relative; background: #fff;
        }
        .ln-work-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 24px 64px rgba(0,0,0,0.12); }
        .ln-work-card-top {
          height: 200px; display: flex; align-items: center; justify-content: center;
          font-size: 60px; position: relative; transition: transform 0.3s;
        }
        .ln-work-card:hover .ln-work-card-top { transform: scale(1.04); }
        .ln-work-card-tag {
          position: absolute; top: 16px; right: 16px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; color: white;
          padding: 5px 12px; border-radius: 100px;
        }
        .ln-work-card-body { padding: 22px 26px 26px; }
        .ln-work-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 700; color: #111; margin-bottom: 7px;
        }
        .ln-work-card-sub { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #888; }
        .ln-work-card-arrow {
          position: absolute; bottom: 22px; right: 22px;
          width: 34px; height: 34px; border-radius: 50%; background: #111;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 15px; transition: all 0.2s;
        }
        .ln-work-card:hover .ln-work-card-arrow { background: #f5c842; color: #111; transform: rotate(45deg); }

        /* ── FEATURES GRID ── */
        .ln-features-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
          background: #e8e8e2; border-radius: 24px; overflow: hidden;
          border: 1px solid #e8e8e2;
        }
        .ln-feat {
          background: #fff; padding: 36px 30px;
          transition: background 0.18s, transform 0.2s;
          cursor: default;
        }
        .ln-feat:hover { background: #fafaf7; transform: translateY(-2px); }
        .ln-feat-num {
          font-family: 'Playfair Display', serif;
          font-size: 11px; color: #ccc; margin-bottom: 22px;
          font-weight: 700; letter-spacing: 1px;
        }
        .ln-feat-icon { font-size: 28px; margin-bottom: 16px; display: block; }
        .ln-feat-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #111;
          margin-bottom: 9px; letter-spacing: -0.3px;
        }
        .ln-feat-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; color: #888; line-height: 1.7;
        }

        /* ── HIGHLIGHT BANNER ── */
        .ln-highlight {
          margin: 0 56px; border-radius: 32px;
          background: #111; color: white;
          padding: 88px 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 72px;
          align-items: center; position: relative; overflow: hidden;
        }
        .ln-highlight::before {
          content: ''; position: absolute;
          top: -140px; right: -140px; width: 400px; height: 400px;
          background: #f5c842; border-radius: 50%; opacity: 0.07;
        }
        .ln-highlight::after {
          content: ''; position: absolute;
          bottom: -80px; left: 30%; width: 260px; height: 260px;
          background: #f5c842; border-radius: 50%; opacity: 0.04;
        }
        .ln-highlight-quote {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3vw, 44px); line-height: 1.18;
          letter-spacing: -1px; color: white; position: relative; z-index: 1;
        }
        .ln-highlight-quote em { font-style: italic; color: #f5c842; }
        .ln-highlight-right { font-family: 'DM Sans', sans-serif; position: relative; z-index: 1; }
        .ln-highlight-sub {
          font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.8;
          margin-bottom: 36px;
        }
        .ln-btn-yellow {
          background: #f5c842; color: #111; border: none;
          padding: 15px 34px; border-radius: 100px; cursor: pointer;
          font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .ln-btn-yellow:hover { background: #e8b400; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(245,200,66,0.4); }

        /* ── FOOTER ── */
        .ln-footer {
          padding: 40px 56px; border-top: 1px solid #e8e8e2;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #aaa;
          margin-top: 90px;
        }
        .ln-footer-logo {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #111;
          display: flex; align-items: center; gap: 7px;
        }

        /* ── APP PREVIEW MOCKUP ── */
        .ln-preview-card {
          background: #fff; border-radius: 20px; padding: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1); border: 1px solid #e8e8e2;
        }
        .ln-preview-bar {
          background: #f0ede8; border-radius: 10px; height: 8px;
          margin-bottom: 10px; display: flex; gap: 4px; align-items: center; padding: 0 8px;
        }
        .ln-preview-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* ── ANIMATIONS ── */
        .fade-in { opacity: 0; transform: translateY(28px); transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1); }
        .fade-in.v { opacity: 1; transform: translateY(0); }
        .fade-up { opacity: 0; transform: translateY(40px); transition: all 0.7s cubic-bezier(.16,1,.3,1); }
        .fade-up.v { opacity: 1; transform: translateY(0); }

        /* ── DECORATIVE ── */
        .star { position: absolute; color: #111; opacity: 0.1; pointer-events: none; font-size: 18px; }
        .star.spin { animation: starSpin 20s linear infinite; }
        @keyframes starSpin { to { transform: rotate(360deg); } }

        @media (max-width: 960px) {
          .ln-nav { padding: 14px 24px; }
          .ln-hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .ln-hero-right { display: none; }
          .ln-stats { grid-template-columns: repeat(2,1fr); }
          .ln-section { padding: 70px 24px; }
          .ln-features-grid { grid-template-columns: repeat(2,1fr); }
          .ln-works-grid { grid-template-columns: 1fr; }
          .ln-highlight { margin: 0 24px; padding: 56px 36px; grid-template-columns: 1fr; gap: 28px; }
          .ln-footer { padding: 28px 24px; flex-direction: column; gap: 10px; text-align: center; }
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
        {/* Background orbs */}
        <div className="ln-orb" style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(245,200,66,0.18) 0%, transparent 70%)",
          top: -100, right: -100,
          transform: `translateY(${parallaxY * 0.2}px)`,
        }}/>
        <div className="ln-orb" style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          bottom: 0, left: "30%",
          transform: `translateY(${-parallaxY * 0.1}px)`,
        }}/>
        <div className="ln-orb" style={{
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          top: "40%", left: -80,
        }}/>

        {/* Decorative stars */}
        <span className="star spin" style={{top:140,left:"52%",fontSize:20}}>✦</span>
        <span className="star" style={{top:220,right:"7%",fontSize:13}}>✦</span>
        <span className="star" style={{bottom:200,left:"48%",fontSize:15}}>✦</span>
        <span className="star" style={{top:"60%",right:"5%",fontSize:11}}>★</span>

        <div className={`ln-hero-left fade-in ${vis?"v":""}`}>
          <div className="ln-hero-tag">
            <span className="ln-hero-tag-pill">NEW</span>
            {mn ? "Бүтээмжийн апп" : "Productivity App"}
          </div>
          <h1 className="ln-hero-title">
            {mn ? (
              <><span className="accent-word">Бүтээмжтэй</span><br /><em>ажиллах</em> таны<br />орон зай</>
            ) : (
              <>Your <span className="accent-word">productive</span><br /><em>inner</em><br />workspace</>
            )}
          </h1>
          <p className="ln-hero-sub">
            {mn
              ? "Todo, Хуанли, Тэмдэглэл, Groq AI туслах, Санхүү — бүгдийг нэг дор. Ажлаа зохион байгуулж зорилгоо биелүүлээрэй."
              : "Todo, Calendar, Notes, Groq AI Assistant, Finance — all in one place. Organize your work and achieve your goals."}
          </p>
          <div className="ln-hero-cta">
            <button className="ln-btn-big" onClick={() => navigate("/login")}>
              {mn ? "Үнэгүй эхлэх" : "Start for free"}
              <span>→</span>
            </button>
            <button className="ln-btn-outline" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>
              {mn ? "Функцүүд үзэх" : "See features"}
            </button>
          </div>
          <div className="ln-trust-row">
            <span className="ln-trust-badge">✓ {mn ? "Бүртгэл үнэгүй" : "Free to sign up"}</span>
            <span className="ln-trust-badge">✓ {mn ? "Кредит карт шаардахгүй" : "No credit card"}</span>
            <span className="ln-trust-badge">🤖 Groq AI</span>
          </div>
        </div>

        <div className={`ln-hero-right fade-in ${vis?"v":""}`} style={{transitionDelay:"150ms"}}>
          {/* Floating badges */}
          <div className="ln-badge-float b1">
            <span className="ln-badge-icon">📅</span>
            <div>
              <div style={{fontSize:10.5,color:"#888",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{mn?"Өнөөдрийн ажил":"Today's Tasks"}</div>
              <div style={{fontSize:14,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>8 {mn?"ажил":"tasks"}</div>
            </div>
          </div>
          <div className="ln-badge-float b2">
            <span className="ln-badge-icon">✅</span>
            <div>
              <div style={{fontSize:10.5,color:"#888",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{mn?"Дууссан":"Completed"}</div>
              <div style={{fontSize:14,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:"#10b981"}}>68%</div>
            </div>
          </div>
          <div className="ln-badge-float b3">
            <span className="ln-badge-icon">🤖</span>
            <div>
              <div style={{fontSize:10.5,color:"#888",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{mn?"AI Туслах":"AI Assistant"}</div>
              <div style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:"#8b5cf6"}}>Groq</div>
            </div>
          </div>

          {/* Circle illustration */}
          <div className="ln-hero-circle">
            <svg width="100%" height="100%" viewBox="0 0 500 500" fill="none" style={{position:"absolute",inset:0}}>
              <circle cx="250" cy="250" r="200" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="8 8"/>
              <circle cx="250" cy="250" r="150" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
              <circle cx="250" cy="250" r="100" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
            </svg>
            {/* Person SVG */}
            <svg width="75%" viewBox="0 0 280 340" fill="none" style={{position:"relative",zIndex:1}}>
              <ellipse cx="140" cy="320" rx="70" ry="12" fill="rgba(0,0,0,0.12)"/>
              <ellipse cx="140" cy="230" rx="48" ry="58" fill="#111"/>
              <path d="M118 190 Q140 198 162 190" stroke="#f5c842" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <ellipse cx="140" cy="148" rx="36" ry="38" fill="#fde68a"/>
              <ellipse cx="140" cy="124" rx="36" ry="22" fill="#1a1a1a"/>
              <path d="M106 142 Q98 170 104 190" stroke="#1a1a1a" strokeWidth="14" strokeLinecap="round"/>
              <path d="M174 142 Q182 165 178 188" stroke="#1a1a1a" strokeWidth="10" strokeLinecap="round"/>
              <circle cx="104" cy="160" r="5" fill="#f5c842"/>
              <circle cx="176" cy="160" r="5" fill="#f5c842"/>
              <ellipse cx="128" cy="152" rx="5" ry="6" fill="#1a1a1a"/>
              <ellipse cx="152" cy="152" rx="5" ry="6" fill="#1a1a1a"/>
              <circle cx="130" cy="150" r="2" fill="white"/>
              <circle cx="154" cy="150" r="2" fill="white"/>
              <path d="M128 168 Q140 176 152 168" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M94 228 Q68 210 56 188" stroke="#111" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="52" cy="182" r="14" fill="#fde68a"/>
              <path d="M186 228 Q212 210 224 188" stroke="#111" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="228" cy="182" r="14" fill="#fde68a"/>
              <path d="M110 278 Q88 295 70 290" stroke="#111" strokeWidth="18" strokeLinecap="round"/>
              <path d="M170 278 Q192 295 210 290" stroke="#111" strokeWidth="18" strokeLinecap="round"/>
              <ellipse cx="66" cy="292" rx="18" ry="9" fill="#111"/>
              <ellipse cx="214" cy="292" rx="18" ry="9" fill="#111"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="ln-marquee-wrap">
        <div className="ln-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="ln-marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="ln-stats" ref={statsRef}>
        {STATS.map((s,i) => (
          <StatCard key={i} stat={s} mn={mn} animate={statsVis} />
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
            <div className="ln-section-title" style={{marginBottom:0}}>
              {mn ? <>{`Хүчирхэг`} <em>{`модулиуд`}</em></> : <>Powerful <em>modules</em></>}
            </div>
          </div>
          <button className="ln-btn-ghost" onClick={() => navigate("/login")}
            style={{fontFamily:"'DM Sans',sans-serif"}}>
            {mn ? "Бүгдийг харах →" : "View all →"}
          </button>
        </div>
        <div style={{height:48}}/>
        <div className="ln-works-grid">
          {WORKS.map((w, i) => (
            <div className="ln-work-card" key={i} onClick={() => navigate("/login")}>
              <div className="ln-work-card-top" style={{background: w.bg}}>
                <span>{w.icon}</span>
                <span className="ln-work-card-tag" style={{background: w.accent}}>
                  {mn ? w.tag : w.tagEn}
                </span>
              </div>
              <div className="ln-work-card-body">
                <div className="ln-work-card-title">{mn ? w.title : w.en}</div>
                <div className="ln-work-card-sub">{mn ? "Апп доторх модуль" : "Built-in module"}</div>
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
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(245,200,66,0.12)", border:"1px solid rgba(245,200,66,0.25)",
            borderRadius:100, padding:"6px 16px", marginBottom:20,
            fontSize:12, color:"#f5c842", fontFamily:"'DM Sans',sans-serif", fontWeight:600,
          }}>
            🤖 {mn ? "Groq AI-тай" : "Powered by Groq AI"}
          </div>
          <p className="ln-highlight-sub">
            {mn
              ? "TodoApp нь таны өдөр тутмын ажлыг зохион байгуулж, зорилгодоо хүрэхэд туслах бүрэн иж бүрдсэн хэрэгсэл юм. Groq AI туслахтай хослуулснаар хэзээ ч гэрэлтэй байна."
              : "TodoApp is a complete toolkit to organize your daily life and achieve your goals. Combined with Groq AI assistant, you're always one step ahead."}
          </p>
          <button className="ln-btn-yellow" onClick={() => navigate("/login")}>
            {mn ? "Одоо эхлэх" : "Get started now"} →
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

      {/* ── CTA BOTTOM ── */}
      <div style={{
        margin: "0 56px", marginBottom: 0, borderRadius: 24,
        background: "linear-gradient(135deg, #fafaf7 0%, #f0ede8 100%)",
        border: "1px solid #e8e8e2", padding: "72px 80px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 32,
      }}>
        <div>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(28px,3vw,48px)", fontWeight:900,
            letterSpacing:"-1.5px", color:"#111", lineHeight:1.1,
            marginBottom:12,
          }}>
            {mn ? "Өнөөдрөөс эхлэ." : "Start today."}
            <br/>
            <span style={{color:"#f5c842"}}>{mn ? "Үнэгүй." : "For free."}</span>
          </div>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", color:"#888",
            fontSize:15, lineHeight:1.7, maxWidth:460,
          }}>
            {mn ? "Бүртгэл хийж апп-ыг туршиж үзээрэй. Кредит карт шаардахгүй." : "Sign up and try the app. No credit card required."}
          </p>
        </div>
        <button className="ln-btn-big" onClick={() => navigate("/login")} style={{fontSize:16,padding:"16px 40px"}}>
          {mn ? "Бүртгүүлэх" : "Create Account"} →
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        <span className="ln-footer-logo">
          <span style={{width:8,height:8,borderRadius:"50%",background:"#f5c842",display:"inline-block"}}/>
          TodoApp
        </span>
        <span>{mn ? "© 2026 бүх эрх хуулиар хамгаалагдсан" : "© 2026 All rights reserved"}</span>
        <button className="ln-btn-ghost" onClick={() => navigate("/login")}>
          {mn ? "Нэвтрэх →" : "Sign In →"}
        </button>
      </footer>
    </div>
  );
}
