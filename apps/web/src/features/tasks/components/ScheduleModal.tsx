import { useState } from "react";
import { X, Circle, Plus, Check, Trash2 } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useTasksStore } from "../store/tasks.store";
import { Calendar } from "@/components/ui/Calendar";
import type { TaskPriority } from "@life-tracker/types";
import { cn } from "@/lib/utils";

export default function ScheduleModal() {
  const { isScheduleModalOpen, closeScheduleModal } = useUIStore();
  const { tasks, addTask, toggleTaskCompletion, deleteTask } = useTasksStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [activePriority, setActivePriority] = useState<TaskPriority>("low");

  if (!isScheduleModalOpen) return null;

  // Ensure dates are not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      priority: activePriority,
      dueDate: selectedDate.toISOString(),
    });

    setTitle("");
    setActivePriority("low");
  };

  const renderDayMarkers = (date: Date, isSelected: boolean) => {
    // We only need to know if AT LEAST ONE task exists for this day
    const hasTask = tasks.some((t) => {
      if (!t.dueDate || t.completed) return false;
      const taskDate = new Date(t.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });

    if (!hasTask) return null;

    return (
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors",
          isSelected ? "bg-white" : "bg-red-500",
        )}
      />
    );
  };
  // Filter tasks specific to the currently selected date in the modal
  const selectedDateTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const taskDate = new Date(t.dueDate);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  });

  const priorities: { value: TaskPriority; colorClass: string }[] = [
    { value: "high", colorClass: "fill-red-500 text-red-500" },
    { value: "medium", colorClass: "fill-yellow-500 text-yellow-500" },
    { value: "low", colorClass: "fill-green-500 text-green-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg-card p-6 shadow-xl flex flex-col gap-6 max-h-[90vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Schedule</h2>
          <button
            onClick={closeScheduleModal}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          minDate={today} // Prevents past date selection
          renderDayMarkers={renderDayMarkers}
        />

        {/* Dynamic Task Input for Selected Date */}
        <form
          onSubmit={handleAddTask}
          className="flex flex-col gap-3 rounded-xl border border-border p-3 bg-bg-main/50"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Add task for ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              autoComplete="off"
              className="flex-1 rounded-lg border border-border bg-bg-main px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 px-1">
            {priorities.map((p) => (
              <label
                key={p.value}
                className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold capitalize text-text-secondary transition-colors hover:text-text-primary"
              >
                <input
                  type="radio"
                  name="modalPriority"
                  value={p.value}
                  checked={activePriority === p.value}
                  onChange={() => setActivePriority(p.value)}
                  className="hidden"
                />
                <Circle
                  className={cn(
                    "h-3.5 w-3.5 transition-opacity",
                    activePriority === p.value
                      ? p.colorClass
                      : "text-text-secondary opacity-40",
                  )}
                />
                {p.value}
              </label>
            ))}
          </div>
        </form>

        {/* Selected Date Task List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center text-sm text-text-secondary py-4">
              No tasks scheduled for this date.
            </div>
          ) : (
            selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className="group flex min-h-12 items-center gap-3 rounded-xl border border-border bg-bg-main p-2 shadow-sm transition-all hover:border-primary/40"
              >
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-text-secondary bg-transparent transition-colors hover:border-primary",
                    task.completed && "border-primary bg-primary",
                  )}
                >
                  {task.completed && <Check className="h-3 w-3 text-white" />}
                </button>

                <Circle
                  className={cn(
                    "h-2 w-2 shrink-0",
                    task.priority === "high"
                      ? "fill-red-500 text-red-500"
                      : task.priority === "medium"
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-green-500 text-green-500",
                  )}
                />

                <div
                  className={cn(
                    "flex-1 truncate text-sm font-medium transition-colors",
                    task.completed
                      ? "text-text-secondary line-through"
                      : "text-text-primary",
                  )}
                >
                  {task.title}
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-card hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
