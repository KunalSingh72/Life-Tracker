import { useState } from "react";
import { Plus, Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useUpcomingTasks, useTasksStore } from "../../store/tasks.store";
import { useUIStore } from "@/stores/ui.store";
import { formatUpcomingDate } from "@life-tracker/utils";

type DialogConfig = {
  title: string;
  desc: string;
  confirmText?: string;
  action: () => void;
} | null;

export default function UpcomingTasksCard() {
  const tasks = useUpcomingTasks();
  const { toggleTaskCompletion, clearAll } = useTasksStore();
  const openScheduleModal = useUIStore((state) => state.openScheduleModal);

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);

  const remainingCount = tasks.filter((t) => !t.completed).length;

  return (
    <>
      <Card className="flex flex-col h-200 border border-border shadow-sm bg-bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-center text-text-primary">
            Upcoming
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 custom-scrollbar">
          <button
            onClick={openScheduleModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-main px-4 py-3 text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Upcoming Event
          </button>

          <div className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-secondary bg-bg-main/50">
                No upcoming events.
              </div>
            ) : (
              tasks.map((task) => {
                if (task.completed) return null;

                return (
                  <div
                    key={task.id}
                    className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-bg-main p-3 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <button
                      onClick={() =>
                        setDialogConfig({
                          title: "Complete Early?",
                          desc: "Have you already completed this task before the actual scheduled day?",
                          confirmText: "Yes, complete it",
                          action: () => toggleTaskCompletion(task.id),
                        })
                      }
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-text-secondary bg-transparent hover:border-primary transition-colors"
                    >
                      {task.completed && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </button>

                    <div className="flex-1 truncate text-sm font-medium text-text-primary">
                      {task.title}
                    </div>

                    <div className="shrink-0 rounded-md bg-bg-card px-2 py-1 text-xs font-semibold text-text-secondary border border-border">
                      {task.dueDate ? formatUpcomingDate(task.dueDate) : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-border bg-bg-main/20 py-3 relative">
          {tasks.length > 0 && (
            <button
              onClick={() =>
                setDialogConfig({
                  title: "Clear All Upcoming",
                  desc: "Are you sure you want to delete ALL upcoming tasks? This cannot be undone.",
                  confirmText: "Clear All",
                  action: () => clearAll("upcoming"),
                })
              }
              className="absolute left-4 text-xs font-semibold text-text-secondary hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
          <span className="text-xs font-bold text-text-secondary">
            {remainingCount} upcoming events
          </span>
        </CardFooter>
      </Card>

      <ConfirmDialog
        isOpen={!!dialogConfig}
        title={dialogConfig?.title || ""}
        description={dialogConfig?.desc || ""}
        confirmText={dialogConfig?.confirmText || "Confirm"}
        onConfirm={() => {
          dialogConfig?.action();
          setDialogConfig(null);
        }}
        onCancel={() => setDialogConfig(null)}
      />
    </>
  );
}
