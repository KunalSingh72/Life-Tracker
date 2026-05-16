import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import TaskInput from "../forms/TaskInput";
import TaskItem from "../task/TaskItem";
import { useTodayTasks, useTasksStore } from "../../store/tasks.store";

type DialogConfig = { title: string; desc: string; action: () => void } | null;

export default function TodayTasksCard() {
  const tasks = useTodayTasks();
  const { reorderTasks, clearAll, clearCompleted, updateTask } =
    useTasksStore();

  // Dynamic Dialog State
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      reorderTasks(oldIndex, newIndex);
    }
  };

  const handleMarkAllCompleted = () => {
    tasks.forEach((task) => {
      if (!task.completed) updateTask(task.id, { completed: true });
    });
  };

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const remainingCount = tasks.filter((t) => !t.completed).length;

  return (
    <>
      <Card className="flex flex-col h-200 border border-border shadow-sm bg-bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-center text-text-primary">
            Today
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 custom-scrollbar">
          <div className="sticky top-0 z-10 flex flex-col gap-3 bg-bg-card pb-2">
            <TaskInput />

            <div className="flex items-center justify-between gap-2 px-1 border-t border-border pt-3 mt-1">
              <button
                onClick={handleMarkAllCompleted}
                disabled={tasks.length === 0 || remainingCount === 0}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Mark all completed
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setDialogConfig({
                      title: "Clear All Tasks",
                      desc: "Are you sure you want to delete ALL tasks for today? This cannot be undone.",
                      action: () => clearAll("today"),
                    })
                  }
                  disabled={tasks.length === 0}
                  className="text-xs font-semibold text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  Clear all
                </button>
                <button
                  onClick={() =>
                    setDialogConfig({
                      title: "Clear Completed",
                      desc: "Are you sure you want to delete all completed tasks? This cannot be undone.",
                      action: () => clearCompleted("today"),
                    })
                  }
                  disabled={tasks.length - remainingCount === 0}
                  className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  Clear completed
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-2">
            {tasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-secondary bg-bg-main/50">
                No tasks for today.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={taskIds}
                  strategy={verticalListSortingStrategy}
                >
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} isDraggable={true} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-border bg-bg-main/20 py-3">
          <span className="text-xs font-bold text-text-secondary">
            {remainingCount} items remaining
          </span>
        </CardFooter>
      </Card>

      {/* Unified Dynamic Dialog */}
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
