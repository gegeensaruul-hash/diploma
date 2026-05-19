import { toast } from "sonner";
import { MdBlock, MdCheckCircle, MdDelete } from "react-icons/md";
import { apiSlice } from "../redux/slices/apiSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";

export default function Users() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      const data = await res.json();
      setUsers(data.users || []);
    } catch { toast.error("Алдаа гарлаа"); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}/toggle`, { method: "PUT", credentials: "include" });
      const data = await res.json();
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error("Алдаа гарлаа"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Хэрэглэгчийг устгах уу?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Устгагдлаа");
      fetchUsers();
    } catch { toast.error("Алдаа гарлаа"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">👥 Хэрэглэгчид</h2>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Уншиж байна...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
                <th className="px-4 py-3 text-left">Хэрэглэгч</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">И-мэйл</th>
                <th className="px-4 py-3 text-left">Эрх</th>
                <th className="px-4 py-3 text-left">Төлөв</th>
                <th className="px-4 py-3 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-slate-500">{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                      {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-medium ${u.isActive ? "text-green-600" : "text-red-500"}`}>
                      {u.isActive ? <MdCheckCircle size={14} /> : <MdBlock size={14} />}
                      {u.isActive ? "Идэвхтэй" : "Хаагдсан"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`px-2 py-1.5 text-xs rounded-lg ${u.isActive ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                      >
                        {u.isActive ? "Хаах" : "Нээх"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
