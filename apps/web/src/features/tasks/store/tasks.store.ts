import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { isToday, isPast, isFuture, format } from "date-fns";
import { useMemo } from "react";
import type { Task, CreateTaskPayload } from "@life-tracker/types";
import { useGoalsStore } from "../../goals/store/goals.store";

interface TasksState {
  tasks: Task[];
  addTask: (payload: CreateTaskPayload) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (oldIndex: number, newIndex: number) => void;
  
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTaskCompletion: (taskId: string, subTaskId: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  
  clearAll: (view: "today" | "overdue" | "upcoming") => void;
  clearCompleted: (view: "today" | "overdue" | "upcoming") => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (payload) => {
        const id = nanoid();
        const newTask: Task = {
          id,
          title: payload.title,
          priority: payload.priority || "low",
          completed: payload.completed || false,
          dueDate: payload.dueDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          subTasks: payload.subTasks || [],
          order: 0,
          goalId: payload.goalId || null,
          milestoneId: (payload as CreateTaskPayload & { milestoneId?: string | null }).milestoneId || null,
        };

        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        
        if (newTask.goalId) {
          useGoalsStore.getState().syncGoalProgress(newTask.goalId);
        }
        return newTask.id;
      },

      updateTask: (id, updates) => {
        let linkedGoalId: string | null | undefined = null;
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              linkedGoalId = task.goalId;
              return { ...task, ...updates };
            }
            return task;
          }),
        }));
        if (linkedGoalId) useGoalsStore.getState().syncGoalProgress(linkedGoalId);
      },

      toggleTaskCompletion: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }));

        // FIX 3: Tell the Goal to recalculate progress based on this toggled task
        const task = get().tasks.find(t => t.id === id);
        if (task && task.goalId) {
          useGoalsStore.getState().syncGoalProgress(task.goalId);
        }
      },

      deleteTask: (id) => {
        // Grab the task BEFORE deleting it so we know which goal to update
        const taskToDelete = get().tasks.find(t => t.id === id);
        
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        // FIX 4: Tell the Goal to recalculate
        if (taskToDelete && taskToDelete.goalId) {
          useGoalsStore.getState().syncGoalProgress(taskToDelete.goalId);
        }
      },

      reorderTasks: (oldIndex, newIndex) => {
        set((state) => {
          const newTasks = Array.from(state.tasks);
          const [movedTask] = newTasks.splice(oldIndex, 1);
          newTasks.splice(newIndex, 0, movedTask);
          const reorderedTasks = newTasks.map((task, index) => ({
            ...task,
            order: index,
          }));
          return { tasks: reorderedTasks };
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

      toggleSubTaskCompletion: (taskId, subTaskId) => {
        let linkedGoalId: string | null | undefined = null;
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              linkedGoalId = task.goalId;
              const updatedSubTasks = task.subTasks.map((st) =>
                st.id === subTaskId ? { ...st, completed: !st.completed } : st
              );
              // Parent auto-completes if all subtasks are finished
              const allSubTasksCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.completed);
              
              return { 
                ...task, 
                subTasks: updatedSubTasks,
                completed: allSubTasksCompleted ? true : (task.completed && !allSubTasksCompleted ? false : task.completed)
              };
            }
            return task;
          }),
        }));
        if (linkedGoalId) useGoalsStore.getState().syncGoalProgress(linkedGoalId);
      },

      deleteSubTask: (taskId, subTaskId) => {
        let linkedGoalId: string | null | undefined = null;
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              linkedGoalId = task.goalId;
              return { ...task, subTasks: task.subTasks.filter((st) => st.id !== subTaskId) };
            }
            return task;
          }),
        }));
        if (linkedGoalId) useGoalsStore.getState().syncGoalProgress(linkedGoalId);
      },

      clearAll: (view) => {
        set((state) => {
          const remainingTasks = state.tasks.filter((t) => {
            if (!t.dueDate) return true;
            if (view === "today" && isToday(t.dueDate)) return false;
            if (view === "overdue" && isPast(t.dueDate) && !isToday(t.dueDate)) return false;
            if (view === "upcoming" && isFuture(t.dueDate) && !isToday(t.dueDate)) return false;
            return true;
          });
          
          // Note: In a true production app, you might want to iterate deleted tasks and sync goals here. 
          // For now, this bulk clears the specific view.
          return { tasks: remainingTasks };
        });
      },

      clearCompleted: (view) => {
        set((state) => {
          const remainingTasks = state.tasks.filter((t) => {
            if (!t.completed) return true;
            if (!t.dueDate) return true;
            if (view === "today" && isToday(t.dueDate)) return false;
            if (view === "overdue" && isPast(t.dueDate) && !isToday(t.dueDate)) return false;
            if (view === "upcoming" && isFuture(t.dueDate) && !isToday(t.dueDate)) return false;
            return true;
          });
          return { tasks: remainingTasks };
        });
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

export type GroupedOverdueTasks = Record<string, Task[]>;

const formatOverdueCategory = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return format(date, "EEEE"); // "Monday", "Tuesday"
  return format(date, "MMM d, yyyy"); // "May 11, 2024"
};

export const useOverdueTasksGrouped = (): GroupedOverdueTasks => {
  const tasks = useTasksStore((state) => state.tasks);
  return useMemo(() => {
    const overdue = tasks.filter(
      (t) => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate)
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
      .filter((t) => t.dueDate && isFuture(t.dueDate) && !isToday(t.dueDate))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);
};