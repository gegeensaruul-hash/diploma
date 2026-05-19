import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useDeleteRoomMutation,
  useGetMessagesQuery,
  useAddMemberMutation,
} from "../redux/slices/api/chatApiSlice";
import { MdAdd, MdSend, MdClose, MdExitToApp, MdDelete, MdPeople, MdArrowBack, MdChat, MdExplore, MdPersonAdd } from "react-icons/md";
import { toast } from "sonner";
import { useSettings } from "../context/SettingsContext";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GroupChat({ onClose }) {
  const { user } = useSelector((s) => s.auth);
  const { theme } = useSettings();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const { data: roomsData, refetch: refetchRooms } = useGetRoomsQuery();
  const { data: historyData } = useGetMessagesQuery(activeRoom?.id, { skip: !activeRoom });
  const [createRoom] = useCreateRoomMutation();
  const [joinRoom] = useJoinRoomMutation();
  const [leaveRoom] = useLeaveRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [addMember] = useAddMemberMutation();

  const rooms = roomsData?.rooms || [];

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.on("new_message", (msg) => {
      setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
    });
    socket.on("chat_error", (err) => toast.error(err));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit("join_room", activeRoom.id);
    setMessages([]);
    setShowMembers(false);
    setShowAddMember(false);
  }, [activeRoom?.id]);

  useEffect(() => {
    if (historyData?.messages) setMessages(historyData.messages);
  }, [historyData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    socketRef.current?.emit("send_message", { roomId: activeRoom.id, message: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim()) return toast.error("Нэр оруулна уу");
    try {
      await createRoom(newRoom).unwrap();
      setNewRoom({ name: "", description: "" });
      setShowCreate(false);
      toast.success("Room үүслээ!");
      refetchRooms();
    } catch (e) { toast.error(e?.data?.message || "Алдаа гарлаа"); }
  };

  const handleJoin = async (id) => {
    try { await joinRoom(id).unwrap(); refetchRooms(); toast.success("Room-д нэгдлээ"); }
    catch (e) { toast.error(e?.data?.message || "Алдаа"); }
  };

  const handleAddMember = async () => {
    if (!inviteEmail.trim()) return toast.error("Email оруулна уу");
    try {
      await addMember({ id: activeRoom.id, email: inviteEmail }).unwrap();
      setInviteEmail("");
      setShowAddMember(false);
      toast.success("Хэрэглэгч нэмэгдлээ!");
      refetchRooms();
    } catch (e) { toast.error(e?.data?.message || "Алдаа гарлаа"); }
  };

  const handleLeave = async (id) => {
    try {
      await leaveRoom(id).unwrap();
      if (activeRoom?.id === id) setActiveRoom(null);
      refetchRooms();
      toast.success("Room-оос гарлаа");
    } catch (e) { toast.error(e?.data?.message || "Алдаа"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Room-г устгах уу?")) return;
    try {
      await deleteRoom(id).unwrap();
      if (activeRoom?.id === id) setActiveRoom(null);
      refetchRooms();
      toast.success("Room устгагдлаа");
    } catch (e) { toast.error(e?.data?.message || "Алдаа"); }
  };

  const fmt = (d) => new Date(d).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => new Date(d).toLocaleDateString("mn-MN", { month: "short", day: "numeric" });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#020617]">
      <style>{`
        .chat-room-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.05); }
        .chat-room-card:hover { background: rgba(255,255,255,0.03); transform: translateY(-1px); border-color: rgba(255,255,255,0.1); }
        .msg-bubble { max-width: 80%; padding: 10px 14px; font-size: 14px; line-height: 1.5; }
      `}</style>

      {/* Header */}
      <div className="h-16 px-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between flex-shrink-0 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {activeRoom ? (
            <button onClick={() => setActiveRoom(null)} className="text-slate-400 hover:text-stone-900 dark:text-white transition-colors">
              <MdArrowBack size={20} />
            </button>
          ) : (
            <MdExplore size={20} className="text-indigo-400" />
          )}
          <span className="font-bold text-stone-900 dark:text-white text-sm tracking-tight">
            {activeRoom ? `# ${activeRoom.name}` : "🔒 Private Communities"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeRoom && (
            <>
              {/* Only creator or admin can invite */}
              {(activeRoom.createdBy === user?.id || user?.role === "admin") && (
                <button onClick={() => setShowAddMember((v) => !v)} className={`p-2 rounded-xl transition-all ${showAddMember ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-stone-900 dark:text-white"}`} title="Invite Person">
                  <MdPersonAdd size={20} />
                </button>
              )}
              <button onClick={() => setShowMembers((v) => !v)} className={`p-2 rounded-xl transition-all ${showMembers ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-stone-900 dark:text-white"}`}>
                <MdPeople size={20} />
              </button>
            </>
          )}
          {!activeRoom && (
            <button onClick={() => setShowCreate(true)} className="p-2 rounded-xl text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
              <MdAdd size={22} />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-stone-900 dark:text-white transition-all">
            <MdClose size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeRoom && showAddMember && (
          <div className="px-5 py-3 bg-indigo-500/5 border-b border-black/5 dark:border-white/5 flex gap-2 animate-in">
            <input 
              type="email" 
              placeholder="Friend's email..." 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
              className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleAddMember}
              className="px-3 py-1.5 bg-indigo-500 text-stone-900 dark:text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-500/20"
            >
              ADD
            </button>
          </div>
        )}

        {!activeRoom ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {rooms.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
                <div className="w-16 h-16 rounded-2xl bg-black/3 dark:bg-white/3 flex items-center justify-center text-slate-700">
                  <MdChat size={32} />
                </div>
                <p className="text-sm font-medium text-center">No active communities found.<br/>Start a new conversation.</p>
              </div>
            )}
            {rooms.map((room) => {
              const isMember = room.isMember;
              return (
                <div key={room.id} onClick={() => isMember && setActiveRoom(room)}
                  className={`chat-room-card rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${isMember ? "cursor-pointer" : "opacity-40"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-stone-900 dark:text-white truncate mb-0.5"># {room.name}</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{room.members?.length || 0} Members</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!isMember ? (
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1">
                        <span className="text-[10px]">🔒</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Invite Only</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {(room.createdBy === user?.id || user?.role === "admin") && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(room.id); }} className="text-slate-600 hover:text-red-400 p-2">
                            <MdDelete size={16} />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleLeave(room.id); }} className="text-slate-600 hover:text-orange-400 p-2">
                          <MdExitToApp size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {showMembers && (
              <div className="px-5 py-3 bg-black/2 dark:bg-white/2 border-b border-black/5 dark:border-white/5 flex flex-wrap gap-2 animate-in">
                {activeRoom.members?.map((m) => (
                  <span key={m.id} className="text-[11px] font-bold bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg px-2.5 py-1 text-slate-400">
                    @{m.name}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.sender?.id === user?.id || msg.userId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-3`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400 flex-shrink-0 mt-1 border border-indigo-500/20">
                        {msg.sender?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {!isMe && <p className="text-[11px] font-bold text-slate-500 mb-1 ml-1">{msg.sender?.name}</p>}
                      <div className={`msg-bubble rounded-2xl ${isMe ? "bg-indigo-500 text-stone-900 dark:text-white rounded-tr-none" : "bg-black/5 dark:bg-white/5 text-slate-200 border border-black/5 dark:border-white/5 rounded-tl-none"}`}>
                        {msg.message}
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 mt-1 mx-1 uppercase">{fmt(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-900/20">
              <div className="flex gap-2 bg-black/3 dark:bg-white/3 border border-black/5 dark:border-white/5 rounded-2xl p-1.5 focus-within:border-indigo-500/50 transition-all">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-stone-900 dark:text-white px-3 py-2 outline-none" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-20 text-stone-900 dark:text-white flex items-center justify-center transition-all">
                  <MdSend size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-slate-900 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-xs p-6 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-stone-900 dark:text-white tracking-tight">Create Community</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-stone-900 dark:text-white transition-colors">
                <MdClose size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Room Name" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white outline-none focus:border-indigo-500" autoFocus />
              <button onClick={handleCreateRoom}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-stone-900 dark:text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                Lauch Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
