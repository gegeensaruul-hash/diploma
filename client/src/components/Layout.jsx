import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import GroupChat from "./GroupChat";
import AIChat from "./AIChat";
import { MdChat, MdAutoAwesome } from "react-icons/md";
import { useSettings } from "../context/SettingsContext";

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState("ai"); // "ai" | "group"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { lang, theme } = useSettings();
  const location = useLocation();
  const toggle = () => setSidebarOpen(v => !v);

  return (
    <div className="flex h-screen overflow-hidden relative p-0 md:p-4 gap-0 md:gap-4 font-sans" style={{ background: "var(--bg-app)" }}>
      {/* Dynamic Glowing Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen hidden md:block" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen hidden md:block" />
      
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Dock */}
      <div 
        className={`fixed md:relative inset-y-0 left-0 z-50 h-full transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          width: sidebarOpen ? 80 : 0,
          flexShrink: 0,
          overflow: "visible",
        }}
      >
        <div style={{ width: 80, height: "100%" }}>
          <Sidebar onClose={() => setSidebarOpen(false)} onMenuToggle={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Bento Box */}
      <div className="flex flex-col flex-1 min-w-0 backdrop-blur-2xl rounded-none md:rounded-[40px] border-0 md:border overflow-hidden relative shadow-2xl z-40" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <Navbar
          onChatToggle={() => setChatOpen(v => !v)}
          chatOpen={chatOpen}
          onMenuToggle={toggle}
          sidebarOpen={sidebarOpen}
        />
        <main className={`flex-1 overflow-y-auto ${location.pathname.startsWith("/visionboard") || location.pathname.startsWith("/futurecapsule") || location.pathname.startsWith("/notes") ? "p-0" : "px-4 md:px-6 pb-6"}`}>
          <div className={`${location.pathname.startsWith("/visionboard") || location.pathname.startsWith("/futurecapsule") || location.pathname.startsWith("/notes") ? "h-full w-full" : "max-w-7xl mx-auto py-4 md:py-6"}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Chat Mobile Overlay */}
      {chatOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Chat panel */}
      <div
        className={`fixed md:relative inset-y-0 right-0 z-50 md:z-40 h-full flex flex-col shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:bg-transparent ${chatOpen ? 'translate-x-0 w-full max-w-full md:max-w-[320px]' : 'translate-x-full md:translate-x-0 w-0 max-w-0'}`}
        style={{
          borderLeft: chatOpen ? "1px solid var(--border)" : "none",
          background: "var(--bg-card)",
          overflow: "hidden"
        }}
      >
        <div style={{ width: '100%', minWidth: 280, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Tab switcher */}
          <div style={{
            display: "flex", borderBottom: "1px solid var(--border)",
            flexShrink: 0, background: "var(--bg-card)",
          }}>
            <button
              onClick={() => setChatTab("ai")}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "16px 0", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all .2s",
                background: chatTab === "ai" ? `${theme.accent}15` : "transparent",
                color: chatTab === "ai" ? theme.accent : "var(--text3)",
                borderBottom: chatTab === "ai" ? `3px solid ${theme.accent}` : "3px solid transparent",
              }}
            >
              <MdAutoAwesome size={18} />
              AI Assistant
            </button>
            <button
              onClick={() => setChatTab("group")}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "16px 0", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all .2s",
                background: chatTab === "group" ? `${theme.accent}15` : "transparent",
                color: chatTab === "group" ? theme.accent : "var(--text3)",
                borderBottom: chatTab === "group" ? `3px solid ${theme.accent}` : "3px solid transparent",
              }}
            >
              <MdChat size={18} />
              {lang === "mn" ? "Групп" : "Group"}
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {chatTab === "ai"
              ? <AIChat onClose={() => setChatOpen(false)} />
              : <GroupChat onClose={() => setChatOpen(false)} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
