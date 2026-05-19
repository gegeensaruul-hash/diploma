import { useState } from "react";
import { Outlet } from "react-router-dom";
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
  const toggle = () => setSidebarOpen(v => !v);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 30,
        position: "relative",
        borderRight: sidebarOpen ? "1px solid var(--border)" : "none",
      }}>
        <div style={{ width: 220, height: "100%" }}>
          <Sidebar onClose={toggle} onMenuToggle={toggle} />
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar
          onChatToggle={() => setChatOpen(v => !v)}
          chatOpen={chatOpen}
          onMenuToggle={toggle}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto px-6 pb-6 bg-[#020617]">
          <div className="max-w-7xl mx-auto py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Chat panel */}
      <div 
        style={{
          width: chatOpen ? 320 : 0,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          borderLeft: chatOpen ? "1px solid var(--border)" : "none",
          background: "var(--bg-card)",
          zIndex: 40,
        }}
        className="flex flex-col shadow-2xl"
      >
        <div style={{ width: 320, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Tab switcher */}
          <div style={{
            display: "flex", borderBottom: "1px solid var(--border)",
            flexShrink: 0, background: "var(--bg-card)",
          }}>
            <button
              onClick={() => setChatTab("ai")}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "12px 0", fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all .2s",
                background: chatTab === "ai" ? `${theme.accent}15` : "transparent",
                color: chatTab === "ai" ? theme.accent : "var(--text3)",
                borderBottom: chatTab === "ai" ? `3px solid ${theme.accent}` : "3px solid transparent",
              }}
            >
              <MdAutoAwesome size={15} />
              AI Assistant
            </button>
            <button
              onClick={() => setChatTab("group")}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "12px 0", fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all .2s",
                background: chatTab === "group" ? `${theme.accent}15` : "transparent",
                color: chatTab === "group" ? theme.accent : "var(--text3)",
                borderBottom: chatTab === "group" ? `3px solid ${theme.accent}` : "3px solid transparent",
              }}
            >
              <MdChat size={15} />
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
