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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => expandable && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-6 py-4 ${expandable ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            {icon}
          </div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
        </div>
        {expandable && (
          <span className={`text-slate-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
        )}
      </button>
      {(!expandable || open) && (
        <div className="px-6 pb-5 border-t border-slate-100 pt-4">{children}</div>
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
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-slate-800">{t.profileSettings}</h2>

      {/* ── Cover + Avatar ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="relative h-44 group" style={{
          background: user?.coverImage ? "transparent"
            : `radial-gradient(ellipse at 20% 50%, ${c1}55 0%, transparent 60%),
               radial-gradient(ellipse at 80% 20%, ${c2}44 0%, transparent 55%),
               linear-gradient(135deg, #0f0c29, #302b63, #24243e)`
        }}>
          {user?.coverImage && (
            <img src={user.coverImage} alt="cover" className="w-full h-full object-cover" />
          )}
          {/* Cover hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
              <MdCameraAlt size={16} /> {t.changeCover}
            </button>
            {user?.coverImage && (
              <button onClick={() => handleRemoveImage("cover")}
                className="flex items-center gap-2 bg-red-500/40 hover:bg-red-500/60 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                <MdClose size={16} /> {t.remove}
              </button>
            )}
          </div>

          {/* Avatar — cover-н зүүн доод буланд давхцуулсан */}
          <div className="absolute -bottom-9 left-7 group/av">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl flex items-center justify-center text-3xl font-black text-white"
              style={{
                background: user?.avatarImage ? "transparent" : `linear-gradient(135deg, ${c1}, ${c2})`,
                border: "3px solid white",
                boxShadow: `0 4px 24px ${c1}66`,
              }}>
              {user?.avatarImage
                ? <img src={user.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 rounded-full transition-all opacity-0 group-hover/av:opacity-100">
              <MdCameraAlt size={18} className="text-white" />
            </button>
            {user?.avatarImage && (
              <button onClick={() => handleRemoveImage("avatar")}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-all opacity-0 group-hover/av:opacity-100">
                <MdClose size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Нэр */}
        <div className="pt-12 pb-5 px-7">
          <div className="flex items-center gap-3">
            {editName ? (
              <div className="flex items-center gap-2 flex-1">
                <input value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="text-xl font-bold text-slate-800 border-b-2 outline-none bg-transparent flex-1"
                  style={{ borderColor: theme.accent }} autoFocus />
                <button onClick={handleSaveName}
                  className="p-1.5 rounded-lg text-white transition-colors"
                  style={{ background: theme.accent }}>
                  <MdSave size={18} />
                </button>
                <button onClick={() => { setEditName(false); setName(user?.name); }}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                  <MdClose size={18} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                <button onClick={() => setEditName(true)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                  <MdEdit size={18} />
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
          <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: `${c1}15`, color: c1, border: `1px solid ${c1}30` }}>
            {user?.role === "admin" ? t.admin : t.user}
          </span>
        </div>
      </div>

      {/* ── Хэл сонгох ── */}
      <Section icon={<MdLanguage size={18} />} title={t.language}>
        <div className="flex gap-3">
          {Object.entries(LANGUAGES).map(([code, info]) => {
            const isActive = lang === code;
            return (
              <button key={code} onClick={() => changeLang(code)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
                style={isActive
                  ? { background: theme.accent, borderColor: theme.accent, color: "white" }
                  : { background: "white", borderColor: "#e2e8f0", color: "#475569" }
                }>
                <span className="text-xs font-bold px-1 py-0.5 rounded"
                  style={isActive
                    ? { background: "rgba(255,255,255,0.25)", color: "white" }
                    : { background: "#f1f5f9", color: "#64748b" }
                  }>
                  {info.code}
                </span>
                {info.label}
                {isActive && <MdCheck size={16} />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Өнгөний загвар ── */}
      <Section icon={<MdPalette size={18} />} title={t.theme}>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((th) => {
            const isActive = theme.id === th.id;
            const label = lang === "en" ? th.en : th.mn;
            return (
              <button key={th.id} onClick={() => changeTheme(th.id)}
                className="relative flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all"
                style={isActive
                  ? { borderColor: th.accent, background: `${th.accent}10` }
                  : { borderColor: "#e2e8f0", background: "white" }
                }>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm"
                  style={{ background: th.sidebar }} />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <div className="w-4 h-1.5 rounded-full mt-0.5" style={{ background: th.accent }} />
                </div>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{ background: th.accent }}>
                    <MdCheck size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Нууц үг ── */}
      <Section icon={<MdLock size={18} />} title={t.changePassword} expandable>
        <div className="space-y-3">
          {[
            { key: "currentPassword", label: t.currentPw },
            { key: "newPassword", label: t.newPw },
            { key: "confirm", label: t.confirmPw },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
              <input type="password" value={pwForm[key]}
                onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          ))}
          <button onClick={handleChangePassword}
            className="w-full text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            style={{ background: theme.accent }}>
            {t.changePassword}
          </button>
        </div>
      </Section>

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleImageUpload(e, "cover")} />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleImageUpload(e, "avatar")} />
    </div>
  );
}
