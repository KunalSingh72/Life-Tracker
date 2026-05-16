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
        className={cn(
          "group flex flex-col rounded-xl border border-border bg-bg-main transition-all",
          task.completed ? "opacity-60" : "hover:border-primary/50",
          isDragging ? "z-50 shadow-lg scale-[1.02]" : "shadow-sm",
        )}
      >
        {/* Main Task Row - Clickable to expand subtasks */}
        <div
          className="flex min-h-14 cursor-pointer items-center gap-3 p-3"
          onClick={() => setShowSubtasks(!showSubtasks)}
        >
          {isDraggable && (
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()} // Prevent expansion when dragging
              className="cursor-grab text-border hover:text-text-secondary active:cursor-grabbing transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompletion(task.id);
            }}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
              task.completed
                ? "border-primary bg-primary text-white"
                : "border-text-secondary bg-transparent hover:border-primary",
            )}
          >
            {task.completed && <Check className="h-3 w-3" />}
          </button>

          <Circle className={cn("h-3 w-3 shrink-0", getPriorityIconClass())} />

          <div
            className="flex-1 overflow-hidden"
            onClick={(e) => {
              // Only stop propagation if we are entering edit mode
              if (!isEditing && !task.completed) {
                e.stopPropagation();
                setIsEditing(true);
                setShowSubtasks(true); // Auto-expand when editing
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
                onClick={(e) => e.stopPropagation()} // Keep focus, don't toggle expansion
                className="w-full bg-transparent text-sm font-medium text-text-primary outline-none"
              />
            ) : (
              <div
                className={cn(
                  "cursor-text truncate text-sm font-medium transition-all hover:text-primary",
                  task.completed
                    ? "line-through text-text-secondary"
                    : "text-text-primary",
                )}
              >
                {task.title}
              </div>
            )}
          </div>

          {/* Indicators & Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {task.subTasks.length > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-bg-card px-2 py-1 text-xs font-semibold text-text-secondary border border-border">
                <ListTree className="h-3 w-3" />
                {completedSubtasksCount}/{task.subTasks.length}
              </div>
            )}

            <div className="flex shrink-0 items-center">
              {isEditing ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="p-1.5 text-primary hover:bg-bg-card rounded-md transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                  }}
                  className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Expansion Chevron */}
            <div className="text-text-secondary/50 group-hover:text-text-secondary transition-colors">
              {showSubtasks ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>

        {/* Subtasks Accordion */}
        {showSubtasks && (
          <div className="border-t border-border border-dashed bg-bg-main/30">
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
