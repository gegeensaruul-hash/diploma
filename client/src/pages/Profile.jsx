import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { MdCameraAlt, MdEdit, MdLock, MdSave, MdClose, MdLanguage, MdPalette, MdCheck } from "react-icons/md";
import { updateUserImages, setCredentials } from "../redux/slices/authSlice";
import { useUpdateProfileMutation, useUpdateProfileImagesMutation, useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
import { useSettings } from "../context/SettingsContext";

const AVATAR_COLORS = [
  ["#6366f1","#4f46e5"],["#ec4899","#db2777"],["#f59e0b","#d97706"],
  ["#10b981","#059669"],["#3b82f6","#2563eb"],["#8b5cf6","#7c3aed"],
];

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => res(e.target.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function Section({ icon, title, children, expandable, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="premium-card overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)" }}>
      <button
        onClick={() => expandable && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-6 py-5 ${expandable ? "hover:bg-black/5 dark:bg-white/5 cursor-pointer" : "cursor-default"} transition-colors`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-indigo-400 border border-black/5 dark:border-white/5">
            {icon}
          </div>
          <p className="text-[15px] font-bold text-stone-900 dark:text-white tracking-tight">{title}</p>
        </div>
        {expandable && (
          <span className={`text-slate-500 text-xs transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▼</span>
        )}
      </button>
      {(!expandable || open) && (
        <div className="px-6 pb-6 border-t border-black/5 dark:border-white/5 pt-5">{children}</div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const { t, lang, theme, changeLang, changeTheme, THEMES, LANGUAGES } = useSettings();

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  const [updateProfile] = useUpdateProfileMutation();
  const [updateImages] = useUpdateProfileImagesMutation();
  const [changePassword] = useChangePasswordMutation();

  const colorIdx = (user?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const [c1, c2] = AVATAR_COLORS[colorIdx];

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("3MB-с бага зураг сонгоно уу");
    try {
      const base64 = await fileToBase64(file);
      const payload = type === "cover" ? { coverImage: base64 } : { avatarImage: base64 };
      await updateImages(payload).unwrap();
      dispatch(updateUserImages(payload));
      toast.success("Зураг шинэчлэгдлээ ✓");
    } catch { toast.error("Зураг хадгалахад алдаа гарлаа"); }
    e.target.value = "";
  };

  const handleRemoveImage = async (type) => {
    const payload = type === "cover" ? { coverImage: null } : { avatarImage: null };
    try {
      await updateImages(payload).unwrap();
      dispatch(updateUserImages(payload));
      toast.success("Устгагдлаа");
    } catch { toast.error("Алдаа гарлаа"); }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error("Нэр хоосон байж болохгүй");
    try {
      const res = await updateProfile({ name }).unwrap();
      dispatch(setCredentials({ ...user, name: res.user.name }));
      setEditName(false);
      toast.success("Нэр шинэчлэгдлээ ✓");
    } catch { toast.error("Алдаа гарлаа"); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Нууц үг таарахгүй байна");
    if (pwForm.newPassword.length < 6) return toast.error("Хамгийн багадаа 6 тэмдэгт");
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }).unwrap();
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Нууц үг солигдлоо ✓");
    } catch (e) { toast.error(e?.data?.message || "Алдаа гарлаа"); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-1px" }}>{t.profileSettings}</h2>
      </div>

      {/* ── Cover + Avatar ── */}
      <div className="premium-card overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)" }}>
        {/* Cover */}
        <div className="relative h-56 group" style={{
          background: user?.coverImage ? "transparent"
            : `radial-gradient(ellipse at 20% 50%, ${c1}33 0%, transparent 60%),
               radial-gradient(ellipse at 80% 20%, ${c2}22 0%, transparent 55%),
               #0f172a`
        }}>
          {user?.coverImage && (
            <img src={user.coverImage} alt="cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-2 bg-black/20 dark:bg-white/20 hover:bg-black/30 dark:bg-white/30 backdrop-blur-md text-stone-900 dark:text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all border border-black/10 dark:border-white/10">
              <MdCameraAlt size={18} /> {t.changeCover}
            </button>
            {user?.coverImage && (
              <button onClick={() => handleRemoveImage("cover")}
                className="flex items-center gap-2 bg-red-500/40 hover:bg-red-500/60 backdrop-blur-md text-stone-900 dark:text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all border border-red-500/20">
                <MdClose size={18} /> {t.remove}
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-10 left-8 group/av">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center text-4xl font-black text-stone-900 dark:text-white"
              style={{
                background: user?.avatarImage ? "transparent" : `linear-gradient(135deg, ${c1}, ${c2})`,
                border: "4px solid #020617",
              }}>
              {user?.avatarImage
                ? <img src={user.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 rounded-3xl transition-all opacity-0 group-hover/av:opacity-100 border-4 border-transparent">
              <MdCameraAlt size={22} className="text-stone-900 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Name Section */}
        <div className="pt-14 pb-6 px-8">
          <div className="flex items-center gap-4">
            {editName ? (
              <div className="flex items-center gap-3 flex-1">
                <input value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  style={{ borderColor: "#6366f1" }}
                  className="text-2xl font-bold text-stone-900 dark:text-white border-b-2 outline-none bg-transparent flex-1"
                  autoFocus />
                <button onClick={handleSaveName} className="p-2 rounded-xl text-stone-900 dark:text-white bg-indigo-500 hover:bg-indigo-600 transition-colors">
                  <MdSave size={20} />
                </button>
                <button onClick={() => { setEditName(false); setName(user?.name); }} className="p-2 text-slate-400 hover:bg-black/5 dark:bg-white/5 rounded-xl">
                  <MdClose size={20} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">{user?.name}</h3>
                <button onClick={() => setEditName(true)} className="p-2 text-slate-500 hover:bg-black/5 dark:bg-white/5 rounded-xl transition-all">
                  <MdEdit size={20} />
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">{user?.email}</p>
          <div className="flex gap-2 mt-4">
             <span className="px-3 py-1 rounded-lg text-[11px] font-black tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 uppercase">
              {user?.role === "admin" ? "Administrator" : "Standard User"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Section icon={<MdLanguage size={20} />} title={t.language}>
            <div className="space-y-2">
              {Object.entries(LANGUAGES).map(([code, info]) => (
                <button key={code} onClick={() => changeLang(code)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border-2 transition-all font-bold text-sm ${
                    lang === code ? "border-indigo-500 bg-indigo-500/10 text-stone-900 dark:text-white" : "border-black/5 dark:border-white/5 bg-black/3 dark:bg-white/3 text-slate-500 hover:border-black/10 dark:border-white/10"
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${lang === code ? "bg-indigo-500 text-stone-900 dark:text-white" : "bg-black/10 dark:bg-white/10"}`}>{info.code}</span>
                    {info.label}
                  </div>
                  {lang === code && <MdCheck size={18} />}
                </button>
              ))}
            </div>
          </Section>

          <Section icon={<MdLock size={20} />} title={t.changePassword} expandable>
            <div className="space-y-4">
              {["currentPassword", "newPassword", "confirm"].map((key) => (
                <div key={key}>
                  <input type="password" 
                    value={pwForm[key]}
                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                    placeholder={t[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                    className="w-full bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
              ))}
              <button onClick={handleChangePassword} className="btn-primary w-full py-3 rounded-xl font-bold">
                Update Security
              </button>
            </div>
          </Section>
      </div>

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "avatar")} />
    </div>
  );
}
