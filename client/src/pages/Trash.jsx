import { toast } from "sonner";
import { MdRestoreFromTrash, MdDeleteForever } from "react-icons/md";
import { useGetTrashedQuery, useRestoreTodoMutation, useDeleteTodoMutation } from "../redux/slices/api/todoApiSlice";

export default function Trash() {
  const { data, isLoading } = useGetTrashedQuery();
  const [restore] = useRestoreTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const todos = data?.todos || [];

  const handleRestore = async (id) => {
    try {
      await restore(id).unwrap();
      toast.success("Сэргээгдлээ");
    } catch { toast.error("Алдаа гарлаа"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Бүрмөсөн устгах уу?")) return;
    try {
      await deleteTodo(id).unwrap();
      toast.success("Устгагдлаа");
    } catch { toast.error("Алдаа гарлаа"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">🗑 Хогийн сав</h2>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Уншиж байна...</div>
      ) : todos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl shadow-sm">
          <p className="text-4xl mb-3">🗑️</p>
          <p className="text-lg font-medium">Хогийн сав хоосон байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
                <th className="px-4 py-3 text-left">Гарчиг</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Чухал зэрэг</th>
                <th className="px-4 py-3 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todos.map((todo) => (
                <tr key={todo.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-500 line-through">{todo.title}</p>
                    {todo.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{todo.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-slate-400">{todo.priority === "high" ? "Өндөр" : todo.priority === "medium" ? "Дунд" : "Бага"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleRestore(todo.id)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <MdRestoreFromTrash size={15} /> Сэргээх
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <MdDeleteForever size={15} /> Устгах
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
