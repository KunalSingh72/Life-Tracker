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
      <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-150 border border-border shadow-md bg-bg-card transition-all">
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="text-2xl font-bold text-center text-text-primary">
            Today
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 custom-scrollbar">
          <div className="sticky top-0 z-10 flex flex-col gap-4 bg-bg-card pb-3">
            <TaskInput />

            <div className="flex items-center justify-between gap-2 px-2 border-t border-border pt-4 mt-1">
              <button
                onClick={handleMarkAllCompleted}
                disabled={tasks.length === 0 || remainingCount === 0}
                className="text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
              >
                Mark all done
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
                  className="text-sm font-semibold text-text-secondary hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  onClick={() =>
                    setDialogConfig({
                      title: "Clear Completed",
                      desc: "Delete all completed tasks?",
                      action: () => clearCompleted("today"),
                    })
                  }
                  disabled={tasks.length - remainingCount === 0}
                  className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
                >
                  Clear completed
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-2">
            {tasks.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-border text-base font-medium text-text-secondary bg-bg-main/50">
                No tasks for today. Relax!
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

        <CardFooter className="justify-center border-t border-border bg-bg-main/20 py-4">
          <span className="text-sm font-bold text-text-secondary bg-bg-card px-3 py-1 rounded-full border border-border">
            {remainingCount} items remaining
          </span>
        </CardFooter>
      </Card>

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
