import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
// FIX 1: Removed GoalMilestone, added Task for strict casting
import type { Goal, CreateGoalPayload, Task } from "@life-tracker/types"; 
import { useTasksStore } from "../../tasks/store/tasks.store";
import { useNotesStore } from "../../notes/store/notes.store";

interface GoalsState {
  goals: (Goal & { isManuallyCompleted?: boolean })[];
  addGoal: (payload: CreateGoalPayload) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  toggleManualGoalCompletion: (id: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  syncGoalProgress: (goalId: string) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (payload) => {
        const id = nanoid();
        const now = new Date().toISOString();
        const newGoal = {
          id,
          title: payload.title || "Untitled Goal",
          description: payload.description || "",
          category: payload.category || "personal",
          priority: payload.priority || "medium",
          status: "active" as const,
          progress: 0,
          targetDate: payload.targetDate || null,
          createdAt: now,
          updatedAt: now,
          color: payload.color || "default",
          milestones: [],
          linkedTaskIds: [],
          linkedNoteIds: [],
          isManuallyCompleted: false,
        };

        set((state) => ({ goals: [newGoal, ...state.goals] }));
        return id;
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
          ),
        }));
      },

      deleteGoal: (id) => {
        const tasksStore = useTasksStore.getState();
        const notesStore = useNotesStore.getState();

        const linkedTasks = tasksStore.tasks.filter(t => t.goalId === id);
        linkedTasks.forEach(task => tasksStore.updateTask(task.id, { goalId: null }));

        const linkedNotes = notesStore.notes.filter(n => n.goalId === id);
        linkedNotes.forEach(note => notesStore.updateNote(note.id, { goalId: null }));

        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },

      archiveGoal: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, status: "archived", updatedAt: new Date().toISOString() } : goal
          ),
        }));
      },

      toggleManualGoalCompletion: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id 
              ? { ...goal, isManuallyCompleted: !goal.isManuallyCompleted, updatedAt: new Date().toISOString() } 
              : goal
          ),
        }));
        get().syncGoalProgress(id);
      },

      addMilestone: (goalId, title) => {
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;
            const newMilestones = [
              ...goal.milestones, 
              { id: nanoid(), title, completed: false, order: goal.milestones.length }
            ];
            return { ...goal, milestones: newMilestones, updatedAt: new Date().toISOString() };
          }),
        }));
        get().syncGoalProgress(goalId);
      },

      toggleMilestone: (goalId, milestoneId) => {
        const tasksStore = useTasksStore.getState();
        
        // FIX 2: Strict TypeScript intersection instead of "any"
        const hasLinkedTasks = tasksStore.tasks.some(
          (t) => t.goalId === goalId && (t as Task & { milestoneId?: string | null }).milestoneId === milestoneId
        );

        if (hasLinkedTasks) return;

        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;
            const newMilestones = goal.milestones.map((m) => 
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            );
            return { ...goal, milestones: newMilestones, updatedAt: new Date().toISOString() };
          }),
        }));
        get().syncGoalProgress(goalId);
      },

      deleteMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;
            const newMilestones = goal.milestones.filter((m) => m.id !== milestoneId);
            return { ...goal, milestones: newMilestones, updatedAt: new Date().toISOString() };
          }),
        }));
        get().syncGoalProgress(goalId);
      },

      syncGoalProgress: (goalId) => {
        const tasksStore = useTasksStore.getState();
        const linkedTasks = tasksStore.tasks.filter((t) => t.goalId === goalId);

        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;

            // FIX 3: Declare without initializing to prevent useless assignment error
            let newProgress: number; 
            let updatedMilestones = [...goal.milestones];

            if (goal.milestones.length > 0) {
              updatedMilestones = goal.milestones.map((milestone) => {
                // FIX 2: Strict TypeScript intersection instead of "any"
                const milestoneTasks = linkedTasks.filter(
                  (t) => (t as Task & { milestoneId?: string | null }).milestoneId === milestone.id
                );
                
                if (milestoneTasks.length > 0) {
                  const allTasksDone = milestoneTasks.every((t) => t.completed);
                  return { ...milestone, completed: allTasksDone };
                }
                return milestone;
              });

              const completedMilestones = updatedMilestones.filter((m) => m.completed).length;
              newProgress = Math.round((completedMilestones / updatedMilestones.length) * 100);
            } 
            else if (linkedTasks.length > 0) {
              const completedTasks = linkedTasks.filter((t) => t.completed).length;
              newProgress = Math.round((completedTasks / linkedTasks.length) * 100);
            } 
            else {
              newProgress = goal.isManuallyCompleted ? 100 : 0;
            }

            return { 
              ...goal, 
              milestones: updatedMilestones, 
              progress: newProgress, 
              updatedAt: new Date().toISOString() 
            };
          }),
        }));
      },
    }),
    {
      name: "lifetracker-goals-storage",
    }
  )
);