import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Flag,
  Target,
  Plus,
  Check,
  Trash2,
  ListTree,
  MoreVertical,
  FileText,
  AlertCircle,
  Clock,
  Trophy,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useGoalsStore } from "./store/goals.store";
import { useTasksStore } from "../tasks/store/tasks.store";
import { useNotesStore } from "../notes/store/notes.store";
import TaskItem from "../tasks/components/task/TaskItem";
import NoteEditorModal from "../notes/components/NoteEditorModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { Task, CreateTaskPayload } from "@life-tracker/types";

// Helper type for strict type-checking
type ExtendedTask = Task & { milestoneId?: string | null };

interface GoalDetailPageProps {
  goalId: string;
  onBack: () => void;
  onEditRequest: (goalId: string) => void;
}

export default function GoalDetailPage({
  goalId,
  onBack,
  onEditRequest,
}: GoalDetailPageProps) {
  const {
    goals,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    toggleManualGoalCompletion,
  } = useGoalsStore();
  const { tasks, addTask } = useTasksStore();
  const { notes, addNote, deleteNote } = useNotesStore();

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  // Dictionary to handle multiple task inputs (one for each milestone + standalone)
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const goal = goals.find((g) => g.id === goalId);

  if (!goal) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-300">
        <Target className="h-12 w-12 text-text-secondary opacity-50" />
        <h2 className="text-2xl font-bold text-text-primary">Goal Not Found</h2>
        <button
          onClick={onBack}
          className="mt-4 rounded-xl bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary/90"
        >
          Return to Goals
        </button>
      </div>
    );
  }

  const linkedTasks = tasks.filter(
    (t) => t.goalId === goalId,
  ) as ExtendedTask[];
  const standaloneTasks = linkedTasks.filter((t) => !t.milestoneId);
  const linkedNotes = notes.filter(
    (n) => n.goalId === goalId && n.status === "active",
  );

  const isEmptyGoal = goal.milestones.length === 0 && linkedTasks.length === 0;

  const formattedDate = goal.targetDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(goal.targetDate))
    : "No deadline set";

  const getUrgencyState = () => {
    if (!goal.targetDate || goal.progress === 100 || goal.status === "archived")
      return "normal";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(goal.targetDate);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "approaching";
    return "normal";
  };
  const urgency = getUrgencyState();

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      addMilestone(goal.id, newMilestoneTitle.trim());
      setNewMilestoneTitle("");
    }
  };

  const handleAddTask = (e: React.FormEvent, milestoneId: string | null) => {
    e.preventDefault();
    const key = milestoneId || "standalone";
    const title = taskInputs[key]?.trim();
    if (title) {
      addTask({
        title,
        priority: "medium",
        goalId: goal.id,
        milestoneId,
      } as CreateTaskPayload & { milestoneId: string | null });
      setTaskInputs((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleQuickAddNote = () => {
    const newNoteId = addNote({
      title: "",
      content: "",
      color: "default",
      goalId: goal.id,
    });
    setEditingNoteId(newNoteId);
    setIsNoteEditorOpen(true);
  };

  return (
    <>
      <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {goal.progress === 100 && (
          <div className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-in slide-in-from-top-6 fade-in duration-500 zoom-in-95">
            <Trophy className="h-6 w-6 animate-bounce" />
            <h2 className="text-lg font-extrabold tracking-wide">
              GOAL ACCOMPLISHED
            </h2>
            <Trophy className="h-6 w-6 animate-bounce" />
          </div>
        )}

        <div
          className={cn(
            "mb-8 flex flex-col gap-6 rounded-3xl border bg-bg-card p-6 md:p-8 shadow-sm transition-colors",
            urgency === "overdue" ? "border-red-500/30" : "border-border",
          )}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl bg-bg-main px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary border border-border hover:border-border/80"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Goals
            </button>
            <button
              onClick={() => onEditRequest(goal.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-main text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
                {goal.category}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider border",
                  goal.priority === "high" &&
                    "text-red-500 bg-red-500/10 border-red-500/20",
                  goal.priority === "medium" &&
                    "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
                  goal.priority === "low" &&
                    "text-green-500 bg-green-500/10 border-green-500/20",
                )}
              >
                <Flag className="h-3.5 w-3.5" /> {goal.priority}
              </span>
              {urgency === "overdue" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-500 animate-pulse">
                  <AlertCircle className="h-3.5 w-3.5" /> Overdue
                </span>
              )}
              {urgency === "approaching" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-500">
                  <Clock className="h-3.5 w-3.5" /> Approaching Deadline
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary leading-tight">
              {goal.title}
            </h1>
            {goal.description && (
              <p className="max-w-3xl text-base md:text-lg text-text-secondary leading-relaxed">
                {goal.description}
              </p>
            )}

            <div
              className={cn(
                "flex items-center gap-2 text-sm font-semibold mt-2",
                urgency === "overdue"
                  ? "text-red-500"
                  : urgency === "approaching"
                    ? "text-yellow-500"
                    : "text-text-secondary",
              )}
            >
              <Calendar className="h-4 w-4" /> Target:{" "}
              <span className={cn(urgency === "normal" && "text-text-primary")}>
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-bg-main p-5 border border-border/50 relative overflow-hidden">
            {goal.progress === 100 && (
              <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none" />
            )}
            <div className="flex items-center justify-between text-base font-bold relative z-10">
              <span className="flex items-center gap-2 text-text-primary">
                <Target
                  className={cn(
                    "h-5 w-5",
                    goal.progress === 100 ? "text-green-500" : "text-primary",
                  )}
                />{" "}
                Master Progress
              </span>
              <span
                className={cn(
                  "text-lg",
                  goal.progress === 100 ? "text-green-500" : "text-primary",
                )}
              >
                {goal.progress}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-bg-card border border-border relative z-10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  goal.progress === 100 ? "bg-green-500" : "bg-primary",
                )}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 pb-12">
          {/* LEFT COLUMN: THE HIERARCHICAL ROADMAP */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                <ListTree className="h-5 w-5 text-primary" /> Strategy Roadmap
              </h2>
            </div>

            {/* THE ESCAPE HATCH (Manual Completion for Empty Goals) */}
            {isEmptyGoal && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-bg-card/50 p-8 text-center transition-all hover:border-primary/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">
                    This goal has no roadmap
                  </h3>
                  <p className="mt-2 max-w-sm text-sm font-medium text-text-secondary">
                    You haven't defined any milestones or tasks. You can add
                    them below, or simply mark the goal as accomplished if
                    you've already completed it.
                  </p>
                </div>
                <button
                  onClick={() => toggleManualGoalCompletion(goal.id)}
                  className={cn(
                    "mt-4 flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5",
                    goal.progress === 100
                      ? "bg-text-secondary hover:bg-text-secondary/80"
                      : "bg-primary hover:bg-primary/90",
                  )}
                >
                  {goal.progress === 100
                    ? "Reopen Goal"
                    : "Mark Goal Accomplished"}
                </button>
              </div>
            )}

            {/* MILESTONES & NESTED TASKS */}
            <div className="flex flex-col gap-5">
              {goal.milestones.map((milestone) => {
                const milestoneTasks = linkedTasks.filter(
                  (t) => t.milestoneId === milestone.id,
                );
                const hasTasks = milestoneTasks.length > 0;

                return (
                  <div
                    key={milestone.id}
                    className={cn(
                      "flex flex-col rounded-2xl border transition-all duration-300",
                      milestone.completed
                        ? "border-border bg-bg-main/30 opacity-80"
                        : "border-border bg-bg-card shadow-sm hover:border-primary/30",
                    )}
                  >
                    {/* Milestone Header */}
                    <div className="group flex items-center gap-4 p-4">
                      <button
                        disabled={hasTasks} // Locked by tasks
                        onClick={() =>
                          !hasTasks && toggleMilestone(goal.id, milestone.id)
                        }
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-300 relative",
                          milestone.completed
                            ? "border-primary bg-primary text-white scale-110"
                            : "border-text-secondary/30 bg-bg-main",
                          hasTasks &&
                            !milestone.completed &&
                            "opacity-50 cursor-not-allowed border-dashed",
                        )}
                      >
                        {milestone.completed && <Check className="h-4 w-4" />}
                        {hasTasks && !milestone.completed && (
                          <Lock className="h-3 w-3 absolute -right-2 -bottom-2 text-text-secondary bg-bg-card rounded-full" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span
                          className={cn(
                            "text-base font-bold transition-all",
                            milestone.completed
                              ? "text-text-secondary line-through"
                              : "text-text-primary",
                          )}
                        >
                          {milestone.title}
                        </span>
                        {hasTasks && !milestone.completed && (
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                            Complete tasks to unlock
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMilestone(goal.id, milestone.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Nested Tasks */}
                    <div className="flex flex-col gap-2 px-4 pb-4 pl-[3.25rem]">
                      {milestoneTasks.map((task) => (
                        <div key={task.id} className="scale-[0.98] origin-left">
                          <TaskItem task={task} isDraggable={false} />
                        </div>
                      ))}

                      {/* Milestone-Specific Task Input */}
                      <form
                        onSubmit={(e) => handleAddTask(e, milestone.id)}
                        className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 bg-transparent p-2 transition-colors focus-within:border-primary/50 focus-within:bg-bg-main"
                      >
                        <input
                          type="text"
                          value={taskInputs[milestone.id] || ""}
                          onChange={(e) =>
                            setTaskInputs((prev) => ({
                              ...prev,
                              [milestone.id]: e.target.value,
                            }))
                          }
                          placeholder="Add a task for this milestone..."
                          className="flex-1 bg-transparent px-2 text-sm font-medium text-text-primary outline-none placeholder:font-normal placeholder:text-text-secondary/70"
                        />
                        <button
                          type="submit"
                          disabled={!taskInputs[milestone.id]?.trim()}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}

              {/* Add New Milestone Input */}
              <form
                onSubmit={handleAddMilestone}
                className="mt-2 flex items-center gap-4 rounded-2xl border border-dashed border-border/80 bg-bg-card p-4 transition-colors focus-within:border-primary/50 focus-within:shadow-sm"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-text-secondary/30 bg-bg-main" />
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="Add a new milestone to your roadmap..."
                  className="flex-1 bg-transparent text-base font-medium text-text-primary outline-none placeholder:font-normal placeholder:text-text-secondary"
                />
                <button
                  type="submit"
                  disabled={!newMilestoneTitle.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* STANDALONE TASKS (If no milestones exist, or user created tasks outside milestones) */}
            {(standaloneTasks.length > 0 || goal.milestones.length === 0) && (
              <div className="mt-8 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                  Standalone Tasks
                </h3>
                <div className="flex flex-col gap-3">
                  {standaloneTasks.map((task) => (
                    <TaskItem key={task.id} task={task} isDraggable={false} />
                  ))}
                  <form
                    onSubmit={(e) => handleAddTask(e, null)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-bg-card p-2 transition-colors focus-within:border-primary/50 focus-within:shadow-sm"
                  >
                    <input
                      type="text"
                      value={taskInputs["standalone"] || ""}
                      onChange={(e) =>
                        setTaskInputs((prev) => ({
                          ...prev,
                          ["standalone"]: e.target.value,
                        }))
                      }
                      placeholder="Quick add an unassigned task..."
                      className="flex-1 bg-transparent px-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary/70"
                    />
                    <button
                      type="submit"
                      disabled={!taskInputs["standalone"]?.trim()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RESEARCH & NOTES */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col rounded-3xl border border-border bg-bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">
                  Related Notes
                </h3>
                <span className="text-xs font-semibold text-text-secondary bg-bg-main px-2.5 py-1 rounded-md border border-border">
                  {linkedNotes.length} Attached
                </span>
              </div>
              <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 mb-4">
                {linkedNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-8 text-center bg-bg-main/50">
                    <span className="text-sm font-medium text-text-secondary">
                      Attach research and plans.
                    </span>
                  </div>
                ) : (
                  linkedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setIsNoteEditorOpen(true);
                      }}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-bg-main p-3 transition-colors hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="truncate text-sm font-bold text-text-primary">
                          {note.title || "Untitled Note"}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNoteToDelete(note.id);
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary opacity-0 transition-colors hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={handleQuickAddNote}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-main py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Quick Add Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {isNoteEditorOpen && editingNoteId && (
        <NoteEditorModal
          noteId={editingNoteId}
          onClose={() => {
            setIsNoteEditorOpen(false);
            setEditingNoteId(null);
          }}
        />
      )}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete Linked Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete Note"
        onConfirm={() => {
          if (noteToDelete) deleteNote(noteToDelete);
          setNoteToDelete(null);
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </>
  );
}
