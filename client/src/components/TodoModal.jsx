import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateTodoMutation, useUpdateTodoMutation } from "../redux/slices/api/todoApiSlice";
import { useGetCategoriesQuery } from "../redux/slices/api/categoryApiSlice";
import { MdClose } from "react-icons/md";

export default function TodoModal({ open, onClose, todo }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { data: catData } = useGetCategoriesQuery();
  const [createTodo, { isLoading: creating }] = useCreateTodoMutation();
  const [updateTodo, { isLoading: updating }] = useUpdateTodoMutation();

  useEffect(() => {
    if (open) {
      reset(todo
        ? { title: todo.title, description: todo.description, status: todo.status, priority: todo.priority, dueDate: todo.dueDate, categoryId: todo.categoryId || "" }
        : { status: "todo", priority: "medium" }
      );
    }
  }, [open, todo]);

  const onSubmit = async (data) => {
    try {
      if (todo) {
        await updateTodo({ id: todo.id, ...data }).unwrap();
        toast.success("Task updated successfully");
      } else {
        await createTodo(data).unwrap();
        toast.success("New task created");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "An error occurred");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[#020617]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in">
      <div className="bg-[#0f172a] rounded-[24px] shadow-2xl w-full max-w-md border border-black/5 dark:border-white/5 overflow-hidden shadow-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">{todo ? "Edit Task" : "New Task"}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-widest">Task Details</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-stone-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-xl p-2 transition-all">
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          <style>{`
            .modal-input { 
              background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); 
              border-radius: 14px; padding: 12px 16px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
              width: 100%; box-sizing: border-box;
            }
            .modal-input:focus { border-color: #ffffff; background: rgba(255,255,255,0.06); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08); }
            .modal-label { display: block; font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
          `}</style>

          {/* Title */}
          <div>
            <label className="modal-label">Title</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              className="modal-input"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1.5 font-bold">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="modal-label">Description</label>
            <textarea
              rows={3}
              placeholder="Add some context..."
              className="modal-input resize-none"
              {...register("description")}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="modal-label">Status</label>
              <select className="modal-input" {...register("status")}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="modal-label">Priority</label>
              <select className="modal-input" {...register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due date + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="modal-label">Due Date</label>
              <input type="date" className="modal-input" {...register("dueDate")} />
            </div>
            <div>
              <label className="modal-label">Category</label>
              <select className="modal-input" {...register("categoryId")}>
                <option value="">Select Category</option>
                {catData?.categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-black/8 dark:border-white/8 text-slate-400 rounded-xl text-sm font-bold hover:bg-black/5 dark:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="flex-1 py-3.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 disabled:opacity-50 transition-all shadow-lg shadow-white/10"
            >
              {creating || updating ? "Saving..." : todo ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
