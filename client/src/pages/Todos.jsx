import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MdAdd, MdEdit, MdDelete,
  MdCheckCircle, MdRadioButtonUnchecked, MdPending, MdCalendarToday,
  MdOutlineChecklist,
} from "react-icons/md";
import {
  useGetTodosQuery, useUpdateStatusMutation, useTrashTodoMutation,
  useUpdateTodoMutation,
} from "../redux/slices/api/todoApiSlice";
import { useGetCategoriesQuery } from "../redux/slices/api/categoryApiSlice";
import TodoModal from "../components/TodoModal";
import { useSettings } from "../context/SettingsContext";

const statusIcon = {
  todo:        <MdRadioButtonUnchecked className="text-slate-500" size={20} />,
  in_progress: <MdPending className="text-indigo-400" size={20} />,
  completed:   <MdCheckCircle className="text-emerald-400" size={20} />,
};

const priorityTone = {
  high:   { bg: "rgba(239, 68, 68, 0.15)",  text: "#ef4444", border: "rgba(239, 68, 68, 0.2)" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.2)" },
  low:    { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.2)" },
};

const statusTone = {
  todo:        { bg: "rgba(255, 255, 255, 0.03)", text: "#94a3b8", border: "rgba(255, 255, 255, 0.05)" },
  in_progress: { bg: "rgba(99, 102, 241, 0.15)",  text: "#818cf8", border: "rgba(99, 102, 241, 0.2)" },
  completed:   { bg: "rgba(16, 185, 129, 0.15)",  text: "#34d399", border: "rgba(16, 185, 129, 0.2)" },
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

  const { data, isLoading } = useGetTodosQuery({ status, search, priority, categoryId, page, limit: 10 });
  const [updateStatus]      = useUpdateStatusMutation();
  const [trashTodo]         = useTrashTodoMutation();
  const [updateTodo]        = useUpdateTodoMutation();
  const [quickDateId, setQuickDateId] = useState(null);
  const dateInputRef = useRef(null);

  const todos      = data?.todos || [];
  const totalPages = data?.totalPages || 1;

  const priorityLabel = lang === "mn"
    ? { high: "Өндөр", medium: "Дунд", low: "Бага" }
    : { high: "High",  medium: "Medium", low: "Low" };

  const statusLabel = lang === "mn"
    ? { todo: "Хийх", in_progress: "Хийж байна", completed: "Дууссан" }
    : { todo: "To Do", in_progress: "In Progress", completed: "Done" };

  const titleMap = lang === "mn"
    ? { todo: "Хийх", in_progress: "Хийж байна", completed: "Дууссан" }
    : { todo: "To Do", in_progress: "In Progress", completed: "Completed" };

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
      toast.success(lang === "mn" ? "Огноо хадгалагдлаа" : "Due date saved");
    } catch {
      toast.error(lang === "mn" ? "Алдаа гарлаа" : "An error occurred");
    }
    setQuickDateId(null);
  };

  const openEdit   = (todo) => { setEditTodo(todo); setModalOpen(true); };
  const openCreate = ()     => { setEditTodo(null);  setModalOpen(true); };

  return (
    <div className="animate-in space-y-6">
      <style>{`
        .todo-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .todo-table th { 
          text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 800; 
          color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .todo-table td { padding: 16px; vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .todo-row { transition: all 0.2s; }
        .todo-row:hover { background: rgba(255,255,255,0.02); }
        .pagination-btn {
           padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
           transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08);
           background: rgba(255,255,255,0.03); color: #94a3b8;
        }
        .pagination-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
        .pagination-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; box-shadow: 0 0 12px rgba(99, 102, 241, 0.3); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-1px" }}>
            {status ? (titleMap[status] || status) : t.allTodos}
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
            {lang === "mn" ? `${todos.length} ажил олдлоо` : `${todos.length} tasks found`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
          style={{ padding: "12px 24px", fontSize: 14, borderRadius: 12 }}
        >
          <MdAdd size={20} /> {lang === "mn" ? "Шинэ ажил" : "Create Task"}
        </button>
      </div>

      {/* Content */}
      <div className="premium-card" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)", overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            {lang === "mn" ? "Уншиж байна..." : "Loading tasks..."}
          </div>
        ) : todos.length === 0 ? (
          <div style={{ padding: 80, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.03)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>
              <MdOutlineChecklist size={32} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{lang === "mn" ? "Ажил олдсонгүй" : "No tasks found"}</h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{lang === "mn" ? "Шинэ ажил нэмж бүтээмжээ нэмэгдүүлнэ үү." : "Add a new task to start being productive."}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="todo-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}></th>
                  <th>{lang === "mn" ? "Ажлын нэр" : "Task Name"}</th>
                  <th className="hidden md:table-cell">{lang === "mn" ? "Категори" : "Category"}</th>
                  <th className="hidden sm:table-cell">{lang === "mn" ? "Чухал" : "Priority"}</th>
                  <th className="hidden lg:table-cell">{lang === "mn" ? "Огноо" : "Due Date"}</th>
                  <th>{lang === "mn" ? "Төлөв" : "Status"}</th>
                  <th style={{ textAlign: "right" }}>{lang === "mn" ? "Үйлдэл" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {todos.map((todo) => (
                  <tr key={todo.id} className="todo-row">
                    <td>
                      <button onClick={() => handleStatusToggle(todo)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                        {statusIcon[todo.status]}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: todo.status === "completed" ? "#475569" : "#fff", textDecoration: todo.status === "completed" ? "line-through" : "none", transition: "all .2s" }}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <span style={{ fontSize: 12, color: "#64748b", marginTop: 2, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {todo.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      {todo.category ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: todo.category.color }} />
                          {todo.category.name}
                        </div>
                      ) : <span style={{ color: "#334155" }}>—</span>}
                    </td>
                    <td className="hidden sm:table-cell">
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                        background: priorityTone[todo.priority].bg, color: priorityTone[todo.priority].text,
                        border: `1px solid ${priorityTone[todo.priority].border}`
                      }}>
                        {priorityLabel[todo.priority]}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      {quickDateId === todo.id ? (
                        <input
                          ref={dateInputRef}
                          type="date"
                          defaultValue={todo.dueDate || ""}
                          autoFocus
                          style={{
                            background: "rgba(255,255,255,0.05)", border: "1px solid #6366f1", borderRadius: 8,
                            padding: "4px 8px", fontSize: 12, color: "#fff", outline: "none"
                          }}
                          onBlur={(e) => handleQuickDate(todo, e.target.value)}
                        />
                      ) : (
                        <button
                          onClick={() => setQuickDateId(todo.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b",
                            background: "none", border: "none", cursor: "pointer", padding: "4px 0"
                          }}
                        >
                          <MdCalendarToday size={14} color={todo.dueDate ? "#6366f1" : "#334155"} />
                          {todo.dueDate || (lang === "mn" ? "Огноо" : "Set date")}
                        </button>
                      )}
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                        background: statusTone[todo.status].bg, color: statusTone[todo.status].text,
                        border: `1px solid ${statusTone[todo.status].border}`
                      }}>
                        {statusLabel[todo.status]}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        <button onClick={() => openEdit(todo)} style={{ p: 2, background: "none", border: "none", cursor: "pointer", color: "#64748b" }} className="hover:text-indigo-400">
                          <MdEdit size={18} />
                        </button>
                        <button onClick={() => handleTrash(todo.id)} style={{ p: 2, background: "none", border: "none", cursor: "pointer", color: "#64748b" }} className="hover:text-red-400">
                          <MdDelete size={18} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 10 }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="pagination-btn">
            {lang === "mn" ? "Өмнөх" : "Prev"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`pagination-btn ${p === page ? "active" : ""}`}>
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagination-btn">
            {lang === "mn" ? "Дараах" : "Next"}
          </button>
        </div>
      )}

      <TodoModal open={modalOpen} onClose={() => setModalOpen(false)} todo={editTodo} />
    </div>
  );
}
