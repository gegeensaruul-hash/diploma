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
    <div className="premium-card overflow-hidden" style={{ background: "var(--bg-card)", backdropFilter: "blur(20px)" }}>
      <button
        onClick={() => expandable && setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", cursor: expandable ? "pointer" : "default", background: "transparent", border: "none", transition: "all 0.2s" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--input-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", border: "1px solid var(--border)" }}>
            {icon}
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.3px" }}>{title}</p>
        </div>
        {expandable && (
          <span style={{ color: "var(--text3)", fontSize: 12, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "none" }}>&#9660;</span>
        )}
      </button>
      {(!expandable || open) && (
        <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border)" }}>{children}</div>
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
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-1px" }}>{t.profileSettings}</h2>
      </div>

      {/* ── Cover + Avatar ── */}
      <div className="premium-card overflow-hidden" style={{ background: "var(--bg-card)", backdropFilter: "blur(20px)" }}>
        {/* Cover */}
        <div className="relative h-56 group" style={{
          background: user?.coverImage ? "transparent"
            : `radial-gradient(ellipse at 20% 50%, ${c1}33 0%, transparent 60%),
               radial-gradient(ellipse at 80% 20%, ${c2}22 0%, transparent 55%),
               var(--bg-card)`
        }}>
          {user?.coverImage && (
            <img src={user.coverImage} alt="cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button onClick={() => coverInputRef.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s" }}>
              <MdCameraAlt size={18} /> {t.changeCover}
            </button>
            {user?.coverImage && (
              <button onClick={() => handleRemoveImage("cover")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.4)", backdropFilter: "blur(12px)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", transition: "all 0.2s" }}>
                <MdClose size={18} /> {t.remove}
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-10 left-8 group/av">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center text-4xl font-black" style={{ color: "#fff" }}
              style={{
                background: user?.avatarImage ? "transparent" : `linear-gradient(135deg, ${c1}, ${c2})`,
                border: "4px solid var(--bg-app)",
              }}>
              {user?.avatarImage
                ? <img src={user.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 rounded-3xl transition-all opacity-0 group-hover/av:opacity-100 border-4 border-transparent">
              <MdCameraAlt size={22} style={{ color: "#fff" }} />
            </button>
          </div>
        </div>

        {/* Name Section */}
        <div style={{ paddingTop: 56, paddingBottom: 24, paddingLeft: 32, paddingRight: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {editName ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", borderBottom: "2px solid var(--accent)", outline: "none", background: "transparent", flex: 1, border: "none", borderBottom: "2px solid var(--accent)" }}
                  autoFocus />
                <button onClick={handleSaveName} style={{ padding: 8, borderRadius: 12, background: "var(--accent)", color: "var(--bg-app)", border: "none", cursor: "pointer" }}>
                  <MdSave size={20} />
                </button>
                <button onClick={() => { setEditName(false); setName(user?.name); }} style={{ padding: 8, color: "var(--text3)", background: "transparent", border: "none", cursor: "pointer", borderRadius: 12 }}>
                  <MdClose size={20} />
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>{user?.name}</h3>
                <button onClick={() => setEditName(true)} style={{ padding: 8, color: "var(--text3)", background: "transparent", border: "none", cursor: "pointer", borderRadius: 12 }}>
                  <MdEdit size={20} />
                </button>
              </>
            )}
          </div>
          <p style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500, marginTop: 4 }}>{user?.email}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
             <span style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", background: "var(--input-bg)", color: "var(--text)", border: "1px solid var(--border)", textTransform: "uppercase" }}>
              {user?.role === "admin" ? "Administrator" : "Standard User"}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Picker */}
      <Section icon={<MdPalette size={20} />} title={t.theme}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {THEMES.map((th) => {
            const isActive = theme.id === th.id;
            const locked = th.pro && !user?.isPro;
            return (
              <button
                key={th.id}
                onClick={() => {
                  if (locked) return toast.error(lang === "mn" ? "Pro хэрэглэгчдэд зориулсан" : "Pro members only");
                  changeTheme(th.id, user?.isPro);
                }}
                style={{
                  position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  padding: 16, borderRadius: 16, cursor: locked ? "not-allowed" : "pointer",
                  border: isActive ? `2px solid var(--accent)` : "2px solid var(--border)",
                  background: isActive ? "var(--input-bg)" : "transparent",
                  opacity: locked ? 0.5 : 1, transition: "all 0.2s",
                }}
              >
                {/* Color preview circles */}
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: th.preview[0], border: "2px solid var(--border)" }} />
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: th.preview[1], border: "2px solid var(--border)" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                  {lang === "mn" ? th.mn : th.en}
                </span>
                {isActive && (
                  <div style={{ position: "absolute", top: 6, right: 6 }}>
                    <MdCheck size={16} style={{ color: "var(--accent)" }} />
                  </div>
                )}
                {locked && (
                  <div style={{
                    position: "absolute", top: 6, left: 6,
                    fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6,
                    background: "var(--accent)", color: "var(--bg-app)",
                  }}>
                    PRO
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Section icon={<MdLanguage size={20} />} title={t.language}>
            <div className="space-y-2">
              {Object.entries(LANGUAGES).map(([code, info]) => (
                <button key={code} onClick={() => changeLang(code)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                    border: lang === code ? "2px solid var(--accent)" : "2px solid var(--border)",
                    background: lang === code ? "var(--input-bg)" : "transparent",
                    color: lang === code ? "var(--text)" : "var(--text2)", cursor: "pointer", transition: "all 0.2s",
                  }}>
                  <div className="flex items-center gap-3">
                    <span style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 4,
                      background: lang === code ? "var(--accent)" : "var(--input-bg)",
                      color: lang === code ? "var(--bg-app)" : "var(--text3)",
                    }}>{info.code}</span>
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
                    style={{
                      width: "100%", background: "var(--input-bg)", border: "1px solid var(--border)",
                      borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--text)",
                      outline: "none", transition: "all 0.2s",
                    }} />
                </div>
              ))}
              <button onClick={handleChangePassword} className="btn-primary w-full py-3 rounded-xl font-bold">
                {lang === "mn" ? "Нууц үг шинэчлэх" : "Update Security"}
              </button>
            </div>
          </Section>
      </div>

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "avatar")} />
    </div>
  );
}
