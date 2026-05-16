import { useState } from "react";
import { Plus, Check, Trash2, CornerDownRight } from "lucide-react";
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
      <div className="flex flex-col gap-1 pb-3 pl-[3.25rem] pr-3 pt-1">
        {subTasks.map((st) => (
          <div
            key={st.id}
            className="group flex min-h-[2rem] items-center gap-3 rounded-md px-2 py-1 hover:bg-bg-card transition-colors"
          >
            <CornerDownRight className="h-3 w-3 text-text-secondary/50 shrink-0" />

            <button
              onClick={() => toggleSubTaskCompletion(taskId, st.id)}
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                st.completed
                  ? "border-primary bg-primary text-white"
                  : "border-text-secondary bg-transparent hover:border-primary",
              )}
            >
              {st.completed && <Check className="h-3 w-3" />}
            </button>

            <span
              className={cn(
                "flex-1 truncate text-sm transition-all",
                st.completed
                  ? "text-text-secondary line-through"
                  : "text-text-primary font-medium",
              )}
            >
              {st.title}
            </span>

            <button
              onClick={() =>
                setDialogConfig({
                  title: "Delete Subtask",
                  desc: `Are you sure you want to delete "${st.title}"?`,
                  action: () => deleteSubTask(taskId, st.id),
                })
              }
              className="flex shrink-0 items-center justify-center rounded p-1 text-text-secondary hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <form
          onSubmit={handleAdd}
          className="mt-1 flex items-center gap-3 rounded-md px-2 py-1 focus-within:bg-bg-card transition-colors"
        >
          <CornerDownRight className="h-3 w-3 text-text-secondary/50 shrink-0" />
          <div className="h-4 w-4 shrink-0 rounded-[4px] border border-dashed border-text-secondary/50" />

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
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
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
