import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import type { SubTask } from "@life-tracker/types";
import { useTasksStore } from "../../store/tasks.store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

interface TaskSubtasksProps {
  taskId: string;
  subTasks: SubTask[];
}

type DialogConfig = { title: string; desc: string; action: () => void } | null;

export default function TaskSubtasks({ taskId, subTasks }: TaskSubtasksProps) {
  const [newTitle, setNewTitle] = useState("");
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);
  const { addSubTask, toggleSubTaskCompletion, deleteSubTask } =
    useTasksStore();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addSubTask(taskId, newTitle.trim());
      setNewTitle("");
    }
  };

  return (
    <>
      {/* FIX: Visual hierarchy improved with left border and indentation */}
      <div className="ml-8 mt-2 flex flex-col gap-2 border-l-2 border-border/60 pb-3 pl-4 pr-3 pt-1">
        {subTasks.map((st) => (
          <div
            key={st.id}
            className="group flex min-h-10 items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-bg-card shadow-sm border border-transparent hover:border-border"
          >
            <button
              onPointerDown={(e) => e.stopPropagation()} // Prevent parent drag
              onClick={() => toggleSubTaskCompletion(taskId, st.id)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-300",
                st.completed
                  ? "border-primary bg-primary text-white scale-110"
                  : "border-text-secondary/40 bg-transparent hover:border-primary hover:bg-primary/10",
              )}
            >
              {st.completed && <Check className="h-3.5 w-3.5" />}
            </button>

            <span
              className={cn(
                "flex-1 truncate text-sm transition-all",
                st.completed
                  ? "text-text-secondary line-through opacity-70"
                  : "text-text-primary font-medium",
              )}
            >
              {st.title}
            </span>

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                setDialogConfig({
                  title: "Delete Subtask",
                  desc: `Are you sure you want to delete "${st.title}"?`,
                  action: () => deleteSubTask(taskId, st.id),
                })
              }
              className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-text-secondary opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <form
          onSubmit={handleAdd}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors focus-within:bg-bg-card focus-within:shadow-sm focus-within:border focus-within:border-border border border-transparent"
        >
          <div className="h-5 w-5 shrink-0 rounded-md border-2 border-dashed border-text-secondary/30" />

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a subtask..."
            className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:font-normal placeholder:text-text-secondary"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={!!dialogConfig}
        title={dialogConfig?.title || ""}
        description={dialogConfig?.desc || ""}
        confirmText="Delete"
        onConfirm={() => {
          dialogConfig?.action();
          setDialogConfig(null);
        }}
        onCancel={() => setDialogConfig(null)}
      />
    </>
  );
}
