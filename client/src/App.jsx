import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { clearCredentials } from "./redux/slices/authSlice";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Todos from "./pages/Todos";
import Trash from "./pages/Trash";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import VisionBoardPage from "./pages/VisionBoardPage";
import FutureCapsulePage from "./pages/FutureCapsulePage";
import Finance from "./pages/Finance";
import Billing from "./pages/Billing";
import Layout from "./components/Layout";

// Protected route — server session шалгана (зөвхөн нэг удаа)
let _sessionChecked = false;
let _sessionValid = false;

// Login хийсний дараа session-г valid тэмдэглэнэ
window.addEventListener("session-validated", () => {
  _sessionChecked = true;
  _sessionValid = true;
});

// Logout хийхэд session cache reset хийнэ
window.addEventListener("session-invalidate", () => {
  _sessionChecked = false;
  _sessionValid = false;
});

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  // Cache-д аль хэдийн valid байвал шууд дамжуулна
  const initialVerified = _sessionChecked ? _sessionValid : null;
  const [verified, setVerified] = useState(initialVerified);

  useEffect(() => {
    if (!user) { setVerified(false); return; }
    // Аль хэдийн шалгасан бол дахин шалгахгүй
    if (_sessionChecked) {
      setVerified(_sessionValid);
      return;
    }
    const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";
    // Server-т session хүчинтэй эсэхийг нэг удаа шалгана
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE}/auth/me`, { credentials: "include", headers })
      .then(async (res) => {
        _sessionChecked = true;
        _sessionValid = res.ok;
        if (res.ok) {
          const data = await res.json();
          if (data.token) localStorage.setItem("token", data.token);
          setVerified(true);
        } else {
          dispatch(clearCredentials());
          setVerified(false);
        }
      })
      .catch(() => {
        _sessionChecked = true;
        _sessionValid = false;
        dispatch(clearCredentials());
        setVerified(false);
      });
  }, [user]);

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (verified === null) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc"}}>
      <div style={{color:"#94a3b8",fontSize:14}}>Шалгаж байна...</div>
    </div>
  );
  if (verified === false) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user?.role === "admin" ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/todos/:status" element={<Todos />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/visionboard/:id" element={<VisionBoardPage />} />
        <Route path="/futurecapsule" element={<FutureCapsulePage />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
