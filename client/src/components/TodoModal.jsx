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
        toast.success("Todo шинэчлэгдлээ");
      } else {
        await createTodo(data).unwrap();
        toast.success("Todo нэмэгдлээ");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Алдаа гарлаа");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{todo ? "Todo засах" : "Шинэ Todo нэмэх"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <MdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Гарчиг *</label>
            <input
              type="text"
              placeholder="Todo гарчиг..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              {...register("title", { required: "Гарчиг шаардлагатай" })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Тайлбар</label>
            <textarea
              rows={3}
              placeholder="Дэлгэрэнгүй тайлбар..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              {...register("description")}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Төлөв</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("status")}
              >
                <option value="todo">Хийх</option>
                <option value="in_progress">Хийж байна</option>
                <option value="completed">Дууссан</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Чухал зэрэг</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("priority")}
              >
                <option value="low">Бага</option>
                <option value="medium">Дунд</option>
                <option value="high">Өндөр</option>
              </select>
            </div>
          </div>

          {/* Due date + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Дуусах огноо</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("dueDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Категори</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("categoryId")}
              >
                <option value="">— Сонгох —</option>
                {catData?.categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {creating || updating ? "Хадгалж байна..." : todo ? "Хадгалах" : "Нэмэх"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
