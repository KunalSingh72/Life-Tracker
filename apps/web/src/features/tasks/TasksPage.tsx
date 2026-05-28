import { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import {
  startOfDay,
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
  differenceInDays,
  isToday,
  isYesterday,
  isTomorrow,
  format,
  compareDesc,
  compareAsc,
} from "date-fns";
import {
  CalendarDays,
  CalendarRange,
  AlertCircle,
  CheckSquare,
  Trash2,
} from "lucide-react";
import type { Task, Priority } from "@life-tracker/types";

import { TaskSidebar } from "./components/TaskDetails";
import { TaskInput } from "./components/TaskInput";
import { TaskMenu, type TaskView } from "./components/TaskMenu";
import { TaskItem } from "./components/TaskItem";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Select } from "@/components/ui/Select";
import { useUiStore } from "@/stores/ui.store";

const STORAGE_KEY = "life-tracker-tasks";

const getMobileMenuOptions = (counts: {
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
}) => [
  {
    value: "today",
    label: `Today ${counts.today}`,
    icon: <CalendarDays className="w-4 h-4" />,
  },
  {
    value: "upcoming",
    label: `Upcoming ${counts.upcoming}`,
    icon: <CalendarRange className="w-4 h-4 text-accent-primary" />,
  },
  {
    value: "overdue",
    label: `Overdue ${counts.overdue}`,
    icon: <AlertCircle className="w-4 h-4 text-red-500" />,
  },
  {
    value: "completed",
    label: `Completed ${counts.completed}`,
    icon: <CheckSquare className="w-4 h-4" />,
  },
  { value: "trash", label: "Trash Bin", icon: <Trash2 className="w-4 h-4" /> },
];

export default function TasksPage() {
  const { openMobileMenu } = useUiStore();

  const [activeView, setActiveView] = useState<TaskView>("today");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
          const now = new Date();
          return parsed
            .map((t) => {
              const createdAt = t.createdAt || now.toISOString();
              return {
                ...t,
                createdAt,
                dueDate: t.dueDate || format(parseISO(createdAt), "yyyy-MM-dd"),
              };
            })
            .filter((t) => {
              if (t.deletedAt)
                return differenceInDays(now, parseISO(t.deletedAt)) < 7;
              return true;
            });
        }
      }
      return [];
    } catch (error) {
      console.error("Failed to parse tasks", error);
      return [];
    }
  });

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

  // --- Date Math & Filtering Logic ---
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  let todayCount = 0;
  let upcomingCount = 0;
  let overdueCount = 0;
  let completedCount = 0;

  tasks.forEach((task) => {
    if (task.deletedAt) return;
    if (task.completed) {
      completedCount++;
      return;
    }
    const effectiveDate = task.dueDate
      ? parseISO(task.dueDate)
      : parseISO(task.createdAt);

    if (isSameDay(effectiveDate, now)) todayCount++;
    else if (isBefore(effectiveDate, todayStart)) overdueCount++;
    else if (isAfter(effectiveDate, todayEnd)) upcomingCount++;
  });

  const displayedTasks = tasks.filter((task) => {
    if (activeView === "trash") return !!task.deletedAt;
    if (task.deletedAt) return false;

    const effectiveDate = task.dueDate
      ? parseISO(task.dueDate)
      : parseISO(task.createdAt);

    if (activeView === "today")
      return !task.completed && isSameDay(effectiveDate, now);
    if (activeView === "upcoming")
      return !task.completed && isAfter(effectiveDate, todayEnd);
    if (activeView === "completed") return task.completed;
    if (activeView === "overdue")
      return !task.completed && isBefore(effectiveDate, todayStart);

    return false;
  });

  const areAllDisplayedCompleted =
    displayedTasks.length > 0 && displayedTasks.every((t) => t.completed);

  // Group by effective date (so future dates properly map to "Tomorrow" etc.)
  const groupedTasks = displayedTasks.reduce(
    (acc, task) => {
      const effectiveDate = task.dueDate
        ? parseISO(task.dueDate)
        : parseISO(task.createdAt);
      let label = format(effectiveDate, "d MMM yyyy");

      if (isToday(effectiveDate)) label = "Today";
      else if (isYesterday(effectiveDate)) label = "Yesterday";
      else if (isTomorrow(effectiveDate)) label = "Tomorrow";

      if (!acc[label]) acc[label] = { label, date: effectiveDate, tasks: [] };
      acc[label].tasks.push(task);
      return acc;
    },
    {} as Record<string, { label: string; date: Date; tasks: Task[] }>,
  );

  // Upcoming sorts ascending (Tomorrow -> Next Week). Overdue/Completed sort descending (Yesterday -> Last Month)
  const sortedGroups = Object.values(groupedTasks).sort((a, b) =>
    activeView === "upcoming"
      ? compareAsc(a.date, b.date)
      : compareDesc(a.date, b.date),
  );

  const toggleGroup = (label: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setCollapsedGroups(next);
  };

  // --- Actions ---
  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: "none",
      subtasks: [],
      createdAt: new Date().toISOString(),
      dueDate: format(new Date(), "yyyy-MM-dd"),
    };
    if (activeView !== "today") setActiveView("today");
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

  const handleDeleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.deletedAt) setTasks(tasks.filter((t) => t.id !== id));
    else
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t,
        ),
      );
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const handleRestoreTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, deletedAt: undefined } : t)),
    );
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const handleHardDeleteSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const handleDeleteAllDisplayed = () => {
    if (activeView === "trash") {
      const displayedIds = displayedTasks.map((t) => t.id);
      setTasks(tasks.filter((t) => !displayedIds.includes(t.id)));
    } else {
      const nowStr = new Date().toISOString();
      const displayedIds = displayedTasks.map((t) => t.id);
      setTasks(
        tasks.map((t) =>
          displayedIds.includes(t.id) ? { ...t, deletedAt: nowStr } : t,
        ),
      );
    }
    setSelectedTaskId(null);
  };

  const toggleAllDisplayedTasks = () => {
    const displayedIds = displayedTasks.map((t) => t.id);
    setTasks(
      tasks.map((t) =>
        displayedIds.includes(t.id)
          ? { ...t, completed: !areAllDisplayedCompleted }
          : t,
      ),
    );
  };

  return (
    <div className="flex h-full w-full absolute inset-0 z-20 bg-background-surface md:static md:bg-transparent overflow-hidden">
      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
        <div className="flex flex-col h-full max-w-5xl w-full mx-auto relative pb-2 md:pb-0 px-0 md:px-8">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col px-4 pt-2 pb-2 border-b border-border-subtle shrink-0 bg-background-surface">
            <div className="flex items-center justify-between h-14">
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
              <div className="w-40">
                <Select
                  value={activeView}
                  onChange={(val) => setActiveView(val as TaskView)}
                  options={getMobileMenuOptions({
                    today: todayCount,
                    upcoming: upcomingCount,
                    overdue: overdueCount,
                    completed: completedCount,
                  })}
                  align="right"
                />
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden md:flex pt-8 pb-6 flex-col shrink-0">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="bg-linear-to-r from-text-primary via-accent-primary to-text-primary bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
                TODO
              </span>
            </h1>
          </div>

          {/* Desktop Split Layout */}
          <div className="flex flex-1 overflow-hidden md:gap-8">
            <TaskMenu
              activeView={activeView}
              setActiveView={setActiveView}
              counts={{
                today: todayCount,
                upcoming: upcomingCount,
                overdue: overdueCount,
                completed: completedCount,
              }}
            />

            {/* Right Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:mb-8">
              {activeView !== "trash" && (
                <div className="hidden md:block w-full mb-6 shrink-0">
                  <TaskInput
                    value={newTaskTitle}
                    onChange={setNewTaskTitle}
                    onSubmit={handleAddTask}
                  />
                </div>
              )}

              {/* Task Block */}
              <div className="flex-1 flex flex-col min-w-0 md:bg-background-surface md:border border-border-subtle md:rounded-2xl md:shadow-sm overflow-hidden">
                {/* Container Actions */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border-subtle bg-background-main/30 shrink-0">
                  {activeView === "trash" ? (
                    <span className="text-sm font-medium text-text-secondary">
                      Trash empties after 7 days
                    </span>
                  ) : (
                    <button
                      onClick={toggleAllDisplayedTasks}
                      disabled={displayedTasks.length === 0}
                      className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {areAllDisplayedCompleted
                        ? "Mark all undone"
                        : "Mark all done"}
                    </button>
                  )}

                  <button
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    disabled={displayedTasks.length === 0}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activeView === "trash"
                      ? "Empty Trash"
                      : "Delete Displayed"}
                  </button>
                </div>

                {/* Lists Rendering Area */}
                <div className="flex-1 overflow-y-auto p-4">
                  {displayedTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                      No tasks found in {activeView}.
                    </div>
                  ) : (
                    <>
                      {/* Render Flat List for Today and Trash */}
                      {(activeView === "today" || activeView === "trash") && (
                        <div className="space-y-2">
                          {displayedTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              activeView={activeView}
                              isSelected={selectedTaskId === task.id}
                              onSelect={setSelectedTaskId}
                              onToggleCompletion={toggleTaskCompletion}
                              onUpdatePriority={updatePriority}
                              onRestore={handleRestoreTask}
                              onHardDelete={handleHardDeleteSingle}
                              activeDropdown={activeDropdown}
                              setActiveDropdown={setActiveDropdown}
                              dropdownRef={dropdownRef}
                            />
                          ))}
                        </div>
                      )}

                      {/* Render Grouped List for Upcoming, Overdue, and Completed */}
                      {(activeView === "upcoming" ||
                        activeView === "overdue" ||
                        activeView === "completed") && (
                        <div className="space-y-6">
                          {sortedGroups.map((group) => (
                            <div key={group.label} className="flex flex-col">
                              <button
                                onClick={() => toggleGroup(group.label)}
                                className="flex items-center gap-2 text-left font-semibold text-text-primary mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                {collapsedGroups.has(group.label) ? (
                                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                                )}
                                {group.label}
                                <span className="text-xs text-text-secondary font-medium ml-1 bg-background-main border border-border-subtle px-2 py-0.5 rounded-full">
                                  {group.tasks.length}
                                </span>
                              </button>

                              <div
                                className={`space-y-2 pl-1 transition-all duration-200 overflow-hidden ${collapsedGroups.has(group.label) ? "h-0 opacity-0" : "h-auto opacity-100"}`}
                              >
                                {group.tasks.map((task) => (
                                  <TaskItem
                                    key={task.id}
                                    task={task}
                                    activeView={activeView}
                                    isSelected={selectedTaskId === task.id}
                                    onSelect={setSelectedTaskId}
                                    onToggleCompletion={toggleTaskCompletion}
                                    onUpdatePriority={updatePriority}
                                    onRestore={handleRestoreTask}
                                    onHardDelete={handleHardDeleteSingle}
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    dropdownRef={dropdownRef}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {activeView !== "trash" && (
            <div className="md:hidden shrink-0 border-t border-border-subtle bg-background-surface px-4 pt-4 pb-8 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
              <TaskInput
                value={newTaskTitle}
                onChange={setNewTaskTitle}
                onSubmit={handleAddTask}
              />
            </div>
          )}
        </div>
      </div>

      <TaskSidebar
        task={tasks.find((t) => t.id === selectedTaskId) || null}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
        onDuplicate={(task) =>
          setTasks([
            {
              ...task,
              id: crypto.randomUUID(),
              title: `${task.title} (Copy)`,
              createdAt: new Date().toISOString(),
              dueDate: format(new Date(), "yyyy-MM-dd"),
            },
            ...tasks,
          ])
        }
      />

      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllDisplayed}
        title={activeView === "trash" ? "Empty Trash" : "Delete Tasks"}
        message={
          activeView === "trash"
            ? "Are you sure you want to permanently delete all items in the trash? This cannot be undone."
            : `Are you sure you want to move all tasks currently displayed in the '${activeView}' view to the trash?`
        }
        confirmText={activeView === "trash" ? "Empty Trash" : "Delete Tasks"}
        isDanger={true}
      />
    </div>
  );
}
