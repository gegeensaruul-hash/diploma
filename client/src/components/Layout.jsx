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
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 208 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 30,
        position: "relative",
      }}>
        <div style={{ width: 208, height: "100%" }}>
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
        <main className="flex-1 overflow-y-auto px-6 pb-6">
          <Outlet />
        </main>
      </div>

      {/* Chat panel */}
      <div className={`flex-shrink-0 border-l border-slate-200 bg-white flex flex-col transition-all duration-300 ${
        chatOpen ? "w-80" : "w-0 overflow-hidden border-l-0"
      }`}>
        {chatOpen && (
          <>
            {/* Tab switcher */}
            <div style={{
              display: "flex", borderBottom: "1px solid #e2e8f0",
              flexShrink: 0, background: "white",
            }}>
              <button
                onClick={() => setChatTab("ai")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "10px 0", fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all .15s",
                  background: chatTab === "ai" ? `${theme.accent}12` : "white",
                  color: chatTab === "ai" ? theme.accent : "#94a3b8",
                  borderBottom: chatTab === "ai" ? `2px solid ${theme.accent}` : "2px solid transparent",
                }}
              >
                <MdAutoAwesome size={15} />
                AI Assistant
              </button>
              <button
                onClick={() => setChatTab("group")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "10px 0", fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all .15s",
                  background: chatTab === "group" ? `${theme.accent}12` : "white",
                  color: chatTab === "group" ? theme.accent : "#94a3b8",
                  borderBottom: chatTab === "group" ? `2px solid ${theme.accent}` : "2px solid transparent",
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
          </>
        )}
      </div>
    </div>
  );
}
