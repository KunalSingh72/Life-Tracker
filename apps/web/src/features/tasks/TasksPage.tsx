import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Circle, Flag, ListTodo, Menu } from "lucide-react";
import type { Task, Priority } from "@life-tracker/types";
import { TaskSidebar } from "./components/TaskSidebar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useUiStore } from "@/stores/ui.store";

const STORAGE_KEY = "life-tracker-tasks";

export default function TasksPage() {
  const { openMobileMenu } = useUiStore();

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (error) {
      console.error("Failed to parse tasks from local storage", error);
      return [];
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: "none",
      subtasks: [],
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
  };

  const updateTask = (updatedTask: Task) =>
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

  const toggleTaskCompletion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const updatePriority = (
    taskId: string,
    priority: Priority,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, priority } : t)));
    setActiveDropdown(null);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-text-secondary";
    }
  };

  const areAllTasksCompleted =
    tasks.length > 0 && tasks.every((t) => t.completed);
  const toggleAllTasks = () =>
    setTasks(tasks.map((t) => ({ ...t, completed: !areAllTasksCompleted })));

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const taskInputForm = (
    <form
      onSubmit={handleAddTask}
      className="w-full relative flex items-center group"
    >
      <input
        type="text"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="Add a task..."
        className="w-full bg-background-main md:bg-background-surface border border-border-subtle rounded-xl md:rounded-2xl py-3 md:py-4 pl-4 md:pl-6 pr-20 md:pr-24 text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all text-sm md:text-base"
      />
      <button
        type="submit"
        disabled={!newTaskTitle.trim()}
        className="absolute right-2 md:right-2 bg-accent-primary text-white font-medium py-1.5 md:py-2 px-4 md:px-6 rounded-lg md:rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2 text-sm md:text-base"
      >
        Add
      </button>
    </form>
  );

  return (
    <div className="flex h-full w-full absolute inset-0 z-20 bg-background-surface md:static md:bg-transparent overflow-hidden">
      {/* Left: Main Task List Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
        <div className="flex flex-col h-full max-w-4xl w-full mx-auto relative pb-2 md:pb-0 px-0 md:px-8">
          {/* Mobile-Only Header */}
          <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border-subtle shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={openMobileMenu}
                className="p-2 -ml-2 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-2xl font-extrabold bg-linear-to-r from-text-primary via-accent-primary to-text-primary bg-clip-text text-transparent">
                TODO
              </span>
            </div>
          </div>

          {/* Desktop-Only Header */}
          <div className="hidden md:flex py-8 flex-col items-center shrink-0">
            <h1 className="text-5xl font-extrabold tracking-tight mb-8">
              <span className="bg-linear-to-r from-text-primary via-accent-primary to-text-primary bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
                TODO
              </span>
            </h1>
            <div className="w-full">{taskInputForm}</div>
          </div>

          {/* Task List Block */}
          <div className="flex-1 overflow-hidden flex flex-col md:bg-background-surface md:border border-border-subtle md:rounded-2xl md:shadow-sm md:mb-8">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border-subtle bg-background-main/30 shrink-0">
              <button
                onClick={toggleAllTasks}
                disabled={tasks.length === 0}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {areAllTasksCompleted ? "Mark all undone" : "Mark all done"}
              </button>
              <button
                onClick={() => setIsDeleteAllModalOpen(true)}
                disabled={tasks.length === 0}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {tasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                  No tasks yet. Add one above.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`group flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedTaskId === task.id
                        ? "border-accent-primary bg-accent-subtle/30"
                        : "border-border-subtle hover:border-text-secondary/30 md:hover:bg-background-main"
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <button
                        onClick={(e) => toggleTaskCompletion(task.id, e)}
                        className="p-2 -ml-2 shrink-0 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-accent-primary" />
                        ) : (
                          <Circle className="w-6 h-6 text-text-secondary md:group-hover:text-text-primary transition-colors" />
                        )}
                      </button>
                      <div className="flex flex-col truncate">
                        <span
                          className={`font-medium transition-all truncate ${task.completed ? "text-text-secondary line-through" : "text-text-primary"}`}
                        >
                          {task.title}
                        </span>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-secondary">
                            <ListTodo className="w-3.5 h-3.5" />
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}{" "}
                              / {task.subtasks.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(
                            activeDropdown === task.id ? null : task.id,
                          );
                        }}
                        className={`p-3 md:p-2 -mr-2 md:mr-0 rounded-lg hover:bg-background-surface transition-colors cursor-pointer ${getPriorityColor(task.priority)}`}
                      >
                        <Flag
                          className="w-5 h-5"
                          fill={
                            task.priority !== "none" ? "currentColor" : "none"
                          }
                        />
                      </button>

                      {activeDropdown === task.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 mt-2 w-36 bg-background-surface border border-border-subtle rounded-xl shadow-lg z-20 py-2 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={(e) => updatePriority(task.id, "high", e)}
                            className="w-full text-left px-4 py-3 md:py-2 text-sm text-text-primary hover:bg-background-main flex items-center gap-2 cursor-pointer"
                          >
                            <Flag
                              className="w-4 h-4 text-red-500"
                              fill="currentColor"
                            />{" "}
                            High
                          </button>
                          <button
                            onClick={(e) =>
                              updatePriority(task.id, "medium", e)
                            }
                            className="w-full text-left px-4 py-3 md:py-2 text-sm text-text-primary hover:bg-background-main flex items-center gap-2 cursor-pointer"
                          >
                            <Flag
                              className="w-4 h-4 text-yellow-500"
                              fill="currentColor"
                            />{" "}
                            Medium
                          </button>
                          <button
                            onClick={(e) => updatePriority(task.id, "low", e)}
                            className="w-full text-left px-4 py-3 md:py-2 text-sm text-text-primary hover:bg-background-main flex items-center gap-2 cursor-pointer"
                          >
                            <Flag
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                            />{" "}
                            Low
                          </button>
                          <button
                            onClick={(e) => updatePriority(task.id, "none", e)}
                            className="w-full text-left px-4 py-3 md:py-2 text-sm text-text-primary hover:bg-background-main flex items-center gap-2 cursor-pointer"
                          >
                            <Flag className="w-4 h-4 text-text-secondary" />{" "}
                            None
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile Sticky Input Footer */}
          <div className="md:hidden shrink-0 border-t border-border-subtle bg-background-surface px-4 pt-4 pb-8 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
            {taskInputForm}
          </div>
        </div>
      </div>

      {/* Right: Task Sidebar */}
      <TaskSidebar
        task={selectedTask}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={updateTask}
        onDelete={(id) => {
          setTasks(tasks.filter((t) => t.id !== id));
          if (selectedTaskId === id) setSelectedTaskId(null); // Auto-close if the active task is deleted
        }}
        onDuplicate={(task) =>
          setTasks([
            ...tasks,
            { ...task, id: crypto.randomUUID(), title: `${task.title} (Copy)` },
          ])
        }
      />

      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={() => {
          setTasks([]);
          setSelectedTaskId(null); // Auto-close sidebar when all tasks are deleted
        }}
        title="Delete All Tasks"
        message="Are you sure you want to delete all tasks? This action will permanently remove everything in your current list."
        confirmText="Delete All"
        isDanger={true}
      />
    </div>
  );
}
