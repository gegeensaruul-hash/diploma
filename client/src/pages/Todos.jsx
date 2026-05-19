import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MdAdd, MdEdit, MdDelete,
  MdCheckCircle, MdRadioButtonUnchecked, MdPending, MdCalendarToday,
} from "react-icons/md";
import {
  useGetTodosQuery, useUpdateStatusMutation, useTrashTodoMutation,
  useUpdateTodoMutation,
} from "../redux/slices/api/todoApiSlice";
import { useGetCategoriesQuery } from "../redux/slices/api/categoryApiSlice";
import TodoModal from "../components/TodoModal";
import { useSettings } from "../context/SettingsContext";

const statusIcon = {
  todo:        <MdRadioButtonUnchecked className="text-slate-400" size={20} />,
  in_progress: <MdPending className="text-blue-500" size={20} />,
  completed:   <MdCheckCircle className="text-green-500" size={20} />,
};

export default function Todos() {
  const { status } = useParams();
  const { t, theme, lang } = useSettings();

  const [search, setSearch]       = useState("");
  const [priority, setPriority]   = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage]           = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTodo, setEditTodo]   = useState(null);

  const { data, isLoading } = useGetTodosQuery({ status, search, priority, categoryId, page, limit: 8 });
  const { data: catData }   = useGetCategoriesQuery();
  const [updateStatus]      = useUpdateStatusMutation();
  const [trashTodo]         = useTrashTodoMutation();
  const [updateTodo]        = useUpdateTodoMutation();
  const [quickDateId, setQuickDateId] = useState(null);
  const dateInputRef = useRef(null);

  const todos      = data?.todos || [];
  const totalPages = data?.totalPages || 1;

  /* ── i18n labels ── */
  const priorityStyle = {
    high:   "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low:    "bg-green-100 text-green-700",
  };
  const priorityLabel = lang === "mn"
    ? { high: "Өндөр", medium: "Дунд", low: "Бага" }
    : { high: "High",  medium: "Medium", low: "Low" };

  const statusLabel = lang === "mn"
    ? { todo: "Хийх", in_progress: "Хийж байна", completed: "Дууссан" }
    : { todo: "To Do", in_progress: "In Progress", completed: "Done" };

  const titleMap = lang === "mn"
    ? { todo: "Хийх", in_progress: "Хийж байна", completed: "Дууссан" }
    : { todo: "To Do", in_progress: "In Progress", completed: "Completed" };

  /* ── handlers ── */
  const handleStatusToggle = async (todo) => {
    const next = todo.status === "todo" ? "in_progress"
               : todo.status === "in_progress" ? "completed" : "todo";
    try { await updateStatus({ id: todo.id, status: next }).unwrap(); }
    catch { toast.error(lang === "mn" ? "Алдаа гарлаа" : "An error occurred"); }
  };

  const handleTrash = async (id) => {
    try {
      await trashTodo(id).unwrap();
      toast.success(lang === "mn" ? "Trash руу шилжлээ" : "Moved to trash");
    } catch { toast.error(lang === "mn" ? "Алдаа гарлаа" : "An error occurred"); }
  };

  const handleQuickDate = async (todo, dateValue) => {
    try {
      await updateTodo({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        dueDate: dateValue || null,
        categoryId: todo.categoryId || "",
      }).unwrap();
      toast.success(lang === "mn" ? "Огноо хадгалагдлаа 📅" : "Due date saved 📅");
    } catch {
      toast.error(lang === "mn" ? "Алдаа гарлаа" : "An error occurred");
    }
    setQuickDateId(null);
  };

  const openEdit   = (todo) => { setEditTodo(todo); setModalOpen(true); };
  const openCreate = ()     => { setEditTodo(null);  setModalOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          {status ? (titleMap[status] || status) : t.allTodos}
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          style={{ background: theme.accent }}
        >
          <MdAdd size={18} /> {lang === "mn" ? "Нэмэх" : "Add"}
        </button>
      </div>
      {/* List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          {lang === "mn" ? "Уншиж байна..." : "Loading..."}
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl shadow-sm">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-medium">{lang === "mn" ? "Todo байхгүй байна" : "No todos yet"}</p>
          <p className="text-sm mt-1">{lang === "mn" ? "Шинэ todo нэмнэ үү" : "Add a new todo"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">{lang === "mn" ? "Гарчиг" : "Title"}</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">{lang === "mn" ? "Категори" : "Category"}</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">{lang === "mn" ? "Чухал" : "Priority"}</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">{lang === "mn" ? "Огноо" : "Due Date"}</th>
                <th className="px-4 py-3 text-left">{lang === "mn" ? "Төлөв" : "Status"}</th>
                <th className="px-4 py-3 text-right">{lang === "mn" ? "Үйлдэл" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todos.map((todo) => (
                <tr key={todo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => handleStatusToggle(todo)} title={lang === "mn" ? "Төлөв солих" : "Toggle status"}>
                      {statusIcon[todo.status]}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-sm font-medium ${todo.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{todo.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {todo.category ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: todo.category.color }} />
                        {todo.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyle[todo.priority]}`}>
                      {priorityLabel[todo.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {quickDateId === todo.id ? (
                      <input
                        ref={dateInputRef}
                        type="date"
                        defaultValue={todo.dueDate || ""}
                        autoFocus
                        className="border border-blue-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onBlur={(e) => handleQuickDate(todo, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleQuickDate(todo, e.target.value);
                          if (e.key === "Escape") setQuickDateId(null);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setQuickDateId(todo.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors group"
                        title={lang === "mn" ? "Огноо тохируулах" : "Set due date"}
                      >
                        <MdCalendarToday size={13} className="text-slate-400 group-hover:text-blue-500" />
                        {todo.dueDate ? (
                          <span className="font-medium">{todo.dueDate}</span>
                        ) : (
                          <span className="text-slate-300">{lang === "mn" ? "Огноо" : "Set date"}</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600">{statusLabel[todo.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(todo)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <MdEdit size={16} />
                      </button>
                      <button onClick={() => handleTrash(todo.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-100">
            {lang === "mn" ? "← Өмнөх" : "← Prev"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p === page ? "text-white" : "border border-slate-300 hover:bg-slate-100"
              }`}
              style={p === page ? { background: theme.accent } : {}}>
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-100">
            {lang === "mn" ? "Дараах →" : "Next →"}
          </button>
        </div>
      )}

      <TodoModal open={modalOpen} onClose={() => setModalOpen(false)} todo={editTodo} />
    </div>
  );
}
