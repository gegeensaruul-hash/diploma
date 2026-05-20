import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const LANGUAGES = {
  mn: { label: "Монгол", code: "MN", flag: "🇲🇳" },
  en: { label: "English", code: "GB", flag: "🇬🇧" },
};

export const THEMES = [
  {
    id: "light", mn: "Цагаан", en: "Light", mode: "light",
    bg: "#ffffff", card: "#f8fafc", cardAlt: "#f1f5f9",
    sidebar: "#f8fafc", text: "#0f172a", text2: "#64748b", text3: "#94a3b8",
    accent: "#0f172a", border: "rgba(0,0,0,0.08)",
    shadow: "rgba(0,0,0,0.06)", inputBg: "rgba(0,0,0,0.03)",
    preview: ["#ffffff", "#0f172a"], pro: false,
  },
  {
    id: "dark", mn: "Харанхуй", en: "Dark", mode: "dark",
    bg: "#020617", card: "rgba(15, 23, 42, 0.6)", cardAlt: "#1e293b",
    sidebar: "rgba(15, 23, 42, 0.6)", text: "#f8fafc", text2: "#94a3b8", text3: "#64748b",
    accent: "#ffffff", border: "rgba(255,255,255,0.08)",
    shadow: "rgba(0,0,0,0.5)", inputBg: "rgba(255,255,255,0.03)",
    preview: ["#020617", "#f8fafc"], pro: false,
  },
  {
    id: "green", mn: "Ногоон", en: "Green", mode: "dark",
    bg: "#020617", card: "rgba(15, 23, 42, 0.6)", cardAlt: "#1e293b",
    sidebar: "#0d3b2e", text: "#f8fafc", text2: "#94a3b8", text3: "#64748b",
    accent: "#10b981", border: "rgba(16,185,129,0.15)",
    shadow: "rgba(0,0,0,0.5)", inputBg: "rgba(255,255,255,0.03)",
    preview: ["#020617", "#10b981"], pro: true,
  },
  {
    id: "blue", mn: "Цэнхэр", en: "Blue", mode: "dark",
    bg: "#020617", card: "rgba(15, 23, 42, 0.6)", cardAlt: "#1e293b",
    sidebar: "#0f2044", text: "#f8fafc", text2: "#94a3b8", text3: "#64748b",
    accent: "#3b82f6", border: "rgba(59,130,246,0.15)",
    shadow: "rgba(0,0,0,0.5)", inputBg: "rgba(255,255,255,0.03)",
    preview: ["#020617", "#3b82f6"], pro: true,
  },
  {
    id: "purple", mn: "Ягаан", en: "Purple", mode: "dark",
    bg: "#020617", card: "rgba(15, 23, 42, 0.6)", cardAlt: "#1e293b",
    sidebar: "#1e0a3c", text: "#f8fafc", text2: "#94a3b8", text3: "#64748b",
    accent: "#8b5cf6", border: "rgba(139,92,246,0.15)",
    shadow: "rgba(0,0,0,0.5)", inputBg: "rgba(255,255,255,0.03)",
    preview: ["#020617", "#8b5cf6"], pro: true,
  },
  {
    id: "rose", mn: "Улаан", en: "Rose", mode: "dark",
    bg: "#020617", card: "rgba(15, 23, 42, 0.6)", cardAlt: "#1e293b",
    sidebar: "#3b0a1e", text: "#f8fafc", text2: "#94a3b8", text3: "#64748b",
    accent: "#f43f5e", border: "rgba(244,63,94,0.15)",
    shadow: "rgba(0,0,0,0.5)", inputBg: "rgba(255,255,255,0.03)",
    preview: ["#020617", "#f43f5e"], pro: true,
  },
  {
    id: "amber", mn: "Шар", en: "Amber", mode: "dark",
    bg: "#020617", card: "rgba(15, 23, 42, 0.6)", cardAlt: "#1e293b",
    sidebar: "#2d1a00", text: "#f8fafc", text2: "#94a3b8", text3: "#64748b",
    accent: "#f59e0b", border: "rgba(245,158,11,0.15)",
    shadow: "rgba(0,0,0,0.5)", inputBg: "rgba(255,255,255,0.03)",
    preview: ["#020617", "#f59e0b"], pro: true,
  },
];

export const T = {
  mn: {
    dashboard: "Хянах самбар", allTodos: "Бүх Todo", todo: "Хийх",
    inProgress: "Хийж байна", completed: "Дууссан", trash: "Хогийн сав",
    users: "Хэрэглэгчид", logout: "Гарах", management: "Удирдлага",
    member: "Гишүүн", admin: "Админ", user: "Хэрэглэгч",
    language: "Хэл", theme: "Өнгөний загвар",
    save: "Хадгалах", cancel: "Болих", remove: "Устгах",
    changeCover: "Cover солих", editName: "Нэр засах",
    changePassword: "Нууц үг солих", currentPw: "Одоогийн нууц үг",
    newPw: "Шинэ нууц үг", confirmPw: "Шинэ нууц үг (давтах)",
    profileSettings: "Профайл тохиргоо", hello: "Сайн байна уу",
    notes: "Тэмдэглэл", newNote: "Шинэ тэмдэглэл", noNotes: "Тэмдэглэл байхгүй байна",
    noteTitle: "Гарчиг", noteContent: "Агуулга...",
    calendar: "Хуанли",
    visionBoard: "Vision Board",
    loginTab: "Нэвтрэх", registerTab: "Бүртгүүлэх",
    checking: "Шалгаж байна...", loadingBtn: "Түр хүлээнэ үү...",
    loginError: "Нэвтрэх боломжгүй. Дахин оролдоно уу.",
    pwMismatch: "Нууц үг таарахгүй байна",
    registerSuccess: "Бүртгэл амжилттай! Нэвтэрнэ үү.",
    registerError: "Бүртгэл амжилтгүй. Дахин оролдоно уу.",
    emailRequired: "И-мэйл оруулна уу", pwRequired: "Нууц үг оруулна уу",
    minLength: "Хамгийн багадаа 6 тэмдэгт байх ёстой",
    confirmPwRequired: "Нууц үг давтана уу",
    nameRequired2: "Нэр оруулна уу", namePlaceholder: "Бүтэн нэр",
    registerBtn: "Бүртгүүлэх",
    finTitle: "Төсөв & Санхүүгийн хяналт",
    finMonth: "Энэ сар",
    finQuickAdd: "Хурдан нэмэх",
    finDesc: "Тайлбар",
    finExpense: "Зарлага",
    finIncome: "Орлого",
    finTotalIncome: "Нийт орлого",
    finTotalExpense: "Нийт зарлага",
    finNet: "Цэвэр",
    finBudget: "Сарын төсөв",
    finAccounts: "Дансууд",
    finNewAccount: "+ Шинэ данс",
    finSubs: "Захиалгууд",
    finAdd: "+ Нэмэх",
    finGoals: "Зорилтууд",
    finNewGoal: "+ Шинэ зорилт",
    finNotes: "Тэмдэглэл",
    finSummary: "Нэгтгэл",
    finThisYear: "Энэ жил",
    finSave: "Хадгалах",
    finEdit: "засах",
    finName: "Нэр",
    finAmount: "Дүн",
    finDate: "Огноо",
    finCategory: "Категори",
    finLimit: "Хязгаар",
    finSpent: "Зарцуулсан",
    finTarget: "Зорилтот дүн",
    finSaved: "Хадгалсан дүн",
    finBalance: "Үлдэгдэл",
    finMonthly: "Сарын дүн",
    finActive: "Идэвхтэй",
    finPaused: "Зогссон",
    finToggle: "Солих",
    finDelete: "Устгах",
    finNew: "+ Шинэ",
  },
  en: {
    dashboard: "Dashboard", allTodos: "All Todos", todo: "To Do",
    inProgress: "In Progress", completed: "Completed", trash: "Trash",
    users: "Users", logout: "Logout", management: "Management",
    member: "Member", admin: "Admin", user: "User",
    language: "Language", theme: "Color Theme",
    save: "Save", cancel: "Cancel", remove: "Remove",
    changeCover: "Change Cover", editName: "Edit Name",
    changePassword: "Change Password", currentPw: "Current Password",
    newPw: "New Password", confirmPw: "Confirm New Password",
    profileSettings: "Profile Settings", hello: "Hello",
    notes: "Notes", newNote: "New Note", noNotes: "No notes yet",
    noteTitle: "Title", noteContent: "Content...",
    calendar: "Calendar",
    visionBoard: "Vision Board",
    loginTab: "Sign In", registerTab: "Register",
    checking: "Checking...", loadingBtn: "Please wait...",
    loginError: "Login failed. Please try again.",
    pwMismatch: "Passwords do not match",
    registerSuccess: "Registered successfully! Please sign in.",
    registerError: "Registration failed. Please try again.",
    emailRequired: "Email is required", pwRequired: "Password is required",
    minLength: "Minimum 6 characters required",
    confirmPwRequired: "Please confirm your password",
    nameRequired2: "Name is required", namePlaceholder: "Full name",
    registerBtn: "Create Account",
    finTitle: "Budget & Finance Tracker",
    finMonth: "This Month",
    finQuickAdd: "Quick Add",
    finDesc: "Description",
    finExpense: "Expense",
    finIncome: "Income",
    finTotalIncome: "Total Incomes",
    finTotalExpense: "Total Expenses",
    finNet: "Net",
    finBudget: "Monthly Budget",
    finAccounts: "Accounts",
    finNewAccount: "+ New account",
    finSubs: "Subscriptions",
    finAdd: "+ Add",
    finGoals: "Goals",
    finNewGoal: "+ New goal",
    finNotes: "Notes",
    finSummary: "Summary",
    finThisYear: "This Year",
    finSave: "Save",
    finEdit: "edit",
    finName: "Name",
    finAmount: "Amount",
    finDate: "Date",
    finCategory: "Category",
    finLimit: "Limit",
    finSpent: "Spent",
    finTarget: "Target",
    finSaved: "Saved",
    finBalance: "Balance",
    finMonthly: "Monthly amount",
    finActive: "Active",
    finPaused: "Paused",
    finToggle: "Toggle",
    finDelete: "Delete",
    finNew: "+ New",
  },
};

export function SettingsProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "mn");
  const [themeId, setThemeId] = useState(() => localStorage.getItem("app_theme") || "light");

  const theme = THEMES.find((th) => th.id === themeId) || THEMES[0];
  const t = T[lang] || T.mn;

  const changeLang = (l) => { setLang(l); localStorage.setItem("app_lang", l); };
  const changeTheme = (id, isPro) => {
    const found = THEMES.find((th) => th.id === id);
    if (found?.pro && !isPro) return false;
    setThemeId(id);
    localStorage.setItem("app_theme", id);
    return true;
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg-app", theme.bg);
    root.style.setProperty("--bg-card", theme.card);
    root.style.setProperty("--bg-card2", theme.cardAlt);
    root.style.setProperty("--sidebar-bg", theme.sidebar);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--text2", theme.text2);
    root.style.setProperty("--text3", theme.text3);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--shadow", theme.shadow);
    root.style.setProperty("--input-bg", theme.inputBg);

    root.setAttribute("data-theme", theme.mode);
    if (theme.mode === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light-theme");
      root.classList.add("dark");
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ lang, theme, t, changeLang, changeTheme, THEMES, LANGUAGES }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
