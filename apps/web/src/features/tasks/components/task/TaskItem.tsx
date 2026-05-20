import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Trash2,
  GripVertical,
  ListTree,
  Circle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Task } from "@life-tracker/types";
import { useTasksStore } from "../../store/tasks.store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import TaskSubtasks from "./TaskSubtasks";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  isDraggable?: boolean;
}

export default function TaskItem({ task, isDraggable = true }: TaskItemProps) {
  const { updateTask, toggleTaskCompletion, deleteTask } = useTasksStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const getPriorityIconClass = () => {
    if (task.priority === "high") return "fill-red-500 text-red-500";
    if (task.priority === "medium") return "fill-yellow-500 text-yellow-500";
    return "fill-green-500 text-green-500";
  };

  const completedSubtasksCount = task.subTasks.filter(
    (st) => st.completed,
  ).length;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners} // FIX: Entire card is now the drag target
        className={cn(
          "group relative flex flex-col rounded-xl border transition-all duration-300",
          task.completed
            ? "border-border bg-bg-main/40 opacity-60 grayscale-[0.2]"
            : "border-border bg-bg-main hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/2 hover:shadow-md",
          isDragging
            ? "z-50 scale-[1.02] rotate-1 shadow-2xl ring-2 ring-primary/40 cursor-grabbing"
            : "cursor-grab shadow-sm",
        )}
      >
        <div
          className="flex min-h-16 items-center gap-4 p-4" // Increased height and padding
          onPointerDown={() => {
            // Allow double-click or standard click to expand without dragging
            if (!isDragging && !isEditing) setShowSubtasks(!showSubtasks);
          }}
        >
          {isDraggable && (
            <div className="shrink-0 text-border opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-text-secondary/50">
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          <button
            onPointerDown={(e) => e.stopPropagation()} // FIX: Prevent dragging when clicking checkbox
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompletion(task.id);
            }}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300", // Larger checkbox
              task.completed
                ? "border-primary bg-primary text-white scale-110" // Pop animation on complete
                : "border-text-secondary/30 bg-transparent hover:border-primary hover:bg-primary/10",
            )}
          >
            {task.completed && <Check className="h-4 w-4" />}
          </button>

          <Circle className={cn("h-3 w-3 shrink-0", getPriorityIconClass())} />

          <div
            className="flex-1 overflow-hidden"
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking text
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditing && !task.completed) {
                setIsEditing(true);
                setShowSubtasks(true);
              }
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="w-full bg-transparent text-base font-semibold text-text-primary outline-none"
              />
            ) : (
              <div
                className={cn(
                  "cursor-text truncate text-base transition-all hover:text-primary", // Larger text
                  task.completed
                    ? "text-text-secondary line-through opacity-70"
                    : "text-text-primary font-semibold",
                )}
              >
                {task.title}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {task.subTasks.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-bg-card px-2.5 py-1 text-xs font-bold text-text-secondary border border-border shadow-sm">
                <ListTree className="h-3.5 w-3.5" />
                {completedSubtasksCount}/{task.subTasks.length}
              </div>
            )}

            <div className="flex shrink-0 items-center">
              {isEditing ? (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="rounded-lg p-2 text-primary hover:bg-bg-card transition-colors"
                >
                  <Check className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                  }}
                  className="rounded-lg p-2 text-text-secondary opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="rounded-lg p-1 text-text-secondary/50 transition-colors hover:bg-bg-card hover:text-text-primary group-hover:text-text-secondary"
            >
              {showSubtasks ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {showSubtasks && (
          <div className="border-t border-border/50 bg-bg-main/30 px-2 pb-2">
            <TaskSubtasks taskId={task.id} subTasks={task.subTasks} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete"
        onConfirm={() => {
          deleteTask(task.id);
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
