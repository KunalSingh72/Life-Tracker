import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useOverdueTasksGrouped, useTasksStore } from "../../store/tasks.store";
import TaskItem from "../task/TaskItem";

type DialogConfig = { title: string; desc: string; action: () => void } | null;

export default function OverdueTasksCard() {
  const groupedTasks = useOverdueTasksGrouped();
  const { clearAll, clearCompleted } = useTasksStore();

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);

  const toggleSection = (category: string) => {
    setCollapsedSections((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const categories = Object.keys(groupedTasks);
  const totalTasks = categories.reduce(
    (acc, cat) => acc + groupedTasks[cat].length,
    0,
  );
  const completedCount = categories.reduce(
    (acc, cat) => acc + groupedTasks[cat].filter((t) => t.completed).length,
    0,
  );
  const overdueCount = totalTasks - completedCount;

  return (
    <>
      <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-150 border border-border shadow-md bg-bg-card transition-all">
        <CardHeader className="border-b border-border pb-5 relative">
          <CardTitle className="text-2xl font-bold text-center text-red-500">
            Overdue
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-6 overflow-y-auto p-5 custom-scrollbar">
          {/* FIX: Moved Clear Buttons to a Sticky Top Header inside Content */}
          {totalTasks > 0 && (
            <div className="sticky top-0 z-10 flex items-center justify-end gap-4 border-b border-border bg-bg-card pb-3">
              <button
                onClick={() =>
                  setDialogConfig({
                    title: "Clear All Overdue",
                    desc: "Are you sure you want to delete ALL overdue tasks?",
                    action: () => clearAll("overdue"),
                  })
                }
                className="text-sm font-semibold text-text-secondary hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={() =>
                  setDialogConfig({
                    title: "Clear Completed",
                    desc: "Delete all completed overdue tasks?",
                    action: () => clearCompleted("overdue"),
                  })
                }
                disabled={completedCount === 0}
                className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
              >
                Clear completed
              </button>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-border text-base font-medium text-text-secondary bg-bg-main/50">
              No overdue tasks. Great job!
            </div>
          ) : (
            categories.map((category) => {
              const isCollapsed = collapsedSections[category];
              // Sort uncompleted to the top, completed to the bottom
              const tasks = [...groupedTasks[category]].sort(
                (a, b) => Number(a.completed) - Number(b.completed),
              );

              return (
                <div key={category} className="flex flex-col gap-4">
                  <button
                    onClick={() => toggleSection(category)}
                    className="group flex items-center gap-2 text-base font-bold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center justify-center rounded-md p-1 bg-bg-main group-hover:bg-border transition-colors">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    {category}
                    <div className="flex-1 border-b-2 border-border/50 ml-3 transition-colors group-hover:border-border" />
                  </button>

                  {!isCollapsed && (
                    <div className="flex flex-col gap-3">
                      {tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isDraggable={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>

        {/* FIX: Cleaner footer with just the centered items remaining pill */}
        <CardFooter className="justify-center border-t border-border bg-bg-main/20 py-4 relative px-5">
          <span className="text-sm font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            {overdueCount} items remaining
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
