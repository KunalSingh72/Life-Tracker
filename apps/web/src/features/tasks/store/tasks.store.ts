import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Task, CreateTaskPayload, GroupedOverdueTasks } from "@life-tracker/types";
import { isToday, isPast, isFuture, formatOverdueCategory } from "@life-tracker/utils";

interface TasksState {
  tasks: Task[];
  
  // Actions
  addTask: (payload: CreateTaskPayload) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  
  // Subtask Actions
  addSubTask: (taskId: string, title: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  toggleSubTaskCompletion: (taskId: string, subTaskId: string) => void;
  
  // Bulk Actions
  clearAll: (type: "today" | "overdue" | "upcoming") => void;
  clearCompleted: (type: "today" | "overdue" | "upcoming") => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (payload) => {
        set((state) => {
          const priorityWeight = { high: 0, medium: 1, low: 2 };
          const newTaskPriorityWeight = priorityWeight[payload.priority || "low"];

          // Separate today's tasks to calculate the correct insertion order
          const todayTasks = state.tasks
            .filter((t) => t.dueDate && isToday(t.dueDate))
            .sort((a, b) => a.order - b.order);
          
          const otherTasks = state.tasks.filter((t) => !t.dueDate || !isToday(t.dueDate));

          // Find the index where this new task should be inserted based on priority
          let insertIndex = todayTasks.length;
          for (let i = 0; i < todayTasks.length; i++) {
            const currentTaskWeight = priorityWeight[todayTasks[i].priority];
            if (newTaskPriorityWeight < currentTaskWeight) {
              insertIndex = i;
              break;
            }
          }

          const newTask: Task = {
            id: nanoid(),
            title: payload.title,
            priority: payload.priority || "low",
            completed: payload.completed || false,
            dueDate: payload.dueDate || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            subTasks: payload.subTasks || [],
            order: 0, // Will be recalculated below
          };

          // Insert the task and recalculate orders sequentially
          todayTasks.splice(insertIndex, 0, newTask);
          const reorderedTodayTasks = todayTasks.map((t, index) => ({ ...t, order: index }));

          return { tasks: [...otherTasks, ...reorderedTodayTasks] };
        });
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTaskCompletion: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }));
      },

      reorderTasks: (startIndex, endIndex) => {
        set((state) => {
          // Only reorder "Today" tasks for now as per requirements
          const todayTasks = state.tasks.filter(t => t.dueDate && isToday(t.dueDate)).sort((a, b) => a.order - b.order);
          const otherTasks = state.tasks.filter(t => !t.dueDate || !isToday(t.dueDate));
          
          const result = Array.from(todayTasks);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);

          // Update order properties
          const reorderedTodayTasks = result.map((t, index) => ({ ...t, order: index }));

          return { tasks: [...otherTasks, ...reorderedTodayTasks] };
        });
      },

      addSubTask: (taskId, title) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [...task.subTasks, { id: nanoid(), title, completed: false }],
                }
              : task
          ),
        }));
      },

      deleteSubTask: (taskId, subTaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, subTasks: task.subTasks.filter((st) => st.id !== subTaskId) }
              : task
          ),
        }));
      },

      toggleSubTaskCompletion: (taskId, subTaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.map((st) =>
                    st.id === subTaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : task
          ),
        }));
      },

      clearAll: (type) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => {
            if (!t.dueDate) return true;
            if (type === "today" && isToday(t.dueDate)) return false;
            if (type === "overdue" && isPast(t.dueDate) && !t.completed) return false;
            if (type === "upcoming" && isFuture(t.dueDate)) return false;
            return true;
          }),
        }));
      },

      clearCompleted: (type) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => {
            if (!t.dueDate || !t.completed) return true;
            if (type === "today" && isToday(t.dueDate)) return false;
            if (type === "overdue" && isPast(t.dueDate)) return false;
            if (type === "upcoming" && isFuture(t.dueDate)) return false;
            return true;
          }),
        }));
      },
    }),
    {
      name: "lifetracker-tasks-storage",
    }
  )
);

// --- Custom Hooks for View Layer Orchestration --- //

export const useTodayTasks = () => {
  const tasks = useTasksStore((state) => state.tasks);

  return useMemo(() => {
    return tasks
      .filter((t) => t.dueDate && isToday(t.dueDate))
      .sort((a, b) => a.order - b.order);
  }, [tasks]);
};

export const useOverdueTasksGrouped = (): GroupedOverdueTasks => {
  const tasks = useTasksStore((state) => state.tasks);

  return useMemo(() => {
    const overdue = tasks.filter(
      (t) => t.dueDate && isPast(t.dueDate) && !t.completed
    );

    return overdue.reduce((groups: GroupedOverdueTasks, task) => {
      const category = formatOverdueCategory(task.dueDate!);
      if (!groups[category]) groups[category] = [];
      groups[category].push(task);
      return groups;
    }, {});
  }, [tasks]);
};
export const useUpcomingTasks = () => {
  const tasks = useTasksStore((state) => state.tasks);

  return useMemo(() => {
    return tasks
      .filter((t) => t.dueDate && isFuture(t.dueDate))
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      );
  }, [tasks]);
};