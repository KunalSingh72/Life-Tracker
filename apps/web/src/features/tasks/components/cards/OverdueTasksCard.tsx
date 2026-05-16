import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useOverdueTasksGrouped, useTasksStore } from "../../store/tasks.store";

type DialogConfig = { title: string; desc: string; action: () => void } | null;

export default function OverdueTasksCard() {
  const groupedTasks = useOverdueTasksGrouped();
  const { toggleTaskCompletion, deleteTask, clearAll } = useTasksStore();

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);

  const toggleSection = (category: string) => {
    setCollapsedSections((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const categories = Object.keys(groupedTasks);
  const totalOverdueCount = categories.reduce(
    (acc, cat) => acc + groupedTasks[cat].length,
    0,
  );

  return (
    <>
      <Card className="flex flex-col h-200 border border-border shadow-sm bg-bg-card">
        <CardHeader className="border-b border-border pb-4 relative">
          <CardTitle className="text-xl font-bold text-center text-red-500">
            Overdue
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 custom-scrollbar">
          {categories.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-secondary bg-bg-main/50">
              No overdue tasks. Great job!
            </div>
          ) : (
            categories.map((category) => {
              const isCollapsed = collapsedSections[category];
              const tasks = groupedTasks[category];

              return (
                <div key={category} className="flex flex-col gap-3">
                  <button
                    onClick={() => toggleSection(category)}
                    className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {category}
                    <div className="flex-1 border-b border-border ml-2" />
                  </button>

                  {!isCollapsed && (
                    <div className="flex flex-col gap-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="group flex min-h-14 items-center gap-3 rounded-xl border border-border bg-bg-main p-3 shadow-sm hover:border-red-500/40 transition-all"
                        >
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-text-secondary bg-transparent hover:border-primary transition-colors"
                          >
                            {task.completed && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </button>

                          <div className="flex-1 truncate text-sm font-medium text-text-primary">
                            {task.title}
                          </div>

                          <button
                            onClick={() =>
                              setDialogConfig({
                                title: "Delete Overdue Task",
                                desc: `Are you sure you want to delete "${task.title}"?`,
                                action: () => deleteTask(task.id),
                              })
                            }
                            className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-text-secondary hover:bg-bg-card hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border bg-bg-main/20 py-3 relative">
          {totalOverdueCount > 0 && (
            <button
              onClick={() =>
                setDialogConfig({
                  title: "Clear All Overdue",
                  desc: "Are you sure you want to delete ALL overdue tasks? This cannot be undone.",
                  action: () => clearAll("overdue"),
                })
              }
              className="absolute left-4 text-xs font-semibold text-text-secondary hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
          <span className="text-xs font-bold text-red-500">
            {totalOverdueCount} overdue items
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
