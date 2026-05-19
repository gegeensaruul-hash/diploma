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
} from "../redux/slices/api/chatApiSlice";
import { MdAdd, MdSend, MdClose, MdExitToApp, MdDelete, MdPeople, MdArrowBack, MdChat } from "react-icons/md";
import { toast } from "sonner";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GroupChat({ onClose }) {
  const { user } = useSelector((s) => s.auth);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const { data: roomsData, refetch: refetchRooms } = useGetRoomsQuery();
  const { data: historyData } = useGetMessagesQuery(activeRoom?.id, { skip: !activeRoom });
  const [createRoom] = useCreateRoomMutation();
  const [joinRoom] = useJoinRoomMutation();
  const [leaveRoom] = useLeaveRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

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
    <div className="flex flex-col h-full w-full overflow-hidden">

      {/* ── Panel header ─────────────────────────────── */}
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          {activeRoom ? (
            <button onClick={() => setActiveRoom(null)} className="text-slate-400 hover:text-slate-600 mr-1">
              <MdArrowBack size={18} />
            </button>
          ) : (
            <MdChat size={18} className="text-blue-500" />
          )}
          <span className="font-semibold text-slate-800 text-sm truncate">
            {activeRoom ? `# ${activeRoom.name}` : "Group Chat"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {activeRoom && (
            <button
              onClick={() => setShowMembers((v) => !v)}
              className={`p-1.5 rounded-lg transition-colors ${showMembers ? "bg-blue-50 text-blue-500" : "text-slate-400 hover:text-slate-600"}`}
            >
              <MdPeople size={17} />
            </button>
          )}
          {!activeRoom && (
            <button
              onClick={() => setShowCreate(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              title="Room үүсгэх"
            >
              <MdAdd size={18} />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <MdClose size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ── Members bar ─────────────────────────────── */}
      {activeRoom && showMembers && (
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5 flex-shrink-0">
          {activeRoom.members?.map((m) => (
            <span key={m.id} className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-600">
              {m.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Room жагсаалт (activeRoom байхгүй үед) ──────── */}
      {!activeRoom && (
        <div className="flex-1 overflow-y-auto py-2">
          {rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 px-4">
              <MdChat size={36} className="text-slate-200" />
              <p className="text-sm text-center">Room байхгүй байна.<br />+ товч дарж үүсгэнэ үү.</p>
            </div>
          )}
          {rooms.map((room) => {
            const isMember = room.isMember;
            return (
              <div
                key={room.id}
                onClick={() => isMember && setActiveRoom(room)}
                className={`mx-2 mb-1 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                  isMember ? "hover:bg-slate-50 cursor-pointer" : "opacity-55"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate"># {room.name}</p>
                  <p className="text-xs text-slate-400">{room.members?.length || 0} member</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!isMember ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoin(room.id); }}
                      className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Нэгдэх
                    </button>
                  ) : (
                    <>
                      {(room.createdBy === user?.id || user?.role === "admin") && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(room.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                          <MdDelete size={14} />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleLeave(room.id); }} className="text-slate-300 hover:text-orange-500 transition-colors p-1">
                        <MdExitToApp size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Мессежүүд (activeRoom байгаа үед) ──────────── */}
      {activeRoom && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-8">Мессеж байхгүй байна.</p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender?.id === user?.id || msg.userId === user?.id;
              const showDate = i === 0 || fmtDate(messages[i - 1]?.createdAt) !== fmtDate(msg.createdAt);
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-xs text-slate-400">{fmtDate(msg.createdAt)}</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                  )}
                  <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-1.5`}>
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mt-1">
                        {msg.sender?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="max-w-[85%]">
                      {!isMe && <p className="text-xs text-slate-400 mb-0.5 ml-1">{msg.sender?.name}</p>}
                      <div className={`px-3 py-1.5 rounded-2xl text-sm break-words ${
                        isMe ? "bg-blue-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </div>
                      <p className={`text-xs text-slate-300 mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                        {fmt(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Мессеж бичих..."
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <MdSend size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create Room Modal ──────────────────────────── */}
      {showCreate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 rounded-r-none">
          <div className="bg-white rounded-2xl shadow-xl w-64 mx-4 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Шинэ Room</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <MdClose size={18} />
              </button>
            </div>
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Room нэр *"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              <input
                type="text"
                placeholder="Тайлбар (заавал биш)"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleCreateRoom}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-xl transition-colors text-sm"
              >
                Үүсгэх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
