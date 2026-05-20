import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const LANGUAGES = {
  mn: { label: "Монгол", code: "MN", flag: "🇲🇳" },
  en: { label: "English", code: "GB", flag: "🇬🇧" },
};

export const THEMES = [
  { id: "green",  mn: "Ногоон",  en: "Green",  sidebar: "#0d3b2e", accent: "#10b981", pro: false },
  { id: "blue",   mn: "Цэнхэр",  en: "Blue",   sidebar: "#0f2044", accent: "#3b82f6", pro: false },
  { id: "purple", mn: "Ягаан",   en: "Purple", sidebar: "#1e0a3c", accent: "#8b5cf6", pro: true },
  { id: "slate",  mn: "Саарал",  en: "Slate",  sidebar: "#1e293b", accent: "#64748b", pro: true },
  { id: "rose",   mn: "Улаан",   en: "Red",    sidebar: "#3b0a1e", accent: "#f43f5e", pro: true },
  { id: "amber",  mn: "Шар",     en: "Amber",  sidebar: "#2d1a00", accent: "#f59e0b", pro: true },
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
    // Login / Auth
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
    // Finance
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
    // Login / Auth
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
    // Finance
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
  const [themeId, setThemeId] = useState(() => localStorage.getItem("app_theme") || "green");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("app_dark") === "true");

  const theme = THEMES.find((th) => th.id === themeId) || THEMES[0];
  const t = T[lang] || T.mn;

  const changeLang = (l) => { setLang(l); localStorage.setItem("app_lang", l); };
  const changeTheme = (id, isPro) => {
    const t = THEMES.find((th) => th.id === id);
    if (t?.pro && !isPro) return false;
    setThemeId(id);
    localStorage.setItem("app_theme", id);
    return true;
  };
  const toggleDark = () => {
    setDarkMode(v => {
      const next = !v;
      localStorage.setItem("app_dark", String(next));
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-bg", theme.sidebar);
    document.documentElement.style.setProperty("--accent", theme.accent);
  }, [theme]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <SettingsContext.Provider value={{ lang, theme, t, changeLang, changeTheme, THEMES, LANGUAGES, darkMode, toggleDark }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
