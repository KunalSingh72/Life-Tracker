import { useState } from "react";
import {
  X,
  Flag,
  Trash2,
  Copy,
  Plus,
  CheckCircle2,
  Circle,
  ChevronLeft
} from "lucide-react";
import type { Task, Priority, Subtask } from "../types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";

interface TaskSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
}

export function TaskSidebar({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: TaskSidebarProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  if (!task) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...task, title: e.target.value });
  };

  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: "",
      completed: false,
    };
    onUpdate({ ...task, subtasks: [...task.subtasks, newSubtask] });
  };

  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, ...updates } : st,
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const removeSubtask = (subtaskId: string) => {
    onUpdate({
      ...task,
      subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
    });
  };
  const handleEnterToBlur = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden md:block lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Full-Screen Panel */}
      <aside
        className={`fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-50 w-full md:max-w-sm bg-background-surface md:border-l border-border-subtle shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-md transition-colors cursor-pointer md:hidden"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold text-text-secondary text-sm">
              Task Details
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-md transition-colors cursor-pointer hidden md:block"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Status & Title */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => onUpdate({ ...task, completed: !task.completed })}
              className="mt-1 p-1 -ml-1 flex-shrink-0 cursor-pointer"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-accent-primary" />
              ) : (
                <Circle className="w-6 h-6 text-text-secondary hover:text-accent-primary transition-colors" />
              )}
            </button>
            <input
              type="text"
              value={task.title}
              onChange={handleTitleChange}
              onKeyDown={handleEnterToBlur}
              placeholder="Task title"
              className="w-full bg-transparent text-xl font-bold text-text-primary outline-none focus:outline-none border-none rounded-md px-1 -ml-1 transition-all"
            />
          </div>

          {/* Properties */}
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-24 text-sm text-text-secondary">Due Date</span>
              <div className="flex-1">
                <DatePicker
                  value={task.dueDate}
                  onChange={(date) => onUpdate({ ...task, dueDate: date })}
                  align="right"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 text-sm text-text-secondary">Priority</span>
              <div className="flex-1">
                <Select
                  value={task.priority}
                  onChange={(val) =>
                    onUpdate({ ...task, priority: val as Priority })
                  }
                  options={[
                    {
                      value: "none",
                      label: "No Priority",
                      icon: <Flag className="w-4 h-4 text-text-secondary" />,
                    },
                    {
                      value: "low",
                      label: "Low",
                      icon: (
                        <Flag
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                        />
                      ),
                    },
                    {
                      value: "medium",
                      label: "Medium",
                      icon: (
                        <Flag
                          className="w-4 h-4 text-yellow-500"
                          fill="currentColor"
                        />
                      ),
                    },
                    {
                      value: "high",
                      label: "High",
                      icon: (
                        <Flag
                          className="w-4 h-4 text-red-500"
                          fill="currentColor"
                        />
                      ),
                    },
                  ]}
                  align="right"
                />
              </div>
            </div>
          </div>

          <hr className="border-border-subtle" />

          {/* Subtasks */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Subtasks</h4>
            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() =>
                      updateSubtask(st.id, { completed: !st.completed })
                    }
                    className="p-1 -ml-1 cursor-pointer"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-5 h-5 md:w-4 md:h-4 text-accent-primary" />
                    ) : (
                      <Circle className="w-5 h-5 md:w-4 md:h-4 text-text-secondary" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) =>
                      updateSubtask(st.id, { title: e.target.value })
                    }
                    onKeyDown={handleEnterToBlur}
                    placeholder="Add a subtask..."
                    className={`flex-1 bg-transparent text-sm outline-none focus:outline-none border-none py-2 md:py-1 ${st.completed ? "text-text-secondary line-through" : "text-text-primary"}`}
                  />
                  {/* Mobile: opacity-100 to ensure visibility without hover */}
                  <button
                    onClick={() => removeSubtask(st.id)}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-text-secondary hover:text-red-500 transition-opacity p-2 md:p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addSubtask}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors cursor-pointer py-2"
            >
              <Plus className="w-4 h-4" />
              Add subtask
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-subtle flex items-center justify-between bg-background-main/50 shrink-0 mb-safe">
          <button
            onClick={() => onDuplicate(task)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background-surface hover:text-text-primary rounded-md transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </aside>
      {/* Sidebar Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(task.id);
          onClose();
        }}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isDanger={true}
      />
    </>
  );
}
