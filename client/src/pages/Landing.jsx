import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  MdOutlineTaskAlt, MdOutlineCalendarMonth, MdAutoAwesome, 
  MdOutlineAccountBalanceWallet, MdOutlineChatBubbleOutline,
  MdOutlineLightbulb, MdOutlineLock, MdArrowForward,
  MdOutlineAutoGraph, MdOutlineDashboardCustomize
} from "react-icons/md";

const NAV_LINKS = [
  { name: "Features", id: "features", mn: "Боломжууд" },
  { name: "Solutions", id: "solutions", mn: "Шийдэл" },
  { name: "About", id: "about", mn: "Бидний тухай" },
];

const BENTO_FEATURES = [
  {
    title: "Smart Task Management",
    mn: "Ухаалаг Таск",
    desc: "Organize with AI-powered priority sorting and real-time sync.",
    mnDesc: "AI-д суурилсан эрэмбэлэлт болон бодит цагийн синхрончлол.",
    icon: <MdOutlineTaskAlt />,
    size: "large",
    bg: "linear-gradient(135deg, #292524 0%, #3c3936 100%)",
    accent: "#ffffff"
  },
  {
    title: "AI Assistant",
    mn: "AI Туслах",
    desc: "Built-in Llama 3.3 integration for your productivity.",
    mnDesc: "Бүтээмжид тань туслах Llama 3.3 AI туслах.",
    icon: <MdAutoAwesome />,
    size: "small",
    bg: "#1c1917",
    accent: "#cccccc"
  },
  {
    title: "Finance Tracker",
    mn: "Санхүүгийн Хяналт",
    desc: "Track every penny with beautiful charts.",
    mnDesc: "Зарлага бүрээ үзэмжтэй графикаар хянах.",
    icon: <MdOutlineAccountBalanceWallet />,
    size: "small",
    bg: "#1c1917",
    accent: "#999999"
  },
  {
    title: "Bento Workflow",
    mn: "Бенто Урсгал",
    desc: "Everything you need in a single dashboard view.",
    mnDesc: "Хэрэгцээт бүх зүйлс таны нэг дороос.",
    icon: <MdOutlineDashboardCustomize />,
    size: "medium",
    bg: "linear-gradient(135deg, #292524 0%, #44403c 100%)",
    accent: "#ffffff"
  },
  {
    title: "Secure Collaboration",
    mn: "Аюулгүй Хамтын Ажиллагаа",
    desc: "Enterprise-grade security for your team chats.",
    mnDesc: "Багийн чатад зориулсан өндөр түвшний аюулгүй байдал.",
    icon: <MdOutlineLock />,
    size: "medium",
    bg: "#1c1917",
    accent: "#888888"
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "mn");
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
    setTimeout(() => setVis(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user]);

  const mn = lang === "mn";
  const toggleLang = () => {
    const nl = mn ? "en" : "mn";
    setLang(nl);
    localStorage.setItem("app_lang", nl);
  };

  return (
    <div className="landing-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --brand: #ffffff;
          --brand-light: #e5e5e5;
          --brand-dim: rgba(255, 255, 255, 0.1);
          --bg: #1c1917;
          --bg-card: #292524;
          --bg-card2: #3c3936;
          --text: #fefce8;
          --text-dim: #a8a29e;
          --border: rgba(254, 252, 232, 0.08);
        }

        .landing-root {
          background-color: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        h1, h2, h3 { font-family: 'Outfit', sans-serif; }

        /* ── NAVBAR ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          padding: ${scrolled ? '14px 6%' : '24px 6%'};
          background: ${scrolled ? 'rgba(28, 25, 23, 0.85)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(16px)' : 'none'};
          border-bottom: ${scrolled ? '1px solid var(--border)' : '1px solid transparent'};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo {
          font-size: 24px; font-weight: 800; display: flex; align-items: center; gap: 10px;
          color: #fff; letter-spacing: -0.5px; cursor: pointer;
        }
        .logo-box {
          width: 32px; height: 32px; background: var(--brand); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }

        .nav-links { display: flex; gap: 40px; }
        .nav-link {
          font-size: 14px; font-weight: 500; color: var(--text-dim);
          text-decoration: none; transition: color 0.2s; cursor: pointer;
        }
        .nav-link:hover { color: #fff; }

        .nav-btns { display: flex; gap: 16px; align-items: center; }

        /* ── HERO ── */
        .hero {
          position: relative; padding: 180px 6% 100px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }

        .hero-glow {
          position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
          width: 80vw; height: 60vh;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(28, 25, 23, 0) 70%);
          filter: blur(100px); z-index: 0; pointer-events: none;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.25);
          color: var(--brand-light); padding: 6px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 600; margin-bottom: 24px;
          display: flex; align-items: center; gap: 8px;
          animation: slideDown 0.6s ease both;
        }

        .hero-title {
          font-size: clamp(40px, 8vw, 92px); font-weight: 800; line-height: 1.05;
          letter-spacing: -3px; margin-bottom: 24px; max-width: 1000px;
          background: linear-gradient(to bottom, #fefce8 40%, rgba(254,252,232,0.5) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease 0.1s both;
        }

        .hero-desc {
          font-size: clamp(16px, 1.5vw, 20px); color: var(--text-dim); line-height: 1.6;
          max-width: 600px; margin-bottom: 40px;
          animation: fadeInUp 0.8s ease 0.2s both;
        }

        .hero-ctas {
          display: flex; gap: 16px; animation: fadeInUp 0.8s ease 0.3s both;
        }

        .btn-primary {
          background: var(--brand); color: #1c1917; padding: 14px 32px; border-radius: 12px;
          font-size: 15px; font-weight: 700; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.3s;
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
        }
        .btn-primary:hover { background: #a3e635; transform: translateY(-2px); box-shadow: 0 15px 35px rgba(255, 255, 255, 0.4); }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.03); color: #fff; padding: 14px 32px; border-radius: 12px;
          font-size: 15px; font-weight: 600; border: 1px solid var(--border); cursor: pointer;
          transition: all 0.3s;
        }
        .btn-secondary:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); }

        /* ── BENTO GRID ── */
        .section { padding: 100px 6%; }
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-title { font-size: 44px; font-weight: 800; margin-bottom: 16px; letter-spacing: -1px; }
        .section-desc { color: var(--text-dim); max-width: 600px; margin: 0 auto; }

        .bento-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 240px);
          gap: 20px; max-width: 1200px; margin: 0 auto;
        }

        .bento-card {
          border-radius: 24px; padding: 32px; border: 1px solid var(--border);
          position: relative; overflow: hidden; display: flex; flex-direction: column;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;
          background: var(--bg-card);
        }
        .bento-card:hover { border-color: rgba(255, 255, 255, 0.3); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .bento-card.large { grid-column: span 2; grid-row: span 2; }
        .bento-card.medium { grid-column: span 2; }
        .bento-card.small { grid-column: span 1; }

        .bento-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 24px;
        }

        .bento-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text); }
        .bento-desc { font-size: 14px; color: var(--text-dim); line-height: 1.6; }

        .bento-bg {
          position: absolute; inset: 0; opacity: 0.1; z-index: -1;
          transition: opacity 0.3s;
        }
        .bento-card:hover .bento-bg { opacity: 0.15; }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid var(--border); padding: 60px 6%;
          display: flex; flex-direction: column; align-items: center; gap: 40px;
        }
        .footer-bottom {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; color: var(--text-dim);
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); grid-template-rows: auto; }
          .bento-card.large, .bento-card.medium, .bento-card.small { grid-column: span 2; min-height: 240px; }
          .nav-links { display: none; }
        }

        @media (max-width: 640px) {
          .hero { padding: 120px 6% 60px; }
          .hero-title { letter-spacing: -1px; }
          .hero-ctas { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; }
          .hero-ctas button { width: 100%; justify-content: center; }
          .bento-grid { grid-template-columns: 1fr; }
          .bento-card.large, .bento-card.medium, .bento-card.small { grid-column: span 1; min-height: 200px; }
          .section { padding: 60px 5%; }
          .section-title { font-size: 28px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .nav { padding: 14px 5%; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="nav">
        <div className="logo" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="logo-box">
            <MdOutlineTaskAlt size={20} color="#fff" />
          </div>
          TodoApp
        </div>

        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <a key={l.id} className="nav-link" onClick={() => document.getElementById(l.id)?.scrollIntoView({behavior:'smooth'})}>
              {mn ? l.mn : l.name}
            </a>
          ))}
        </div>

        <div className="nav-btns">
          <button className="nav-link" style={{background:'none', border:'none'}} onClick={toggleLang}>
            {mn ? "EN" : "МН"}
          </button>
          <button className="btn-secondary" style={{padding: '8px 20px', fontSize: 13}} onClick={() => navigate("/login")}>
            {mn ? "Нэвтрэх" : "Login"}
          </button>
          <button className="btn-primary" style={{padding: '8px 24px', fontSize: 13}} onClick={() => navigate("/login")}>
            {mn ? "Эхлэх" : "Sign Up"}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">
          <MdOutlineAutoGraph />
          {mn ? "Хамгийн сүүлийн үеийн бүтээмжийн систем" : "Next-gen productivity system"}
        </div>
        <h1 className="hero-title">
          {mn ? "Бүтээмжээ цоо шинэ" : "Elevate your focus to"}
          <br />
          <span style={{color: 'var(--brand)'}}>{mn ? "түвшинд хүргэ." : "new heights."}</span>
        </h1>
        <p className="hero-desc">
          {mn 
            ? "Таны ажлыг хялбарчлах, AI-аар тоноглогдсон бүхэл бүтэн экосистем. Todo, Санхүү, Чат — бүгд нэг дор."
            : "The all-in-one workspace designed to simplify your work. Tasks, Finance, AI, and Chat — unified."}
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            {mn ? "Одоо туршаад үз" : "Get Started Now"}
            <MdArrowForward />
          </button>
          <button className="btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>
            {mn ? "Дэлгэрэнгүй" : "Learn More"}
          </button>
        </div>
      </section>

      {/* ── BENTO SECTION ── */}
      <section id="features" className="section">
        <div className="section-header">
          <div className="hero-badge" style={{margin:'0 auto 20px'}}>
            <MdOutlineDashboardCustomize />
            {mn ? "Функцууд" : "Features"}
          </div>
          <h2 className="section-title">
            {mn ? "Таны хэрэгцээнд зориулсан" : "Designed for your"}
            <br />
            <em>{mn ? "бүх зүйлс" : "everyday flow"}</em>
          </h2>
        </div>

        <div className="bento-grid">
          {BENTO_FEATURES.map((f, i) => (
            <div key={i} className={`bento-card ${f.size}`}>
              <div className="bento-bg" style={{ background: f.bg }} />
              <div className="bento-icon" style={{ background: `${f.accent}20`, color: f.accent }}>
                {f.icon}
              </div>
              <h3 className="bento-title">{mn ? f.mn : f.title}</h3>
              <p className="bento-desc">{mn ? f.mnDesc : f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="section" style={{textAlign:'center'}}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(41, 37, 36, 0.6) 100%)',
          padding: '80px 40px', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.15)',
          maxWidth: '1000px', margin: '0 auto'
        }}>
          <h2 className="section-title" style={{fontSize: 'clamp(32px, 4vw, 52px)'}}>
            {mn ? "Ирээдүйнхээ төлөө өнөөдөр эхлэ." : "Ready to master your time?"}
          </h2>
          <p className="hero-desc" style={{margin: '0 auto 32px'}}>
            {mn ? "Кредит карт шаардахгүй. Бүртгүүлээд шууд ашигла." : "No credit card required. Sign up in seconds."}
          </p>
          <button className="btn-primary" style={{margin:'0 auto'}} onClick={() => navigate("/login")}>
            {mn ? "Үнэгүй бүртгүүлэх" : "Join for Free"}
            <MdArrowForward />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="logo">
          <div className="logo-box">
            <MdOutlineTaskAlt size={20} color="#fff" />
          </div>
          TodoApp
        </div>
        <div className="footer-bottom">
          <span>© 2026 TodoApp. All rights reserved.</span>
          <div style={{display:'flex', gap:'24px'}}>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
