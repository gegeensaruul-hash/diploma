import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import {
  MdAdd, MdEdit, MdDelete, MdCalendarToday, MdTrendingUp,
  MdCheckCircle, MdRadioButtonUnchecked, MdClose,
} from "react-icons/md";
import { getUserStore, setUserStore } from "../utils/userStorage";

const DEFAULT_HABITS = [
  { id: 1, name: "7-8 цаг унтах", icon: "🕒", completed: false, streak: 3 },
  { id: 2, name: "Дасгал хийх", icon: "🏃", completed: false, streak: 5 },
  { id: 3, name: "Meditation", icon: "🧘", completed: false, streak: 1 },
  { id: 4, name: "Ном унших", icon: "📚", completed: false, streak: 2 },
  { id: 5, name: "2л ус уух", icon: "💧", completed: false, streak: 4 },
];

const HABIT_ICONS = ["🕒", "🏃", "🧘", "📚", "💧", "🍎", "🚶", "💪", "🎯", "⭐", "🔥", "📝", "🎨", "🌱", "🧠"];

export default function Habits() {
  const { t, theme, lang } = useSettings();
  const [habits, setHabits] = useState([]);
  const [dailyTodos, setDailyTodos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [calendarView, setCalendarView] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", icon: "📝" });
  const [newTodo, setNewTodo] = useState("");

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = getUserStore("daily-habits", null);
    const savedTodos = getUserStore("daily-todos", null);
    
    if (savedHabits) {
      setHabits(savedHabits);
    } else {
      setHabits(DEFAULT_HABITS);
      setUserStore("daily-habits", DEFAULT_HABITS);
    }
    
    if (savedTodos) {
      setDailyTodos(savedTodos);
    }
  }, []);

  // Save to localStorage whenever habits or todos change
  useEffect(() => {
    if (habits.length > 0) {
      setUserStore("daily-habits", habits);
    }
  }, [habits]);

  useEffect(() => {
    setUserStore("daily-todos", dailyTodos);
  }, [dailyTodos]);

  const getProgress = () => {
    const completed = habits.filter(h => h.completed).length;
    return habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
  };

  const toggleHabit = (id) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id 
        ? { ...habit, completed: !habit.completed, streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1) }
        : habit
    ));
  };

  const toggleTodo = (id) => {
    setDailyTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const saveHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error(lang === "mn" ? "Habit нэр оруулна уу" : "Please enter habit name");
      return;
    }

    if (editingHabit) {
      setHabits(prev => prev.map(h => 
        h.id === editingHabit.id 
          ? { ...h, name: newHabit.name, icon: newHabit.icon }
          : h
      ));
      toast.success(lang === "mn" ? "Habit засагдлаа" : "Habit updated");
    } else {
      const newId = Math.max(0, ...habits.map(h => h.id)) + 1;
      setHabits(prev => [...prev, {
        id: newId,
        name: newHabit.name,
        icon: newHabit.icon,
        completed: false,
        streak: 0
      }]);
      toast.success(lang === "mn" ? "Шинэ habit нэмэгдлээ" : "New habit added");
    }

    setModalOpen(false);
    setEditingHabit(null);
    setNewHabit({ name: "", icon: "📝" });
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    toast.success(lang === "mn" ? "Habit устгагдлаа" : "Habit deleted");
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setNewHabit({ name: habit.name, icon: habit.icon });
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setNewHabit({ name: "", icon: "📝" });
    setModalOpen(true);
  };

  const addTodo = () => {
    if (!newTodo.trim()) {
      toast.error(lang === "mn" ? "Todo текст оруулна уу" : "Please enter todo text");
      return;
    }

    if (editingTodo) {
      setDailyTodos(prev => prev.map(t => 
        t.id === editingTodo.id ? { ...t, text: newTodo } : t
      ));
      toast.success(lang === "mn" ? "Todo засагдлаа" : "Todo updated");
    } else {
      const newId = Math.max(0, ...dailyTodos.map(t => t.id), 0) + 1;
      setDailyTodos(prev => [...prev, {
        id: newId,
        text: newTodo,
        completed: false
      }]);
      toast.success(lang === "mn" ? "Todo нэмэгдлээ" : "Todo added");
    }
    
    setNewTodo("");
    setEditingTodo(null);
    setTodoModalOpen(false);
  };

  const deleteTodo = (id) => {
    setDailyTodos(prev => prev.filter(t => t.id !== id));
    toast.success(lang === "mn" ? "Todo устгагдлаа" : "Todo deleted");
  };

  const openEditTodo = (todo) => {
    setEditingTodo(todo);
    setNewTodo(todo.text);
    setTodoModalOpen(true);
  };

  const openAddTodo = () => {
    setEditingTodo(null);
    setNewTodo("");
    setTodoModalOpen(true);
  };

  const renderCalendar = () => {
    const days = lang === "mn" ? ['Д', 'М', 'Л', 'П', 'Б', 'Б', 'Н'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Get completion data from localStorage (simulate historical data)
    const getCompletionData = (day) => {
      const completedHabits = habits.filter(h => h.completed).slice(0, Math.floor(Math.random() * habits.length));
      const completedTodos = dailyTodos.filter(t => t.completed).slice(0, Math.floor(Math.random() * dailyTodos.length));
      return { habits: completedHabits, todos: completedTodos };
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {lang === "mn" ? `${currentYear}/${currentMonth}-р сарын календарь` : `${currentYear}/${currentMonth} Calendar`}
        </h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
            const isToday = day === today;
            const dayData = getCompletionData(day);
            const hasCompletions = dayData.habits.length > 0 || dayData.todos.length > 0;
            const completionPercentage = habits.length > 0 ? Math.round((dayData.habits.length / habits.length) * 100) : 0;
            
            return (
              <div key={day} className={`
                group relative text-center py-2 px-1 text-xs rounded-lg cursor-pointer transition-all
                ${isToday ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300' : 'hover:bg-slate-50'}
                ${hasCompletions ? 'bg-green-50 text-green-700' : ''}
              `}
                title={`${currentMonth}/${day} - ${completionPercentage}% гүйцэтгэл`}
              >
                <div className="font-medium">{day}</div>
                {hasCompletions && (
                  <div className="absolute inset-x-1 bottom-0 space-y-0.5">
                    {/* Completion indicator */}
                    <div className="flex justify-center">
                      <div 
                        className="w-1 h-1 bg-green-500 rounded-full" 
                        style={{ opacity: completionPercentage / 100 }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Tooltip with details */}
                <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div>{currentMonth}/{day}</div>
                  {dayData.habits.length > 0 && (
                    <div className="text-green-300">
                      ✓ {dayData.habits.map(h => h.icon).join(' ')}
                    </div>
                  )}
                  {dayData.todos.length > 0 && (
                    <div className="text-blue-300">
                      📋 {dayData.todos.length} todo гүйцэтгэсэн
                    </div>
                  )}
                  {!hasCompletions && (
                    <div className="text-gray-300">Өдрийн төлөвлөгөө байхгүй</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-600 mb-2 font-medium">
            {lang === "mn" ? "Тэмдэглэгээ:" : "Legend:"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span>{lang === "mn" ? "Өнөөдөр" : "Today"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              </div>
              <span>{lang === "mn" ? "Гүйцэтгэсэн" : "Completed"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" 
               style={{ background: theme.accent }}>
            H
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daily Habits</h2>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString(lang === "en" ? "en-US" : "mn-MN")}
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          style={{ background: theme.accent }}
        >
          <MdAdd size={18} /> {lang === "mn" ? "Нэмэх" : "Add Habit"}
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-600">{lang === "mn" ? "Өнөөдрийн прогресс" : "Today's Progress"}</span>
          <span className="text-lg font-bold text-slate-800">{getProgress()}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${getProgress()}%`,
              background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accent}aa 100%)`
            }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {lang === "mn" ? "Өнөөдрийн зорилго" : "Today's Habits"}
          </h3>
        </div>
        {habits.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-lg font-medium">{lang === "mn" ? "Habit байхгүй байна" : "No habits yet"}</p>
            <p className="text-sm mt-1">{lang === "mn" ? "Шинэ habit нэмээд эхлэцгээе!" : "Add your first habit!"}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {habits.map((habit) => (
              <div key={habit.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="flex-shrink-0"
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    habit.completed 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                  }`}>
                    {habit.completed && (
                      <svg width="14" height="14" viewBox="0 0 14 14" className="text-white">
                        <polyline 
                          points="3,7 6,10 11,4" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
                
                <div className="text-2xl">{habit.icon}</div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${habit.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                    {habit.name}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {lang === "mn" ? "Тасралтгүй" : "Streak"}: {habit.streak} {lang === "mn" ? "өдөр" : "days"} 🔥
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Todos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">T</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {lang === "mn" ? "Өнөөдрийн ажил" : "Daily Todos"}
            </h3>
          </div>
          <button
            onClick={openAddTodo}
            className="text-slate-400 hover:text-slate-600"
          >
            <MdAdd size={20} />
          </button>
        </div>
        
        {dailyTodos.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <p className="text-sm">{lang === "mn" ? "Todo байхгүй байна" : "No todos yet"}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dailyTodos.map((todo) => (
              <div key={todo.id} className="p-4 flex items-center gap-3 group hover:bg-slate-50 transition-colors">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    todo.completed 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                  }`}>
                    {todo.completed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
                        <polyline 
                          points="2,6 5,9 10,3" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                  {todo.text}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditTodo(todo)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title={lang === "mn" ? "Засах" : "Edit"}
                  >
                    <MdEdit size={14} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title={lang === "mn" ? "Устгах" : "Delete"}
                  >
                    <MdClose size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Toggle */}
      <button
        onClick={() => setCalendarView(!calendarView)}
        className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <MdCalendarToday size={18} />
        <span className="font-medium">
          {calendarView 
            ? (lang === "mn" ? "Календарь нуух" : "Hide Calendar")
            : (lang === "mn" ? "Календарь харах" : "Show Calendar")
          }
        </span>
      </button>

      {/* Calendar View */}
      {calendarView && renderCalendar()}

      {/* Add/Edit Habit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingHabit ? 
                (lang === "mn" ? "Habit засах" : "Edit Habit") :
                (lang === "mn" ? "Шинэ habit нэмэх" : "Add New Habit")
              }
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {lang === "mn" ? "Habit нэр" : "Habit Name"}
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={lang === "mn" ? "жнь: 7-8 цаг унтах" : "e.g. Drink 8 glasses of water"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === "mn" ? "Emoji сонгох" : "Choose Icon"}
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {HABIT_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewHabit(prev => ({ ...prev, icon }))}
                      className={`p-2 text-lg rounded-lg border-2 transition-colors ${
                        newHabit.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {lang === "mn" ? "Цуцлах" : "Cancel"}
              </button>
              <button
                onClick={saveHabit}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                style={{ background: theme.accent }}
              >
                {lang === "mn" ? "Хадгалах" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo Modal */}
      {todoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingTodo ? 
                (lang === "mn" ? "Todo засах" : "Edit Todo") :
                (lang === "mn" ? "Шинэ todo нэмэх" : "Add New Todo")
              }
            </h3>
            
            <div className="mb-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={lang === "mn" ? "Todo текст оруулна уу" : "Enter todo text"}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTodoModalOpen(false);
                  setEditingTodo(null);
                  setNewTodo("");
                }}
                className="flex-1 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {lang === "mn" ? "Цуцлах" : "Cancel"}
              </button>
              <button
                onClick={addTodo}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                style={{ background: theme.accent }}
              >
                {editingTodo ? (lang === "mn" ? "Засах" : "Update") : (lang === "mn" ? "Нэмэх" : "Add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
